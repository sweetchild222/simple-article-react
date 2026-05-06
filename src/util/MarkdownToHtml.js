
import {micromark} from 'micromark'
import {directive, directiveHtml} from 'micromark-extension-directive'
import {frontmatter, frontmatterHtml} from 'micromark-extension-frontmatter'
import {gfm, gfmHtml} from 'micromark-extension-gfm'
import {math, mathHtml} from 'micromark-extension-math'
import {defList, defListHtml } from 'micromark-extension-definition-list'
import {highlightMark, highlightMarkHtml} from 'micromark-extension-highlight-mark'

import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github-dark-dimmed.min.css'

import DOMPurify from 'dompurify';

import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import csharp from 'highlight.js/lib/languages/csharp'
import c from 'highlight.js/lib/languages/c'



const createAdmonition = (name, content) => {

    const titleIconMap = {info:'&#10004;', danger:'&#10006;', note:'&#10140;', tip:'&#9733;', caution:'&#9888;'}
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


const directiveFunc = directiveHtml({

    youtube(directive){            

        const url = directive.attributes.url
        const shorts = directive.attributes.shorts == 'y' ? true : false

        const width = shorts ? 315 : 560
        const height = shorts ? 560 : 315

        const iframe = '<iframe width=' + width + ' height=' + height + ' title=Youtube ' + 'style="border:1px solid gray" '
                        + ' allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;" '
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



hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('c', c)


const adjustStyle = (html) => {

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html')

    doc.querySelectorAll('pre').forEach(tag => {

        tag.style.fontSize='18px'

        if(tag.firstChild.nodeName == 'CODE') {
            tag.firstChild.style.borderRadius = '3px'
            hljs.highlightElement(tag.firstChild)
        }
    })


    doc.querySelectorAll('img').forEach(tag => {

        const div = document.createElement("div");

        div.style.display='flex'
        div.style.flexDirection='column'
        div.style.alignItems='center'
            
        div.appendChild(tag.cloneNode(true))

        div.firstChild.style.border = '1px solid gray'

        tag.replaceWith(div)
    })

    doc.querySelectorAll('table').forEach(tag => {

        tag.style.width='100%';
        tag.style.borderCollapse='separate';
        tag.style.borderSpacing='0'

        tag.querySelectorAll('thead').forEach(tag => {
            
            const trList = tag.querySelectorAll('tr')

            if(trList.length > 0){
                trList[0].firstElementChild.style.borderRadius = '3px 0 0 0'
                trList[0].lastElementChild.style.borderRadius = '0 3px 0 0'
            }

            trList.forEach(tag => {

                tag.style.backgroundColor='#42444e'
                tag.style.color = '#fff'
                tag.style.textAlign = 'left'

                tag.querySelectorAll('th').forEach(tag => {
                    tag.style.padding='6px 10px'
                })
            })
        })

        let count = 0

        tag.querySelectorAll('tbody').forEach( tag => {

            const trList = tag.querySelectorAll('tr')

            if(trList.length > 0){
                trList[trList.length-1].firstElementChild.style.borderRadius = '0px 0px 0px 3px'
                trList[trList.length-1].lastElementChild.style.borderRadius = '0px 0px 3px 0px'
            }

            trList.forEach(tag => {

                tag.style.backgroundColor= (++count % 2) ? '#eaeaed' : '#FFFFFF';

                const tdList = tag.querySelectorAll('td')

                if(tdList.length > 1)
                    tdList[0].style.borderLeft ='1px solid #c6c9cc';

                tdList.forEach(tag => {
                    tag.style.borderRight ='1px solid #c6c9cc';
                    tag.style.borderBottom = '1px solid #c6c9cc'
                    tag.style.padding='6px 10px'
                })
            })
        })
    })

    return doc.body.innerHTML
}

export default (markdown) => {
          
    
    const text = `

| head1  | head2 | head3 |
| ----- | ------- | ------ |
| adsf  | wef     | wef    |
| wefew | wf      | wef    |
| adsf  | wef     | wef    |
| wefew | wf      | wef    |
| adsf  | wef     | wef    |
| xxx | xxfsdf      | xxc    |

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


<img height="262" width="241" src="http://13.124.193.201:8080/api/blob/article/20260414021819-ee806f8a-e545-4861-9fc9-fc1e34bd19d5.webp" />



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

ㅁㄴㅇㄹ![](http://13.124.193.201:8080/api/blob/article/20260414021617-35a90695-9984-45c0-b574-0cc8de2ceda0.webp)

\`\`\`javascript
const js = a 
\`\`\`

\`\`\`c
#include <stdio.h>
int main()
{
     printf("hello world!");
     return 0;
}
\`\`\`
sdf
::youtube{url="https://www.youtube.com/embed/ZtZ9SEfgJ34" shorts="n"}
sdf

::youtube{url="https://www.youtube.com/embed/eiZIAFU1vCU" shorts="y"}

sdf`

    const extension = [directive(), frontmatter(), gfm(), highlightMark(), math(), defList]

    const htmlExtension = [directiveFunc, frontmatterHtml(), gfmHtml(), highlightMarkHtml, mathHtml(), defListHtml]

    const html = micromark(markdown, {extensions: extension, htmlExtensions: htmlExtension, allowDangerousHtml: true})

    const styleHtml = adjustStyle(html)    
    
    const sanitizedHTML = DOMPurify.sanitize(styleHtml, { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow']});

    return sanitizedHTML
}


