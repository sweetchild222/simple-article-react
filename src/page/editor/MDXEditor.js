import { useState, useRef, useEffect, useImperativeHandle } from 'react'

import PrettyButton from '@gui/PrettyButton.js'
import {Vertical, Horizental} from '@gui/Flex.js'
import ImageCropModal from '@gui/ImageCropModal.js'
import ImagePicker from "@util/ImagePicker.js";
import {blobFromCanvas, drawImage} from "@util/ImageUtil.js";
import Modal from '@gui/Modal.js'

import { LuImagePlus } from "react-icons/lu";
import { PiTrash } from "react-icons/pi";
import { FiYoutube } from "react-icons/fi";
import { LuImageUp } from "react-icons/lu";
import { dracula } from 'thememirror';
import { EditorView } from '@codemirror/view'

import '@mdxeditor/editor/style.css'
import { usePublisher } from '@mdxeditor/gurx'
import i18next from 'i18next'
import ko from './ko.json'
import './MDXEditor.css'

import { MDXEditor, codeMirrorPlugin, InsertSandpack, ShowSandpackInfo,ChangeAdmonitionType, imagePlugin, headingsPlugin, listsPlugin,
  DiffSourceToggleWrapper, CodeMirrorEditor, directivesPlugin, quotePlugin, InsertImage, thematicBreakPlugin, UndoRedo, CodeToggle, CreateLink, ListsToggle,
  AdmonitionDirectiveDescriptor, BoldItalicUnderlineToggles, BlockTypeSelect, sandpackPlugin,  ChangeCodeMirrorLanguage, linkPlugin,
  toolbarPlugin, linkDialogPlugin, insertDirective$, ConditionalContents, Separator, HighlightToggle, StrikeThroughSupSubToggles,
  diffSourcePlugin, InsertTable, InsertThematicBreak, InsertCodeBlock, InsertFrontmatter, InsertAdmonition, insertImage$,
  markdownShortcutPlugin, frontmatterPlugin, tablePlugin, KitchenSinkToolbar, codeBlockPlugin, maxLengthPlugin, ButtonWithTooltip} from '@mdxeditor/editor'


export default function({ref, placeHolder, postImage, markdown, onChange, onParsingError, onUserError}){

  const refEditor = useRef(null);
    
  useEffect(()=>{

    i18next.init({
      lng: 'ko',
      fallbackLng: 'ko',
      resources: {ko: {translation: ko}}
    })

    if (refEditor.current) {
      refEditor.current.focus();
    }

  }, [])


  useImperativeHandle(ref, () => {

    return {
      getMarkdown() {
        return refEditor.current.getMarkdown()
      }
    }
  }, []);


  const YoutubeDirectiveDescriptor = {

    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'youtube'
    },
    attributes: ['id'],
    hasChildren: false,

    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      
      const url = mdastNode.attributes.url
      const shorts = mdastNode.attributes.shorts

      const wdith = (shorts == 'y') ? 315 : 560;
      const height = (shorts == 'y') ? 560 : 315;

      const align = mdastNode.attributes.align

      const alignMap = {'start':'start', 'center':'center', 'end':'end', 'left':'start', 'right':'end'}

      const alignValue = alignMap[align] != null ? alignMap[align] : null
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: alignValue, position:'relative'}}>
          <div style={{position:'relative', display: 'flex', flexDirection: 'column'}}>
            <button style={{position:'absolute', border:'0px', backgroundColor:'white', borderRadius: '0 0 0 3px', alignSelf: 'flex-end'}}
              onClick={() => {
                parentEditor.update(() => {
                  lexicalNode.selectNext()
                  lexicalNode.remove()
                })
              }}
            >
              <PiTrash size={23}/>
            </button>
            <iframe width={wdith} height={height} src={url} title="YouTube" style={{ border: '1px solid gray'}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;"
            ></iframe>
          </div>
        </div>
      )
    }
  }


  const userErrorHandle = (error)=>{

    if(onUserError != null)
      onUserError(error)
  }

  const YouTubeButton = () => {

    const [isModalOpen, setIsModalOpen] = useState(false)

    const insertDirective = usePublisher(insertDirective$)

    const onYoutubeInput = (input) => {

      //const input = 'https://www.youtube.com/watch?v=bQ3eRwlqny0'

      if(input == null || input == '')
        return
      
      try{
        
        const regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm
        
        const match = regex.exec(input)

        if(match.length < 4){
          userErrorHandle('URL이 잘못되었습니다')
          return
        }
        const videoId = match[3]
        const prefix = match[1]
        const shorts = (prefix == 'youtube.com/shorts') ? 'y' : 'n'
        const url = 'https://www.youtube.com/embed/' + videoId
        const align = 'center'

        if(videoId){
          insertDirective({
            name: 'youtube',
            type: 'leafDirective',
            attributes: { url: url, shorts:shorts, align:align},
            children: []
          })
        }
        else{
          userErrorHandle('URL이 잘못되었습니다')
          return
        }
      }
      catch(e){

        userErrorHandle('URL이 잘못되었습니다')
        return
      }
    }

      
    return (
      <div>  
        <ButtonWithTooltip style={{height:'100%'}} onClick={() => {setIsModalOpen(true)}} title="유튜브 삽입"><FiYoutube size={23}/></ButtonWithTooltip>
        <Modal title= {'유튜브 URL을 입력하세요'} type={'input'} isCloseOutsideClick={false} isOpen={isModalOpen} maxLength={2048} onInput={onYoutubeInput} onClose={()=>setIsModalOpen(false)}></Modal>
      </div>
    )
  }


  const ImageFileButton = () =>{

    const insertImage = usePublisher(insertImage$)

    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)
    const [imageFile, setImageFile] = useState(null)

    const refImageCrop = useRef(null)

    const onClickPickFile = async() => {

      const imageFile = await ImagePicker()

      if(imageFile == null)
            return
        
      if(imageFile.format == 'unknown'){
          window.showToast('파일을 사용할 수 없습니다', 'user-error')
          return
      }

      setImageFile(imageFile.file)
      setIsImageCropModalOpen(true)
    }


    const onClickApply = async() => {

      const rect = refImageCrop.current.rect()
      const image = refImageCrop.current.image()
      
      const maxResolution = 512

      const widthRatio = rect.width / maxResolution
      const heightRatio = rect.height / maxResolution

      const ratio = widthRatio > heightRatio ? widthRatio : heightRatio

      const dWidth = ratio > 1 ? Math.round(rect.width / ratio) : rect.width
      const dHeight = ratio > 1 ? Math.round(rect.height / ratio) : rect.height

      const canvas = await drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, dWidth, dHeight)

      const url = await postImage(await blobFromCanvas(canvas))

      if(url == null){
        userErrorHandle('파일을 업로드할 수 없습니다')
        setIsImageCropModalOpen(false)
        return
      }

      setIsImageCropModalOpen(false)

      insertImage({
        src: url,
        altText: '',
        title: ''
      });
    }
    

    return (
      <div>
        <ButtonWithTooltip style={{height:'100%'}} onClick={onClickPickFile} title="이미지 파일 삽입"><LuImageUp size={23}/></ButtonWithTooltip>
        {imageFile && isImageCropModalOpen && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} selectMinWidth={64} onClickApply={onClickApply}/>}
      </div>
    )
  }


  const ImageLinkButton = () =>{

    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')    
    const [isDisabledConfirm, setIsDisabledConfirm] = useState(true)
    
    const refInputUrl = useRef(null)
    const refInputTitle = useRef(null)
    const refInputAlt = useRef(null)

    const insertImage = usePublisher(insertImage$)


    useEffect(()=>{

      setIsDisabledConfirm(imageUrl == '')

    }, [imageUrl])
    

    const insertImageConfirm =() => {

      const url = imageUrl

      const urlRegex = /^(http|https):\/\/[^ "]+$/;

      if(!urlRegex.test(url)){

        setIsImageModalOpen(false)
        userErrorHandle('URL 형식이 잘못되었습니다')
        return
      }

      const alt = refInputAlt.current.value
      const title = refInputTitle.current.value
      
      insertImage({
        src: url,
        altText: alt,
        title: title
      });

      setIsImageModalOpen(false)
    }

    //const aa = '<img style="display:block; margin:auto;" src="http://localhost:9981/api/blob/article/20260629092705-68ee5ee9-8167-4219-9218-290b0655c0f5.webp" />'
    //const aa = '<img style="display:block; margin-left:auto;" src="http://localhost:9981/api/blob/article/20260629092705-68ee5ee9-8167-4219-9218-290b0655c0f5.webp" />'


    const onChangeUrl = (event) => {
      
      const url = event.nativeEvent.target.value

      setImageUrl(url)
    }

    
    const onKeyDownUrl = (event) =>{

        if (event.key === 'Enter')
          refInputTitle.current.focus()
    }

    const onKeyDownTitle = (event) =>{

        if (event.key === 'Enter')
          refInputAlt.current.focus()
    }


    const openModal=()=>{

      if(refInputUrl.current)
        refInputUrl.current.value = ''

      if(refInputTitle.current)
        refInputTitle.current.value = ''

      if(refInputAlt.current)
        refInputAlt.current.value = ''

      setImageUrl('')
      setIsDisabledConfirm(true)      
      setIsImageModalOpen(true)
    }  

    return (
      <div>
        <ButtonWithTooltip style={{height:'100%'}} onClick={openModal} title="이미지 링크 삽입"><LuImagePlus size={23}/></ButtonWithTooltip>
        <Modal title={'이미지 링크를 입력하세요'} type={'custom'} maxLength={2048} isCloseOutsideClick={false} isOpen={isImageModalOpen} onClose={()=>setIsImageModalOpen(false)}>
          <Vertical style={{alignItems: 'center'}}>
            <input ref={refInputUrl} id='input_url' maxLength="2048" type='text' placeholder="https://example.com/flying_bird.png" onKeyDown={onKeyDownUrl} onChange={onChangeUrl} value={imageUrl}></input>
            <div style={{height:'16px'}}/>
            <input ref={refInputTitle} id='input_title' maxLength="256" type='text' placeholder="이미지 제목" onKeyDown={onKeyDownTitle}/>
            <div style={{height:'16px'}}/>
            <input ref={refInputAlt} id='input_alt' maxLength="256" type='text' placeholder="이미지가 없을 경우 대체 이름"/>
            <div style={{height:'16px'}}/>
            <Horizental style={{justifyContent: 'center'}}>
              <PrettyButton disabled={isDisabledConfirm} type='success' onClick={insertImageConfirm} style={{width:'64px'}}>확인</PrettyButton>
              <div style={{width:'16px'}}/>
              <PrettyButton type='cancel' onClick={()=>setIsImageModalOpen(false)} style={{width:'64px'}}>취소</PrettyButton>
            </Horizental>
          </Vertical>
        </Modal>
      </div>
    )
  }


  const whenInAdmonition =(editorInFocus) => {

    const node = editorInFocus?.rootNode

    if (!node || node.getType() !== 'directive')
      return false

    return ['note', 'tip', 'danger', 'info', 'caution'].includes((node).getMdastNode().name)
  }


  const defaultSnippetContent = `
  export default function App() {
    return (
      <div className="App">
        <h1>Hello</h1>
        <h2>Input text</h2>
      </div>
    );
  }`
  

  const sandpackConfig = {

    defaultPreset: 'react',
    presets: [
      {
        label: 'React',
        name: 'react',
        meta: 'live react',
        sandpackTemplate: 'react',
        sandpackTheme: 'light',
        snippetFileName: '/App.js',
        snippetLanguage: 'jsx',
        initialSnippetContent: defaultSnippetContent
      }
    ]
  }


  const CustomToolbar=()=>{

    return(
      <DiffSourceToggleWrapper>
        <ConditionalContents
          options={[
            { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
            { when: (editor) => editor?.editorType === 'sandpack', contents: () => <ShowSandpackInfo /> },
            { fallback: () => (
              <>
                <UndoRedo />
                <Separator/>
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <HighlightToggle />
                <Separator />
                <StrikeThroughSupSubToggles />
                <Separator />
                <ListsToggle />
                <Separator />
                <ConditionalContents
                  options={[{ when: whenInAdmonition, contents: () => <ChangeAdmonitionType /> }, { fallback: () => <BlockTypeSelect /> }]}
                />
                <Separator />
                <CreateLink/>
                <ImageLinkButton/>
                <ImageFileButton/>
                {/* <InsertImage /> */}
                <YouTubeButton />
                <Separator />
                <InsertTable />
                <InsertThematicBreak />
                <Separator />
                <InsertCodeBlock />
                {/* <InsertSandpack /> */}
                <ConditionalContents
                  options={[{
                    when: (editorInFocus) => !whenInAdmonition(editorInFocus),
                    contents: () => (
                      <>
                        <InsertAdmonition />
                      </>
                    )
                  }]}
                />
                <InsertFrontmatter />
              </>
              )
            }
          ]}
        />
      </DiffSourceToggleWrapper>
    )
  }


  dracula.push(EditorView.theme({

    "&": {
      borderRadius:'3px',
      fontSize: '18px',
      fontColor:'red',
      minHeight: "84px"
    },
    ".cm-lineNumbers .cm-gutterElement ":{
      fontSize: '18px'
    },
    ".cm-content": {
      fontSize: '18px'
    },
    ".cm-tooltip": {
      backgroundColor: "white",
      color: "#555",
      border: "1px solid gray",
      borderRadius: "3px",    
    },
    ".cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "#555",
      color: "white"
    }
  }))
  

    
  const plugins = [
    
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({disableImageSettingsButton: true}),
    tablePlugin(),    
    thematicBreakPlugin(),
    frontmatterPlugin(),
    maxLengthPlugin(65535),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'typescript'}),
    // sandpackPlugin({ sandpackConfig: sandpackConfig }),
    codeMirrorPlugin({ codeMirrorExtensions: [dracula], codeBlockLanguages: {javascript: 'javascript', typescript: 'typescript', python: 'python', json:'json', xml:'html', css: 'css', txt: 'txt', csharp:'c#', c:'c'}}),
    directivesPlugin({ directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: markdown}),
    markdownShortcutPlugin(),    
    toolbarPlugin({ toolbarClassName: 'toolbarRoot', toolbarContents: () => (<CustomToolbar />)})
  ]

  

  return (
      <MDXEditor placeholder={placeHolder} suppressHtmlProcessing={false} ref={refEditor} markdown={markdown} onChange={onChange}
        plugins={plugins} contentEditableClassName="prose" onError={onParsingError}
        translation={(key, defaultValue, interpolations) => i18next.t(key, defaultValue, interpolations)}/>    
  )
}