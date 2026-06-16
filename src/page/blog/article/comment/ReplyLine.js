import React, {useState, useContext, useLayoutEffect, useEffect, useRef } from "react";

const useResize = (ref) => {

    const [size, setSize] = useState({ width: 0, height: 0 })
    
    useLayoutEffect(() => {
        
        if (!ref.current)
            return
        
        const observer = new ResizeObserver((entries) => {

            for (let entry of entries) {
                setSize({width: entry.contentRect.width, height: entry.contentRect.height})
            }
        })

        observer.observe(ref.current)

        return () => observer.disconnect()

    }, [ref])

    return size
}


export default function(props) {
        
    const refDiv = useRef(null)
    const {width, height} = useResize(refDiv)    

    const [containerCanvasUrl, setContainerCanvasUrl] = useState(null)

    useEffect(() =>{
                
        if(!(width > 0 && height > 0))
            return

        if(!refDiv.current)
            return

        const childNodes = refDiv.current.parentNode.nextElementSibling.childNodes

        if(!childNodes)
            return
        
        const canvas = document.createElement('canvas')

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        const margin = 5
        const color = 'darkgray'
        const lineWidth = 2

        ctx.strokeStyle= color
        ctx.lineWidth = lineWidth

        const circleWidth = width - (margin + margin)

        let lastY = 0
        
        for(const child of childNodes) {

            let div = null

            if(child.id == 'replyButton' && !props.isShowReplies)
                div = child
            else if(child.id == 'replyDiv' && props.isShowReplies)
                div = child.childNodes[0].childNodes[0]

            if(div){
                const position = relativePosition(refDiv.current, div)
                const cx = width / 2 + (circleWidth / 2)
                const cy = position.y - (circleWidth / 2 - div.offsetHeight / 2)
                lastY = cy
                const radius = (circleWidth / 2)

                ctx.beginPath()
                ctx.arc(cx, cy, radius, Math.PI / 2, Math.PI)
                ctx.stroke()
            }
        }

        if(lastY > 0){
            ctx.fillStyle = color
            ctx.fillRect(width / 2 - (lineWidth / 2), margin, lineWidth, lastY)
        }        

        setContainerCanvasUrl(canvas.toDataURL())
        
    }, [width, height, props.editableId])



    const relativePosition = (elementA, elementB) =>{

        const positionA = elementGlobalPosition(elementA)
        const positionB = elementGlobalPosition(elementB)

        const x = positionB.x - positionA.x
        const y = positionB.y - positionA.y

        return {x:x, y:y}
    }


    const elementGlobalPosition = (element) => {

        const rect = element.getBoundingClientRect()

        const x = rect.left
        const y = rect.top

        return {x:x, y:y}
    }
    
    return <div ref={refDiv} style={{flex:'1', backgroundImage: containerCanvasUrl && `url(${containerCanvasUrl})`}}></div>
}