import React, {useState, useRef} from "react";
import '@mdxeditor/editor/style.css'
import { usePublisher } from '@mdxeditor/gurx'
import { IoLogoYoutube } from "react-icons/io";
import { CiYoutube } from "react-icons/ci";
import Modal from "../common/Modal";
import i18next from 'i18next'

import ko from './ko.json';
import './MDEditor.css'

i18next.init({
  lng: 'ko',
  fallbackLng: 'ko',  
  resources: {ko: {translation: ko}}
})

import { MDXEditor, codeMirrorPlugin, InsertSandpack, ShowSandpackInfo,ChangeAdmonitionType, imagePlugin, headingsPlugin, listsPlugin, 
  DiffSourceToggleWrapper, directivesPlugin, quotePlugin, InsertImage, thematicBreakPlugin, UndoRedo, CodeToggle, CreateLink, ListsToggle,
  AdmonitionDirectiveDescriptor, BoldItalicUnderlineToggles, BlockTypeSelect, sandpackPlugin,  ChangeCodeMirrorLanguage, linkPlugin, LeafDirective,
  toolbarPlugin, linkDialogPlugin, GenericDirectiveEditor, insertDirective$, ConditionalContents, Separator, HighlightToggle, StrikeThroughSupSubToggles, CodeMirrorEditor,
  diffSourcePlugin, InsertTable, InsertThematicBreak, InsertCodeBlock, InsertFrontmatter, InsertAdmonition, DialogButton, useCodeBlockEditorContext,
  markdownShortcutPlugin, CodeBlockEditor, NestedLexicalEditor, insertJsx$, GenericJsxEditor, jsxPlugin, DirectiveDescriptor, frontmatterPlugin, tablePlugin,
  SandpackConfig, codeBlockPlugin, KitchenSinkToolbar, i18n } from '@mdxeditor/editor'



const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello</h1>
      <h2>Input text</h2>
    </div>
  );
}`



const simpleSandpackConfig = {
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


export default function() {

  const ref = useRef(null)

  const YoutubeDirectiveDescriptor  = {
    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {      
      return node.name === 'youtube'
    },
    attributes: ['id'],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            onClick={() => {
              parentEditor.update(() => {
                lexicalNode.selectNext()
                lexicalNode.remove()
              })
            }}
          >
          삭제
          </button>
          <iframe width="560" height="315" src={`https://www.youtube.com/embed/${mdastNode.attributes.id}`} title="YouTube video player"
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      )
    }
  }


  let insertDirective

  const [isModalOpen, setIsModalOpen] = useState(false)

  const YouTubeButton = () => {

    insertDirective = usePublisher(insertDirective$)
    
    return (<button onClick={() => {setIsModalOpen(true)}} title="유튜브 삽입">YT</button>)
  }

  const onYoutubeInput = (input) => {

    if(input == null || input == '')
      return
    
    try{

      const videoId = new URL(input).searchParams.get('v')

      if(videoId){
        insertDirective({
          name: 'youtube',
          type: 'leafDirective',
          attributes: { id: videoId },
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


  const whenInAdmonition =(editorInFocus) => {

    const node = editorInFocus?.rootNode

    if (!node || node.getType() !== 'directive') {
      return false
    }

    return ['note', 'tip', 'danger', 'info', 'caution'].includes((node).getMdastNode().name)
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
                <InsertImage />
                <YouTubeButton />
                <Separator />
                <InsertTable />    
                <InsertThematicBreak />
                <Separator />
                <InsertCodeBlock />
                <InsertSandpack />
                <ConditionalContents
                  options={[{
                    when: (editorInFocus) => !whenInAdmonition(editorInFocus),
                    contents: () => (
                      <>
                        <Separator />
                        <InsertAdmonition />
                      </>
                    )
                  }]}
                />
                <Separator />
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

  const plugins = [
    toolbarPlugin({toolbarContents: () => (<><CustomToolbar /></>)}),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageAutocompleteSuggestions: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
      imageUploadHandler: async () => Promise.resolve('https://picsum.photos/200/300')
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'js'}),    
    sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
    codeMirrorPlugin({ codeBlockLanguages: { jsx:'react js', tsx:'react ts', js: 'java-script', ts: 'type-script', css: 'CSS', txt: 'plain text'} }),
    directivesPlugin({ directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: markdown }),
    markdownShortcutPlugin()
  ]

  const modal_config = {text: '유튜브 URL을 입력하세요', type: 'input', isCloseOutsideClick: true}

 
  

  return (
      <div style={{
      border: '1px solid #ccc',
      borderRadius: '4px',
      height: '400px', // Set your desired height
      overflowY: 'auto', // Add vertical scrollbar if content overflows
    }}>
      {/* <button onClick={() => ref.current?.setMarkdown('new markdown')}>Set new markdown</button>
      <button onClick={() => console.log(ref.current?.getMarkdown())}>Get markdown</button> */}
      <MDXEditor ref={ref} markdown={markdown} onChange={console.log} readOnly={false} plugins={plugins} contentEditableClassName="prose" onError={(error) => {console.log('adfsadfasdf')}}      
        translation={(key, defaultValue, interpolations) => i18next.t(key, defaultValue, interpolations)}/>
      <Modal config={modal_config} isOpen={isModalOpen} onInput={onYoutubeInput} onClose={()=>setIsModalOpen(false)}></Modal>
      </div>
  )
}

