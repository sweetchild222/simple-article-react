import MDEditor, {commands} from "@uiw/react-md-editor";
import {useContext, useState, useRef, useEffect, useCallback} from 'react';



export default function() {

    const content = 'asdf'

    const [value, setValue] = useState("**Hello world!!!**");
    const markdown = `
        ### Preview Markdown

        \`\`\`jsx
        import React from "react";
        import ReactDOM from "react-dom";
        import MDEditor from '@uiw/react-md-editor';

        export default function App() {
            return (
            <div className="container">
                <MDEditor.Markdown source="Hello Markdown!" />
            </div>
            );
        }
        \`\`\`
    `;


    const onChange = (value) =>{

        console.log(value)

        setValue(value)



    }


  const customImageCommand = {
    name: 'image',
    keyCommand: 'image',
    buttonProps: { 'aria-label': 'Insert image' },
    icon: <span>Image</span>,
    execute: (state, api) => {
        console.log('sdf')
      const imageURL = prompt('Enter the image URL');
      if (imageURL) {
        const modifyText = `![alt text](${imageURL})`;
        api.replaceSelection(modifyText);
      }
    },
  };

//   const help = {
//   name: "help",
//   keyCommand: "help",
//   buttonProps: { "aria-label": "Insert help" },
//   icon: (
//     <svg viewBox="0 0 16 16" width="12px" height="12px">
//       <path
//         d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.9 13H7v-1.8h1.9V13Zm-.1-3.6v.5H7.1v-.6c.2-2.1 2-1.9 1.9-3.2.1-.7-.3-1.1-1-1.1-.8 0-1.2.7-1.2 1.6H5c0-1.7 1.2-3 2.9-3 2.3 0 3 1.4 3 2.3.1 2.3-1.9 2-2.1 3.5Z"
//         fill="currentColor"
//       />
//     </svg>
//   ),
//   execute: (state, api) => {
//     window.open("https://www.markdownguide.org/basic-syntax/", "_blank");
//   }
// };

    // console.log(commands.getCommands())

    return (
        <div className="container" data-color-mode="light">
            {/* <MDEditor autoFocus={true} height='500px' value={value} onChange={setValue}/> */}

            {/* <MDEditor.Markdown source={markdown} /> */}

            <MDEditor
                value={value}
                onChange={onChange}
                commands={[...commands.getCommands(), customImageCommand]}
            />
        </div>
    )
}

