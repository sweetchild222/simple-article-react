import { useContext, useState, useRef } from 'react'
import { usePublisher } from '@mdxeditor/gurx'
import Modal from '../common/Modal'
import i18next from 'i18next'
import ko from './ko.json'
import BeautyButton from '../common/BeautyButton'
import '@mdxeditor/editor/style.css'
import * as api from '../util/Api.js'
import './MDXEditor.css'
import AuthContext from "../util/AuthContext.js";


import { MDXEditor, codeMirrorPlugin, InsertSandpack, ShowSandpackInfo,ChangeAdmonitionType, imagePlugin, headingsPlugin, listsPlugin,
  DiffSourceToggleWrapper, CodeMirrorEditor, directivesPlugin, quotePlugin, InsertImage, thematicBreakPlugin, UndoRedo, CodeToggle, CreateLink, ListsToggle,
  AdmonitionDirectiveDescriptor, BoldItalicUnderlineToggles, BlockTypeSelect, sandpackPlugin,  ChangeCodeMirrorLanguage, linkPlugin,
  toolbarPlugin, linkDialogPlugin, insertDirective$, ConditionalContents, Separator, HighlightToggle, StrikeThroughSupSubToggles,
  diffSourcePlugin, InsertTable, InsertThematicBreak, InsertCodeBlock, InsertFrontmatter, InsertAdmonition, insertImage$,
  markdownShortcutPlugin, frontmatterPlugin, tablePlugin, KitchenSinkToolbar, codeBlockPlugin } from '@mdxeditor/editor'


i18next.init({
  lng: 'ko',
  fallbackLng: 'ko',
  resources: {ko: {translation: ko}}
})



export default function() {

  const ref = useRef(null)

  const YoutubeDirectiveDescriptor = {

    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'youtube'
    },
    attributes: ['id'],
    hasChildren: false,

    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      
      const url = 'https://www.youtube.com/embed/' + mdastNode.attributes.id

      const shorts = mdastNode.attributes.shorts
      const wdith = shorts ? 315 : 560;
      const height = shorts ? 560 : 315;      

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BeautyButton type='warning'
            onClick={() => {
              parentEditor.update(() => {
                lexicalNode.selectNext()
                lexicalNode.remove()
              })
            }}
          >
          삭제
          </BeautyButton>
          <iframe width={wdith} height={height} src={url} title="YouTube"
            style={{ border: '2px solid gray', borderRadius:'4px'  }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;"
          ></iframe>
        </div>
      )
    }
  }

  const YouTubeButton = () => {

    const [isModalOpen, setIsModalOpen] = useState(false)

    const insertDirective = usePublisher(insertDirective$)

    const onYoutubeInput = (input) => {

      if(input == null || input == '')
        return
      
      try{
        
        const regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm
        
        const match = regex.exec(input)
        const videoId = match[3];
        const prefix = match[1]
        
        if(videoId){
          insertDirective({
            name: 'youtube',
            type: 'leafDirective',
            attributes: { id: videoId, shorts:(prefix == 'youtube.com/shorts')},
            children: []
          })
        }
        else{
          window.showToast('URL이 잘못되었습니다', 'error')
          return
        }
      }
      catch(e){

        window.showToast('URL이 잘못되었습니다', 'error')
        return
      }
    }

    const modal_config = {text: '유튜브 URL을 입력하세요', type: 'input', isCloseOutsideClick: true}
  
    return (
      <div>
        <button style={{height:'100%'}} onClick={() => {setIsModalOpen(true)}} title="유튜브 삽입">YT</button>
        <Modal config={modal_config} isOpen={isModalOpen} onInput={onYoutubeInput} onClose={()=>setIsModalOpen(false)}></Modal>
      </div>
    )
  }


  const ImageButton = () =>{

    const [isImageModalOpen, setIsImageModalOpen] = useState(false)

    const insertImage = usePublisher(insertImage$)

    const onImageInput = (input) => {

      const url = 'https://wimg.munhwa.com/news/cms/2026/03/10/news-p.v1.20260310.51577f8740e7440d9f520958edfb26dc_P1.jpg'

      insertImage({
        src: url,
        altText: 'image',
        title: 'title'
      });
    }

    const modal_config = {text: '이미지 URL을 입력하세요', type: 'input', isCloseOutsideClick: true}
  
    return (
      <div>
        <button style={{height:'100%'}} onClick={() => {setIsImageModalOpen(true)}} title="이미지 삽입">IMG</button>
        <Modal config={modal_config} isOpen={isImageModalOpen} onInput={onImageInput} onClose={()=>setIsImageModalOpen(false)}></Modal>
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

  const markdown='test'

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

  const calcScaled = (imageWidth, imageHeight, maxWidth, maxHeight, minWidth, minHeight) => {

    const ratioMaxWidth = maxWidth / imageWidth;
    const ratioMaxHeight = maxHeight / imageHeight;

    const ratioMax = ratioMaxWidth < ratioMaxHeight ? ratioMaxWidth : ratioMaxHeight

    const newWidth = Math.round(imageWidth * ratioMax);
    const newHeight = Math.round(imageHeight * ratioMax);
    
    if(newWidth < minWidth){

      const ratioMin = minWidth / imageWidth;
      const scaledWidth = Math.round(imageWidth * ratioMin);

      const sHeight = Math.round(maxHeight * (1 / ratioMin))
      const sy = Math.round((imageHeight - sHeight) / 2)

      return {sx:0, sy:sy, sWidth:imageWidth, sHeight:sHeight, dx:0, dy:0, dWidth:scaledWidth, dHeight:maxHeight}
    }
    else if(newHeight < minHeight){

      const ratioMin = minHeight / imageHeight;
      const scaledHeight = Math.round(imageHeight * ratioMin);

      const sWidth = Math.round(maxWidth * (1 / ratioMin))
      const sx = Math.round((imageWidth - sWidth) / 2)

      return {sx:sx, sy:0, sWidth:sWidth, sHeight:imageHeight, dx:0, dy:0, dWidth:maxWidth, dHeight:scaledHeight}    
    }
    else{
      return {sx:0, sy:0, sWidth:imageWidth, sHeight:imageHeight, dx:0, dy:0, dWidth:newWidth, dHeight:newHeight}
    }
  }
    

  const scaledImage = (file, maxWidth, maxHeight, minWidth, minHeight) => {

    return new Promise((resolve) => {

      const img = new Image();
      //img.src = path;

      const url = URL.createObjectURL(file)
      img.src = url

      img.onload = () => {

        const scaled = calcScaled(img.width, img.height, maxWidth, maxHeight, minWidth, minHeight)
            
        const canvas = document.createElement('canvas');
        canvas.width = scaled.dWidth;
        canvas.height = scaled.dHeight;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, scaled.sx, scaled.sy, scaled.sWidth, scaled.sHeight, scaled.dx, scaled.dy, scaled.dWidth, scaled.dHeight);
        resolve(canvas)
      }

      img.onerror = () =>{

        resolve(null)
      }
    })
  }



  const postImage = (canvas) => {

    return new Promise((resolve) => {

      canvas.toBlob(async(blob) => {
          
        const formData = new FormData()
        formData.append('image', blob)

        const resArticleImage = await api.postArticleImage(auth.jwt, formData)

        if(resArticleImage == null){
          resolve(null)
          return
        }

        resolve('http://13.124.193.201:8080/api/blob/article/' + resArticleImage.id)
      })
    })
  }


  const uploader = async(file) => {

    const canvas = await scaledImage(file, 512, 512, 64, 64)

    if(canvas == null)
      return

    const url = await postImage(canvas)

    return url    
  }


  const plugins = [
    toolbarPlugin({toolbarContents: () => (<><CustomToolbar /></>)}),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: uploader
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'js'}),
    // sandpackPlugin({ sandpackConfig: sandpackConfig }),
    codeMirrorPlugin({ codeBlockLanguages: { jsx:'react js', tsx:'react ts', js: 'javascript', ts: 'typescript', python: 'Python', json:'json',  css: 'CSS', txt: 'plain text'} }),
    directivesPlugin({ directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: markdown }),
    markdownShortcutPlugin()
  ]

  

    return (
      <div style={{height:'100%', width:'100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{border:'2px solid lightgray', borderRadius:'4px', overflowY:'auto', margin:'5px', flex: 1}}>
          <MDXEditor ref={ref} markdown={markdown} onChange={console.log} readOnly={false} plugins={plugins} contentEditableClassName="prose" onError={(error) => {console.log(error)}}
            translation={(key, defaultValue, interpolations) => i18next.t(key, defaultValue, interpolations)}/>          
        </div>
        <div style={{display: 'flex', flexDirection: 'row-reverse'}}>
          <BeautyButton type='danger'>취소</BeautyButton>
          <BeautyButton type='confirm'>저장</BeautyButton>          
        </div>
      </div>
  )
}

