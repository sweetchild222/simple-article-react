import React, { useState, useRef, useEffect, useCallback } from 'react';

import '../css/DraggableDiv.css'
import { CgFontHeight } from 'react-icons/cg';


const DraggableDiv = () => {
  
  const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  const [selectEdge, setSelectEdge] = useState(-1)
  const [containerCanvasUrl, setContainerCanvasUrl] = useState(transparent)
  const [selectCanvasUrl, setSelectCanvasUrl] = useState(transparent)
  const [coverSize, setCoverSize] = useState({width:0, height:0})  

  

  const selectRef = useRef(null);
  const coverRef = useRef(null);
  const containRef = useRef(null);

  const containerWidth = 300
  const containerHeight = 600
  const selectMinHeight = 100
  const selectMinWidth = 100
  
  const imagePath = '/image/test.png'
    
  const [rect, setRect] = useState(null);

  const calcScale = (containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight) =>{

      const widthScale = containerWidth / imageNaturalWidth
      const heightScale = containerHeight / imageNaturalHeight
      
      return widthScale < heightScale ? widthScale : heightScale
  }


  const calcScaledImageRect = (containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight)=>{

      const scale = calcScale(containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight)

      const imageWidth = imageNaturalWidth * scale
      const imageHeight = imageNaturalHeight * scale

      const widthSpace = (containerWidth - imageWidth) / 2
      const heightSpace = (containerHeight - imageHeight) / 2
      
      const imageX = widthSpace
      const imageY = heightSpace

      return {x: Math.round(imageX), y: Math.round(imageY), width: Math.round(imageWidth), height: Math.round(imageHeight)}
  }


  const createCanvas = (image) => {

      const canvas = document.createElement('canvas')

      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)

      return canvas
  }


  useEffect(()=>{

    const image = new Image()
    image.src = imagePath
    
    image.onload = () => {
      
      const canvas = createCanvas(image)
      setContainerCanvasUrl(canvas.toDataURL())

      const imageRect = calcScaledImageRect(containerWidth, containerHeight, image.naturalWidth, image.naturalHeight)

      setImageRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height)
      setCoverSize({width:imageRect.width, height:imageRect.height})

      const centerX = (containerWidth - selectMinWidth) / 2
      const centerY = (containerHeight - selectMinHeight) / 2

      setRect({ x: centerX, y: centerY, width: selectMinWidth, height: selectMinHeight})

      const cover = coverRef.current
      cover.width = cover.clientWidth;
      cover.height = cover.clientHeight;
    }

  }, [containerCanvasUrl])


  useEffect(() => {

    if(rect == null)
      return

    const imageRect = getImageRect();

    const x = rect.x - imageRect.x
    const y = rect.y - imageRect.y    

    const ctx = coverRef.current.getContext("2d")
    
    ctx.reset()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    
    ctx.fillRect(0, 0, imageRect.width, y)
    ctx.fillRect(0, y + rect.height, imageRect.width, imageRect.height - y - rect.height)  
    ctx.fillRect(0, y, x, rect.height)
    ctx.fillRect(x + rect.width, y, imageRect.width - rect.width - x, rect.height)

    
    
    

  }, [rect])


  const handleMouseDown = useCallback((event) => {    

    if(event.target.className == 'select'){

        const selectRect = event.target.getBoundingClientRect()

        const id = getEdgeID(event.clientX, event.clientY, selectRect)
        
        setSelectEdge(id)        

        if(id == 0)
          selectRef.current.style.cursor = 'grabbing'

        const offsetX = event.clientX - rect.x;
        const offsetY = event.clientY - rect.y;
        
        const containerRect = containRef.current.getBoundingClientRect()

        const x = selectRect.x - containerRect.x
        const y = selectRect.y - containerRect.y

        const width = selectRect.width
        const height = selectRect.height

        setLastOffset(offsetX, offsetY)
        setLastRect(x, y, width, height)
    }

  }, [rect]);

  
  const calcXY = (clientX, clientY) => {

    const offset = getLastOffset()
    
    const x = clientX - offset.x
    const y = clientY - offset.y

    const imageRect = getImageRect()
    
    const endX = imageRect.x + imageRect.width - selectRef.current.offsetWidth
    const endY = imageRect.y + imageRect.height - selectRef.current.offsetHeight

    const calcX = x < imageRect.x ? imageRect.x : (x > endX ? endX : x)
    const calcY = y < imageRect.y ? imageRect.y : (y > endY ? endY : y)    

    return {x:calcX, y:calcY}
  }


  const handleMouseMove = useCallback((event) => {

    if(selectEdge == 0){
  
      const newXY = calcXY(event.clientX, event.clientY)
      
      const lastRect = getLastRect()
    
      setRect({x: newXY.x, y: newXY.y, width: lastRect.width, height: lastRect.height});
    }
    else if(selectEdge ==  -1 && event.target.className == 'select'){

      const id = getEdgeID(event.clientX, event.clientY, event.target.getBoundingClientRect())

      if(id != 0)
        selectRef.current.style.cursor = cursor(id)
      else
        selectRef.current.style.cursor = 'grab'
    }
    else{

        if(selectEdge > 0 && selectEdge <= 4){
          const rect = selectRect(event.clientX, event.clientY, selectEdge)          

          if(rect != null)
            setRect(rect)
        }
    }

  }, [selectEdge]);

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

  const selectRect = (clientX, clientY, selectEdge) => {

      const offset = getLastOffset()

      const x = clientX - offset.x
      const y = clientY - offset.y

      const lastRect = getLastRect()

      const imageRect = getImageRect()


      if(selectEdge == 1){ //left_top
        
        const maxX = lastRect.x + (lastRect.width - selectMinWidth)
        const maxY = lastRect.y + (lastRect.height - selectMinHeight)

        let newX = clamp(x, imageRect.x, maxX)
        let newY = clamp(y, imageRect.y, maxY)
        
        let calcWidth = lastRect.width + (lastRect.x - newX)
        let calcHeight = lastRect.height + (lastRect.y - newY)

        if(calcWidth > calcHeight){

          newY -= (calcWidth - calcHeight)

          if(newY < imageRect.y){
            const overHeight = (imageRect.y - newY)
            calcWidth -= overHeight
            newX += overHeight
            newY = imageRect.y
          }

          calcHeight = calcWidth
        }
        else{

          newX -= (calcHeight - calcWidth)

          if(newX < imageRect.x){
            const overWidth = (imageRect.x - newX)
            calcHeight -= overWidth
            newY += overWidth
            newX = imageRect.x
          }

          calcWidth = calcHeight
        }

        const newWidth = calcWidth < selectMinWidth ? selectMinWidth : calcWidth
        const newHeight = calcHeight < selectMinHeight ? selectMinHeight : calcHeight

        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }
      else if(selectEdge == 2){//right_top

        const maxY = lastRect.y + (lastRect.height - selectMinHeight)

        const newX = lastRect.x
        let newY = clamp(y, imageRect.y, maxY)
        
        let calcWidth = lastRect.width + (x - newX)
        let calcHeight = lastRect.height + (lastRect.y - newY)

        const maxWidth = ((imageRect.x + imageRect.width) - lastRect.x)

        if(calcWidth > maxWidth)
          calcWidth = maxWidth

        if(calcHeight > calcWidth){

          calcWidth = calcHeight

          if(calcWidth > maxWidth){

            const overWidth = (calcWidth - maxWidth)
            calcWidth = maxWidth
            calcHeight -= overWidth
            newY += overWidth
          }
        }
        else{

          newY -= (calcWidth - calcHeight)
                    
          if(newY < imageRect.y){
            const overHeight = (imageRect.y - newY)
            calcWidth -= overHeight
            newY = imageRect.y
          }

          calcHeight = calcWidth
        }

        const newWidth = calcWidth < selectMinWidth ? selectMinWidth : calcWidth
        const newHeight = calcHeight < selectMinHeight ? selectMinHeight : calcHeight
                                          
        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }
      else if(selectEdge == 3){//left_bottom

        const maxX = lastRect.x + (lastRect.width - selectMinWidth)
        
        let newX = clamp(x, imageRect.x, maxX)
        const newY = lastRect.y
        
        let calcWidth = lastRect.width + (lastRect.x - newX)
        let calcHeight = lastRect.height + (y - newY)

        const maxHeight = ((imageRect.y + imageRect.height) - lastRect.y)
        
        if(calcHeight > maxHeight)
          calcHeight = maxHeight                

        if(calcWidth > calcHeight){

          calcHeight = calcWidth

          if(calcHeight > maxHeight){

            const overHeight = (calcHeight - maxHeight)
            calcHeight = maxHeight
            calcWidth -= overHeight
            newX += overHeight
          }
        }
        else{

          newX -= (calcHeight - calcWidth)
                    
          if(newX < imageRect.x){
            const overWidth = (imageRect.x - newX)
            calcHeight -= overWidth
            newX = imageRect.x
          }

          calcWidth = calcHeight
        }

        const newWidth = calcWidth < selectMinWidth ? selectMinWidth : calcWidth
        const newHeight = calcHeight < selectMinHeight ? selectMinHeight : calcHeight

        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }
      else if(selectEdge == 4){//right_bottom

        const newX = lastRect.x
        const newY = lastRect.y
        
        let calcWidth = lastRect.width + (x - newX)
        let calcHeight = lastRect.height + (y - newY)
        
        const maxWidth = ((imageRect.x + imageRect.width) - lastRect.x)
        const maxHeight = ((imageRect.y + imageRect.height) - lastRect.y)

        const max = maxWidth > maxHeight ? maxHeight : maxWidth
        
        if(calcWidth > max)
          calcWidth = max

        if(calcHeight > max)
          calcHeight = max
        
        if(calcWidth > calcHeight)
          calcHeight = calcWidth
        else
          calcWidth = calcHeight

        const newWidth = calcWidth < selectMinWidth ? selectMinWidth : calcWidth
        const newHeight = calcHeight < selectMinHeight ? selectMinHeight : calcHeight

        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }

      return null
  }

  const setLastOffset = (offsetX, offsetY) => {

    const style = selectRef.current.style
    
    style.setProperty('--offset_x', offsetX);
    style.setProperty('--offset_y', offsetY);    
  }


  const getLastOffset = () => {

    const style = selectRef.current.style

    const offsetX = style.getPropertyValue('--offset_x')
    const offsetY = style.getPropertyValue('--offset_y')

    return {x: parseInt(offsetX), y: parseInt(offsetY)}
  }


  const setImageRect = (x, y, width, height) => {

    const style = containRef.current.style

    style.setProperty('--x', x)
    style.setProperty('--y', y)
    style.setProperty('--width', width)
    style.setProperty('--height', height)
  }


  const getImageRect =() => {

    const style = containRef.current.style

    const x = style.getPropertyValue('--x')
    const y = style.getPropertyValue('--y')
    const width = style.getPropertyValue('--width')
    const height = style.getPropertyValue('--height')

    return {x: parseInt(x), y: parseInt(y), width:parseInt(width), height:parseInt(height)}

  }

  const setLastRect = (x, y, width, height) => {

    const style = selectRef.current.style

    style.setProperty('--x', x);
    style.setProperty('--y', y);
    style.setProperty('--width', width);
    style.setProperty('--height', height);
  }

  const getLastRect = () => {

    const style = selectRef.current.style

    const x = style.getPropertyValue('--x')
    const y = style.getPropertyValue('--y')
    const width = style.getPropertyValue('--width')
    const height = style.getPropertyValue('--height')

    return {x: parseInt(x), y: parseInt(y), width:parseInt(width), height:parseInt(height)}
  }


  const cursor = (edgeID) => {

    if(edgeID == 1)
      return 'nw-resize'
    else if(edgeID == 2)
      return 'ne-resize'
    else if(edgeID == 3)
      return 'sw-resize'
    else if(edgeID == 4)
      return 'se-resize'
    else
      return 'default'
  }


  const handleMouseUp = useCallback((event) => {    

    setSelectEdge(-1)

    const id = getEdgeID(event.clientX, event.clientY, event.target.getBoundingClientRect())
          
    selectRef.current.style.cursor = id != 0 ? cursor(id) : 'grab'
        
  }, []);


  const getEdgeIDCore = (x, y, width, height) =>{

      const region = 20

      if(x < region && y < region)
        return 1
      else if(x > (width - region) && y < region)
        return 2
      else if(x < region && y > (height - region))
        return 3
      else if(x > (width - region) && y > (height - region))
        return 4
      else
        return 0
  }


  const getEdgeID = (clientX, clientY, clientRect) =>{
    
    const x = clientX - clientRect.x
    const y = clientY - clientRect.y

    return getEdgeIDCore(x, y, clientRect.width, clientRect.height)
  }


  useEffect(() => {

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <div ref={containRef} className="container" style={{left:'120px', top:'100px', width: `${containerWidth}px`, height: `${containerHeight}px`, backgroundImage: `url(${containerCanvasUrl})`}}>
    <canvas id='canvas' ref={coverRef} className="cover" style={{width: `${coverSize.width}px`, height: `${coverSize.height}px`}}></canvas>
      {rect != null && 
      <div ref={selectRef} className='select' onMouseDown={handleMouseDown}
        style={{ left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`, backgroundImage: `url(${selectCanvasUrl})`}}
      >
      <div className='edge'></div>
      </div>
      }
      
    </div>
  );
};

export default DraggableDiv;