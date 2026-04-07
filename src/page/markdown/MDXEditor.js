import { useContext, useState, useRef, useEffect, useImperativeHandle } from 'react'
import { usePublisher } from '@mdxeditor/gurx'
import Modal from '../../common/Modal.js'
import i18next from 'i18next'
import ko from './ko.json'
import BeautyButton from '../../common/BeautyButton.js'
import '@mdxeditor/editor/style.css'
import { CiYoutube } from "react-icons/ci";
import { LuImagePlus } from "react-icons/lu";


import './MDXEditor.css'
import AuthContext from "../../util/AuthContext.js";
import {pickImageFile} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import ImageScale from "../../util/ImageScale.js";
import { BsTrash } from "react-icons/bs";
import { PiTrash } from "react-icons/pi";
import { FiYoutube } from "react-icons/fi";

import {dracula} from 'thememirror';
import { EditorView } from '@codemirror/view'

import { MDXEditor, codeMirrorPlugin, InsertSandpack, ShowSandpackInfo,ChangeAdmonitionType, imagePlugin, headingsPlugin, listsPlugin,
  DiffSourceToggleWrapper, CodeMirrorEditor, directivesPlugin, quotePlugin, InsertImage, thematicBreakPlugin, UndoRedo, CodeToggle, CreateLink, ListsToggle,
  AdmonitionDirectiveDescriptor, BoldItalicUnderlineToggles, BlockTypeSelect, sandpackPlugin,  ChangeCodeMirrorLanguage, linkPlugin,
  toolbarPlugin, linkDialogPlugin, insertDirective$, ConditionalContents, Separator, HighlightToggle, StrikeThroughSupSubToggles,
  diffSourcePlugin, InsertTable, InsertThematicBreak, InsertCodeBlock, InsertFrontmatter, InsertAdmonition, insertImage$,
  markdownShortcutPlugin, frontmatterPlugin, tablePlugin, KitchenSinkToolbar, codeBlockPlugin, maxLengthPlugin, ButtonWithTooltip} from '@mdxeditor/editor'


export default function({ref, placeHolder, postImage, initMarkdown, readOnly=false, onChange, onParsingError, onUserError}) {

  
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

      const wdith = shorts == 'true' ? 315 : 560;
      const height = shorts == 'true' ? 560 : 315;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position:'relative'}}>
          <div style={{position:'relative', display: 'flex', flexDirection: 'column'}}>
            {!readOnly && <button style={{position:'absolute', border:'0px', backgroundColor:'white', borderRadius: '0 0 0 3px', zIndex:'10', alignSelf: 'flex-end'}}
              onClick={() => {
                parentEditor.update(() => {
                  lexicalNode.selectNext()
                  lexicalNode.remove()
                })
              }}
            >
            <PiTrash size={23}/>
            </button>}
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
        const shorts = (prefix == 'youtube.com/shorts') ? 'true' : 'false'
        const url = 'https://www.youtube.com/embed/' + videoId

        if(videoId){
          insertDirective({
            name: 'youtube',
            type: 'leafDirective',
            attributes: { url: url, shorts:shorts},
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

    const modal_config = {text: '유튜브 URL을 입력하세요', type: 'input', isCloseOutsideClick: true}
  
    return (
      <div>  
        <ButtonWithTooltip style={{height:'100%'}} onClick={() => {setIsModalOpen(true)}} title="유튜브 삽입"><FiYoutube size={23}/></ButtonWithTooltip>
        <Modal config={modal_config} isOpen={isModalOpen} onInput={onYoutubeInput} onClose={()=>setIsModalOpen(false)}></Modal>
      </div>
    )
  }


  const ImageButton = () =>{

    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [isLoadingUpload, setIsLoadingUpload] = useState(false)
    const [isDisabledConfirm, setIsDisabledConfirm] = useState(true)
    
    const refInputUrl = useRef(null)
    const refInputTitle = useRef(null)
    const refInputAlt = useRef(null)

    const insertImage = usePublisher(insertImage$)

    const modal_config = {text: '이미지 정보를 입력하세요', type: 'custom', isCloseOutsideClick: false}

    const selectImage = async () =>{
      
        const imageFile = await pickImageFile()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }

        const blob = await ImageScale(imageFile.file, 512, 512, 64, 64)

        if(blob == null)
          return

        setIsLoadingUpload(true)

        const url = await postImage(blob)
    
        setIsLoadingUpload(false)
        
        if(url == null){
          userErrorHandle('파일을 업로드할 수 없습니다')
          return
        }
        
        setImageUrl(url)
    }

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
      setIsLoadingUpload(false)
      setIsImageModalOpen(true)
    }

    return (
      <div>
        <ButtonWithTooltip style={{height:'100%'}} onClick={openModal} title="이미지 삽입"><LuImagePlus size={23}/></ButtonWithTooltip>
        <Modal config={modal_config} isOpen={isImageModalOpen} onClose={()=>setIsImageModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>          
          <BeautyButton type='warning' isLoading={isLoadingUpload} onClick={selectImage}>파일</BeautyButton>          
          <input ref={refInputUrl} id='input_url' maxLength="2048" type='text' placeholder="https://example.com/flying_bird.png" onKeyDown={onKeyDownUrl} onChange={onChangeUrl} value={imageUrl}></input>
          <input ref={refInputTitle} id='input_title' maxLength="256" type='text' placeholder="이미지 제목" onKeyDown={onKeyDownTitle}/>
          <input ref={refInputAlt} id='input_alt' maxLength="256" type='text' placeholder="이미지가 없을 경우 대체 이름"/>
          <BeautyButton disabled={isDisabledConfirm} type='success' onClick={insertImageConfirm}>확인</BeautyButton>
          <BeautyButton type='cancel' onClick={()=>setIsImageModalOpen(false)}>취소</BeautyButton>
        </div>
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
                <ImageButton/>
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
  

  const draculaReadOnly = Object.assign([], dracula)
  draculaReadOnly.push(EditorView.editable.of(false))
    
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
    codeBlockPlugin({ defaultCodeBlockLanguage: 'ts'}),
    // sandpackPlugin({ sandpackConfig: sandpackConfig }),
    codeMirrorPlugin({ codeMirrorExtensions: readOnly  ? [draculaReadOnly] : [dracula], codeBlockLanguages: { jsx:'react js', tsx:'react ts', js: 'javascript', ts: 'typescript', python: 'Python', json:'json',  css: 'CSS', txt: 'plain text'},  }),
    directivesPlugin({ directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: initMarkdown}),
    markdownShortcutPlugin(),
    maxLengthPlugin(65535),
    toolbarPlugin({ toolbarClassName: readOnly ? 'toolbarRootHide' : 'toolbarRoot', toolbarContents: () => (readOnly ? null : <CustomToolbar />)})
  ]



  return (    
      <MDXEditor placeholder={placeHolder} ref={refEditor} markdown={initMarkdown} onChange={onChange}
        readOnly={readOnly} plugins={plugins} contentEditableClassName="prose" onError={onParsingError}
        translation={(key, defaultValue, interpolations) => i18next.t(key, defaultValue, interpolations)}/>    
  )
}