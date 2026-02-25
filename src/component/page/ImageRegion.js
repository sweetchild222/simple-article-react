import ProfileContext from "../tool/ProfileContext.js";
import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react';
import { useLocation } from 'react-router-dom';
import './ImageRegion.css'
import * as blobToBase64 from '../tool/BlobToBase64.js'

import { useNavigate} from 'react-router-dom';
import * as api from '../tool/Api.js'
import AuthContext from "../tool/AuthContext.js";


export default function({ref, file, onSelectImage,
                        containerWidth=600, containerHeight=300,
                        selectMinWidth=64, selectMinHeight=64}) {

  const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  const [selectEdge, setSelectEdge] = useState(-1)
  const [containerCanvasUrl, setContainerCanvasUrl] = useState(transparent)
  const [coverSize, setCoverSize] = useState({width:0, height:0})
  const [isContain, setContain] = useState(true)
  const [selectRect, setSelectRect] = useState(null)
  const [image, setImage] = useState(null)

  const selectRef = useRef(null)
  const coverRef = useRef(null)
  const containRef = useRef(null)

  const calcContainScale = (containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight) =>{

    const widthScale = containerWidth / imageNaturalWidth
    const heightScale = containerHeight / imageNaturalHeight
    
    return widthScale < heightScale ? widthScale : heightScale
  }


  const calcCoverScale = (containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight) => {
    
    const widthScale = containerWidth / imageNaturalWidth
    const heightScale = containerHeight / imageNaturalHeight  
    
    return widthScale > heightScale ? widthScale : heightScale
  }

  
  const calcContainScaledImageRect = (containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight)=>{

    const scale = calcContainScale(containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight)
    
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
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(image, 0, 0)

    return canvas
  }

  
  useEffect(()=> {

    const image = new Image()
    const url = URL.createObjectURL(file)
    image.src = url

    image.onload = () => {
      
      let imageRect = calcContainScaledImageRect(containerWidth, containerHeight, image.naturalWidth, image.naturalHeight)
            
      if(imageRect.width < selectMinWidth || imageRect.height < selectMinHeight){
        imageRect = {x:0, y:0, width:containerWidth, height:containerHeight}
        setContain(false)
      }
      
      setPropertyImageRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height)
      setCoverSize({width:imageRect.width, height:imageRect.height})

      const centerX = (containerWidth - selectMinWidth) / 2
      const centerY = (containerHeight - selectMinHeight) / 2

      setSelectRect({ x: centerX, y: centerY, width: selectMinWidth, height: selectMinHeight})

      const canvas = createCanvas(image)      
      setContainerCanvasUrl(canvas.toDataURL())      
      
      setImage(image)
      setPropertyIsLoadImage(true)
      URL.revokeObjectURL(url)
    }

  }, [])


  useEffect(() => {

    if(selectRect == null)
      return

    const cover = coverRef.current

    if(cover == null)
      return
    
    cover.width = cover.clientWidth
    cover.height = cover.clientHeight

    const imageRect = getPropertyImageRect()
    
    const x = selectRect.x - imageRect.x
    const y = selectRect.y - imageRect.y

    const ctx = cover.getContext("2d")
    
    ctx.reset()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

    ctx.fillRect(0, 0, imageRect.width, y)
    ctx.fillRect(0, y + selectRect.height, imageRect.width, imageRect.height - y - selectRect.height)
    ctx.fillRect(0, y, x, selectRect.height)
    ctx.fillRect(x + selectRect.width, y, imageRect.width - selectRect.width - x, selectRect.height)


    console.log(containRef.current.classList)
    
    if(containRef.current.classList.length >= 2){
      
      if(containRef.current.classList[1] == 'loading')
        containRef.current.classList.remove('loading')      
    }
            
    const rect = isContain ? calcContainRect(selectRect, imageRect) : calcCoverRect(selectRect, imageRect)
    onSelectImage(rect)

  }, [selectRect])


  const calcContainRect =(selectRect, imageRect) =>{

    const inversScale = 1 / calcContainScale(containerWidth, containerHeight, image.naturalWidth, image.naturalHeight)
    
    const selectX = (selectRect.x - imageRect.x) * inversScale
    const selectY = (selectRect.y - imageRect.y) * inversScale
    const selectWidth = selectRect.width * inversScale
    const selectHeight = selectRect.height * inversScale    

    return {x:Math.floor(selectX), y: Math.floor(selectY), width:Math.ceil(selectWidth), height:Math.ceil(selectHeight)}
  }


  const calcCoverRect = (selectRect, imageRect) =>{

    const scale = calcCoverScale(containerWidth, containerHeight, image.naturalWidth, image.naturalHeight)

    const inversScale = 1 / scale

    const selectX = ((selectRect.x - imageRect.x) + (((image.naturalWidth * scale) - containerWidth) / 2))
    const selectY = ((selectRect.y - imageRect.y) + (((image.naturalHeight * scale) - containerHeight) / 2))
    
    const selectImageX = selectX * inversScale
    const selectImageY = selectY * inversScale
    const selectImageWidth = selectRect.width * inversScale
    const selectImageHeight = selectRect.height * inversScale

    return {x:Math.floor(selectImageX), y: Math.floor(selectImageY), width:Math.ceil(selectImageWidth), height:Math.ceil(selectImageHeight)}
  }


  useImperativeHandle(ref, () => {

    return {
      image() {
        return image
      }
    }
  }, [image]);

  

  const eventMouseMove = useCallback((event) => {

    if(getPropertyIsLoadImage() == false)
      return

    if(selectEdge == 0){
  
      const newXY = calcXY(event.clientX, event.clientY)
      
      const lastRect = getPropertyLastRect()
          
      setSelectRect({x: newXY.x, y: newXY.y, width: lastRect.width, height: lastRect.height});
    }
    else if(selectEdge ==  -1 && event.target.id == 'select'){

      const id = getEdgeID(event.clientX, event.clientY, event.target.getBoundingClientRect())

      if(selectRef.current != null)
        selectRef.current.style.cursor = id != 0 ? cursor(id) : 'grab'
    }
    else if(selectEdge >= 1 && selectEdge <= 4) {

      const rect = dragEdge(event.clientX, event.clientY, selectEdge)

      if(rect != null)
        setSelectRect(rect)
    }

  }, [selectEdge]);


  const onMouseDown = useCallback((event) => {

    event.stopPropagation()

    if(getPropertyIsLoadImage() == false)
      return

    if(event.target.id == 'select'){

      const clientRect = event.target.getBoundingClientRect()

      const id = getEdgeID(event.clientX, event.clientY, clientRect)
      
      setSelectEdge(id)

      if(id == 0)
        selectRef.current.style.cursor = 'grabbing'

      const offsetX = event.clientX - selectRect.x
      const offsetY = event.clientY - selectRect.y
      
      const containerRect = containRef.current.getBoundingClientRect()
      
      const style = window.getComputedStyle(containRef.current);

      const borderLeftWidth = parseInt(style.borderLeftWidth.replace(/\px$/, ""))
      const borderTopWidth = parseInt(style.borderTopWidth.replace(/\px$/, ""))
            
      const x = clientRect.x - containerRect.x - borderLeftWidth
      const y = clientRect.y - containerRect.y - borderTopWidth

      const width = clientRect.width
      const height = clientRect.height

      setPropertyOffset(offsetX, offsetY)
      setPropertyLastRect(x, y, width, height)      
    }

  }, [selectRect]);


  const eventMouseUp = useCallback((event) => {

    event.stopPropagation()
    
    if(getPropertyIsLoadImage() == false)
      return

    setSelectEdge(-1)

    const id = getEdgeID(event.clientX, event.clientY, event.target.getBoundingClientRect())

    if(selectRef.current != null)
      selectRef.current.style.cursor = id != 0 ? cursor(id) : 'grab'
        
  }, [selectEdge]);


  
  const calcXY = (clientX, clientY) => {

    const offset = getPropertyOffset()
    
    const x = clientX - offset.x
    const y = clientY - offset.y

    const imageRect = getPropertyImageRect()
    
    const endX = imageRect.x + imageRect.width - selectRef.current.offsetWidth
    const endY = imageRect.y + imageRect.height - selectRef.current.offsetHeight

    const calcX = x < imageRect.x ? imageRect.x : (x > endX ? endX : x)
    const calcY = y < imageRect.y ? imageRect.y : (y > endY ? endY : y)

    return {x:calcX, y:calcY}
  }



  const dragEdge = (clientX, clientY, selectEdge) => {

    const offset = getPropertyOffset()

    const x = clientX - offset.x
    const y = clientY - offset.y

    const lastRect = getPropertyLastRect()

    const imageRect = getPropertyImageRect()

    if(selectEdge == 1){ //left_top
      
      return dragLeftTop(x, y, imageRect, lastRect)
    }
    else if(selectEdge == 2){//right_top

      return dragRigthTop(x, y, imageRect, lastRect)
    }
    else if(selectEdge == 3){//left_bottom

      return dragLeftBottom(x, y, imageRect, lastRect)
    }
    else if(selectEdge == 4){//right_bottom

      return dragRigthBottom(x, y, imageRect, lastRect)    
    }

    return null
  }

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

  const dragLeftTop = (x, y, imageRect, lastRect) => {

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


  const dragRigthTop = (x, y, imageRect, lastRect) => {

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


  const dragLeftBottom = (x, y, imageRect, lastRect) => {

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
  

  const dragRigthBottom = (x, y, imageRect, lastRect) => {

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



  const setPropertyIsLoadImage = (loaded) => {

    if(containRef.current == null)
      return
    
    const style = containRef.current.style
    style.setProperty('--loaded', loaded)
  }


  const getPropertyIsLoadImage = () => {

    if(containRef.current == null)
      return

    const style = containRef.current.style
    const loaded = style.getPropertyValue('--loaded')

    if(loaded == null)
      return false
    
    return loaded
  }


  const setPropertyOffset = (offsetX, offsetY) => {

    if(selectRef.current == null)
      return

    const style = selectRef.current.style
    
    style.setProperty('--offset_x', offsetX)
    style.setProperty('--offset_y', offsetY)
  }


  const getPropertyOffset = () => {

    if(selectRef.current == null)
      return

    const style = selectRef.current.style

    const offsetX = style.getPropertyValue('--offset_x')
    const offsetY = style.getPropertyValue('--offset_y')

    return {x: parseInt(offsetX), y: parseInt(offsetY)}
  }


  const setPropertyImageRect = (x, y, width, height) => {

    if(containRef.current == null)
      return
    
    const style = containRef.current.style
    
    style.setProperty('--x', x)
    style.setProperty('--y', y)
    style.setProperty('--width', width)
    style.setProperty('--height', height)
  }


  const getPropertyImageRect =() => {

    if(containRef.current == null)
      return

    const style = containRef.current.style

    const x = style.getPropertyValue('--x')
    const y = style.getPropertyValue('--y')
    const width = style.getPropertyValue('--width')
    const height = style.getPropertyValue('--height')

    return {x: parseInt(x), y: parseInt(y), width:parseInt(width), height:parseInt(height)}

  }

  const setPropertyLastRect = (x, y, width, height) => {

    if(selectRef.current == null)
      return

    const style = selectRef.current.style

    style.setProperty('--x', x);
    style.setProperty('--y', y);
    style.setProperty('--width', width);
    style.setProperty('--height', height);
  }

  const getPropertyLastRect = () => {

    if(selectRef.current == null)
      return

    const style = selectRef.current.style

    const x = style.getPropertyValue('--x')
    const y = style.getPropertyValue('--y')
    const width = style.getPropertyValue('--width')
    const height = style.getPropertyValue('--height')

    return {x: parseInt(x), y: parseInt(y), width:parseInt(width), height:parseInt(height)}
  }


  const cursor = (edgeID) => {

    if(edgeID == 1) //left-top
      return 'nw-resize'
    else if(edgeID == 2)//right-top
      return 'ne-resize'
    else if(edgeID == 3)//left-bottom
      return 'sw-resize'
    else if(edgeID == 4)//right-bottom
      return 'se-resize'
    else
      return 'default'
  }




  const getEdgeIDCore = (x, y, width, height) =>{

    const region = 20 //equal --w at edge in css

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

    window.addEventListener('mousemove', eventMouseMove)
    window.addEventListener('mouseup', eventMouseUp)

    return () => {
      window.removeEventListener('mousemove', eventMouseMove)
      window.removeEventListener('mouseup', eventMouseUp)
    };
  }, [eventMouseMove, eventMouseUp])
  

  return (
      <div className='container loading' ref={containRef} style={{width: `${containerWidth}px`, height: `${containerHeight}px`, backgroundImage: `url(${containerCanvasUrl})`, backgroundSize:`${isContain ? 'contain': 'cover'}`}}>
      <canvas className='cover' ref={coverRef} style={{width: `${coverSize.width}px`, height: `${coverSize.height}px`}}/>
        {selectRect != null && 
        <div id='select' className='select' ref={selectRef} onMouseDown={onMouseDown}
          style={{ left: `${selectRect.x}px`, top: `${selectRect.y}px`, width: `${selectRect.width}px`, height: `${selectRect.height}px`, backgroundImage: `url(${transparent})`}}
        >
        <div className='edge'></div>
        </div>
        }      
      </div>      
  )
}
