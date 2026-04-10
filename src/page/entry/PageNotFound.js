
import axios from 'axios';

import AuthContext from "../../util/AuthContext.js";

import React, { useContext} from 'react';

import {micromark} from 'micromark'
import {directive, directiveHtml} from 'micromark-extension-directive'



export default function() {



    const text = `sdfsdf

:::danger
kkkk
:::

fsdfsdfsdfssdf



:::info
kkkkdsafs
:::


:::caution
kkkkdsafs
:::

safdsdfsdf



\`\`\`ts
sdfsdfsdf
asfdadsf
adsf

\`\`\`



sdf
::youtube{url="https://www.youtube.com/embed/ZtZ9SEfgJ34" shorts="n"}
sdf

::youtube{url="https://www.youtube.com/embed/eiZIAFU1vCU" shorts="y"}

sdf`

    const createAdmonition = (name, content)=>{

        const titleIconMap = {info:'&#10004;', danger:'&#10006;', note:'&#9733;', tip:'&#10140;', caution:'&#9888;'}
        const titleColorMap = {info:'#3A8DDF;', danger:'#F22731;', note:'#00DE6D;', tip:'#EFCF00;', caution:'#1D2C79;'}

        const title = name
        const titleIcon = titleIconMap[title]
        const titleColor = titleColorMap[title]
        const titleDiv = '<div style="color: ' + titleColor + ' font-weight:bold;">' + titleIcon + ' ' + title + '</div>'
        
        const contentDiv = '<div style="margin-top:10px; overflow-wrap: break-word;">' + content + '</div>'
        
        const containColorMap = {info:'#EBF3FC;', danger:'#FEE9EA;', note:'#E5FCF0;', tip:'#FDFAE5;', caution:'#E8E9F1;'}
        const containBorderColor = {info:'#3A8DDF;', danger:'#F22731;', note:'#00DE6D;', tip:'#EFCF00;', caution:'#1D2C79;'}

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

    const output = micromark(text, {extensions: [directive()], htmlExtensions: [directiveYoutube]})

    console.log(output)

    return (
        <div dangerouslySetInnerHTML={{ __html: output }}/>        
    );
}

