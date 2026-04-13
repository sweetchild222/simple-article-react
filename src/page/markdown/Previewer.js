
import axios from 'axios';

import AuthContext from "../../util/AuthContext.js";

import React, { useContext, useEffect, useRef} from 'react';


import {micromark} from 'micromark'

import {directive, directiveHtml} from 'micromark-extension-directive'
import {frontmatter, frontmatterHtml} from 'micromark-extension-frontmatter'
import {gfm, gfmHtml} from 'micromark-extension-gfm'
import {math, mathHtml} from 'micromark-extension-math'
import {defList, defListHtml } from 'micromark-extension-definition-list'
import {highlightMark, highlightMarkHtml} from 'micromark-extension-highlight-mark'

import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github-dark-dimmed.min.css'

import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import csharp from 'highlight.js/lib/languages/csharp'
import c from 'highlight.js/lib/languages/c'


hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('c', c)


export default function({markdown}) {


    if(markdown == null){
        return (<div></div>)
    }


    const text = `sdfsdf


:::caution
caution
:::

:::danger
danger
:::

:::note
note
:::

:::info
info
:::

:::tip
info
:::

sdfsd==fsdfsd==f




\`\`\`python
colors = ["red", "blue", "green", "yellow"]
\`\`\`



safdsdfsdf



\`\`\`java
int a = 5;
\`\`\`


\`\`\`css
.headings {
    color: lime;
    text-decoration: overline;
}
.headings2 { 
    color: blue; 
    font-size: 50px; 
}
\`\`\`



\`\`\`javascript
const a = 5;
\`\`\`


\`\`\`json
[
  {a:'4'}
]
\`\`\`

\`\`\`typescript
const a:number = 3;
const b:string = '5';
console.log(a*b)
\`\`\`

\`\`\`xml
<div>
    <label>sdfsdf</label>
</div>
\`\`\`

\`\`\`json
[
  { "나무위키": "여러분이 가꾸어 나가는 지식의 나무" },
  { "위키백과": "우리 모두의 백과사전" },
  { "백과사전": "너희 모두의 백과사전" },
  { "위키낱말사전": "말과 글의 누리" }
]
\`\`\`

\`\`\`csharp
using System;

namespace Namu
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("hello namu!");
        }
    }
}
\`\`\`

\`\`\`javascript
const js = a 
\`\`\`

\`\`\`c
#include <stdio.h>
int main()
{
     printf("hello world!\n");
     return 0;
}
\`\`\`
sdf
::youtube{url="https://www.youtube.com/embed/ZtZ9SEfgJ34" shorts="n"}
sdf

::youtube{url="https://www.youtube.com/embed/eiZIAFU1vCU" shorts="y"}

sdf`

    const createAdmonition = (name, content) => {

        const titleIconMap = {info:'&#9733;', danger:'&#10006;', note:'&#9888;', tip:'&#10004;', caution:'&#10140;'}
        const titleColorMap = {info:'#00DE6D;', danger:'#F22731;', note:'#1D2C79;', tip:'#3A8DDF;', caution:'#EFCF00;'}

        const title = name
        const titleIcon = titleIconMap[title]
        const titleColor = titleColorMap[title]
        const titleDiv = '<div style="color: ' + titleColor + ' font-weight:bold;">' + titleIcon + ' ' + title + '</div>'
        
        const contentDiv = '<div style="margin-top:10px; overflow-wrap: break-word;">' + content + '</div>'
        
        const containColorMap = {info:'#E5FCF0;', danger:'#FEE9EA;', note:'#E8E9F1;', tip:'#EBF3FC;', caution:'#FDFAE5;'}
        const containBorderColor = {info:'#00DE6D;', danger:'#F22731;', note:'#1D2C79;', tip:'#3A8DDF;', caution:'#EFCF00;'}

        const containColor = containColorMap[title]
        const containBorder = containBorderColor[title]
        
        const containDiv = '<div style="background-color:' + containColor + ' border-left: 8px solid ' + containBorder + ' padding:10px;">' + titleDiv + contentDiv + '</div>'

        return containDiv
    }


    const directiveYoutube = directiveHtml({

        youtube(directive){    

            const url = directive.attributes.url
            const shorts = directive.attributes.shorts == 'y' ? true : false

            const width = shorts ? 315 : 560
            const height = shorts ? 560 : 315

            const iframe = '<iframe width=' + width + ' height=' + height + ' title=Youtube ' + 'style="border: p1x solid gray" '
                            + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;" '
                            + ' src="' + url + '"></iframe>'


            const containDiv = '<div style="display:flex; flex-direction:column; align-items:center; position:relative;">'
                            + iframe + '</div>'
        
            this.tag(containDiv)
        },
        info(directive){
            const admonition = createAdmonition(directive.name, directive.content)
            this.tag(admonition)
        },
        danger(directive){
            const admonition = createAdmonition(directive.name, directive.content)
            this.tag(admonition)
        },
        note(directive){
            const admonition = createAdmonition(directive.name, directive.content)
            this.tag(admonition)
        },
        tip(directive){
            const admonition = createAdmonition(directive.name, directive.content)
            this.tag(admonition)
        },
        caution(directive){
            const admonition = createAdmonition(directive.name, directive.content)
            this.tag(admonition)
        }
    })

    const extension = [directive(), frontmatter(), gfm(), highlightMark(), math(), defList]

    const htmlExtension = [directiveYoutube, frontmatterHtml(), gfmHtml(), highlightMarkHtml, mathHtml(), defListHtml]

    const html = micromark(text, {extensions: extension, htmlExtensions: htmlExtension})

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html')

    doc.querySelectorAll('pre').forEach(tag => {
        
        tag.firstChild.style.borderRadius = '3px'
        hljs.highlightElement(tag.firstChild)        
    })    

    return (        
        <div dangerouslySetInnerHTML={{__html: doc.body.innerHTML}} style={{margin:'10px'}}>
        </div>

    );
}


