import {useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react';

import './ImageCropper.css'
import './Spin.css'

export default function({ref, file, containerWidth=768, containerHeight=768, selectMinWidth=128, keepRatio}) {

  const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  const [selectEdge, setSelectEdge] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const [containerCanvasUrl, setContainerCanvasUrl] = useState(transparent)
  const [coverSize, setCoverSize] = useState({width:0, height:0})
  const [isContain, setContain] = useState(true)
  const [selectRect, setSelectRect] = useState(null)
  const [imageSelectRect, setImageSelectRect] = useState(null)
  const [image, setImage] = useState(null)

  const refSelect = useRef(null)
  const refCover = useRef(null)
  const refContain = useRef(null)  
    
  const selectMinHeight = keepRatio != null ? Math.round(selectMinWidth / keepRatio) : selectMinWidth

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


  const createCanvas = (image, sX, sY, sWidth, sHeight, dWidth, dHeight) => {
    
    const canvas = document.createElement('canvas')

    canvas.width = dWidth
    canvas.height = dHeight
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    
    ctx.drawImage(image, sX, sY, sWidth, sHeight, 0, 0, dWidth, dHeight)    

    return canvas
  }



  const createCanvasForCover = (image, dWidth, dHeight) => {

    return createCanvas(image, 0, 0, image.naturalWidth, image.naturalHeight, dWidth, dHeight)
  }


  const createCanvasForContain = (image, dWidth, dHeight) => {

    const scale = calcCoverScale(dWidth, dHeight, image.naturalWidth, image.naturalHeight)
      
    const inversScale = 1 / scale

    const sWidth = Math.round(inversScale * containerWidth)
    const sHeight = Math.round(inversScale * containerHeight)
      
    const sX = ((image.naturalWidth) - (sWidth)) / 2
    const sY = ((image.naturalHeight) - (sHeight)) / 2

    return createCanvas(image, sX, sY, sWidth, sHeight, dWidth, dHeight)      
  }



  useEffect(()=> {
        
    setSelectEdge(-1)
    setIsLoading(true)
    setContainerCanvasUrl(transparent)
    setCoverSize({width:0, height:0})
    setContain(true)
    setSelectRect(null)
    setImage(null)

    const image = new Image()

    const url = URL.createObjectURL(file)
    image.src = url

    image.onload = () => {
      
      let imageRect = calcContainScaledImageRect(containerWidth, containerHeight, image.naturalWidth, image.naturalHeight)

      let isContain = true
                  
      if(imageRect.width < selectMinWidth || imageRect.height < selectMinHeight){
        imageRect = {x:0, y:0, width:containerWidth, height:containerHeight}
        isContain = false
        setContain(false)
      }
      
      const canvas = isContain ? createCanvasForCover(image, imageRect.width, imageRect.height) : createCanvasForContain(image, containerWidth, containerHeight)

      setContainerCanvasUrl(canvas.toDataURL())
            
      setPropertyImageRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height)
      setCoverSize({width:imageRect.width, height:imageRect.height})

      const centerX = (containerWidth - selectMinWidth) / 2
      const centerY = (containerHeight - selectMinHeight) / 2

      setSelectRect({ x: centerX, y: centerY, width: selectMinWidth, height: selectMinHeight})

      
      
      setImage(image)
      setPropertyIsLoadImage(true)
      URL.revokeObjectURL(url)
    }

  }, [file])


  useEffect(() => {

    if(selectRect == null)
      return

    const cover = refCover.current

    if(cover == null)
      return
    
    cover.width = cover.clientWidth
    cover.height = cover.clientHeight

    const imageRect = getPropertyImageRect()
    
    const x = Math.round(selectRect.x - imageRect.x)
    const y = Math.round(selectRect.y - imageRect.y)

    const ctx = cover.getContext("2d")
    
    ctx.reset()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        
    ctx.fillRect(0, 0, imageRect.width, y)
    ctx.fillRect(0, y + selectRect.height, imageRect.width, imageRect.height - y - selectRect.height)
    ctx.fillRect(0, y, x, selectRect.height)
    ctx.fillRect(x + selectRect.width, y, imageRect.width - selectRect.width - x, selectRect.height)

    setIsLoading(false)
    
    const rect = isContain ? calcContainRect(selectRect, imageRect) : calcCoverRect(selectRect, imageRect)
        
    setImageSelectRect(rect)
    //onSelectRect(rect)

  }, [selectRect])


  const calcContainRect =(selectRect, imageRect) =>{

    const inversScale = 1 / calcContainScale(containerWidth, containerHeight, image.naturalWidth, image.naturalHeight)
    
    const selectX = (selectRect.x - imageRect.x) * inversScale
    const selectY = (selectRect.y - imageRect.y) * inversScale
    const selectWidth = selectRect.width * inversScale
    const selectHeight = selectRect.height * inversScale

    const x = Math.floor(selectX) < 0 ? 0 : Math.floor(selectX)
    const y = Math.floor(selectY) < 0 ? 0 : Math.floor(selectY)

    const width = Math.ceil(selectWidth) > image.naturalWidth ? image.naturalWidth : Math.ceil(selectWidth)
    const height = Math.ceil(selectHeight) > image.naturalHeight ? image.naturalHeight : Math.ceil(selectHeight)

    return {x:x, y: y, width:width, height:height}
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

    const x = Math.floor(selectImageX) < 0 ? 0 : Math.floor(selectImageX)
    const y = Math.floor(selectImageY) < 0 ? 0 : Math.floor(selectImageY)

    const width = Math.ceil(selectImageWidth) > image.naturalWidth ? image.naturalWidth : Math.ceil(selectImageWidth)
    const height = Math.ceil(selectImageHeight) > image.naturalHeight ? image.naturalHeight : Math.ceil(selectImageHeight)
    
    return {x:x, y: y, width:width, height:height}
  }


  useImperativeHandle(ref, () => {

    return {
      image() {
        return image
      },
      rect(){

        return imageSelectRect
      }
    }
  }, [image, imageSelectRect])

  

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

      if(refSelect.current != null)
        refSelect.current.style.cursor = id != 0 ? cursor(id) : 'grab'
    }
    else if(selectEdge >= 1 && selectEdge <= 4) {

      const rect = dragEdge(event.clientX, event.clientY, selectEdge)

      //console.log(selectEdge, rect)

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
        refSelect.current.style.cursor = 'grabbing'

      const offsetX = event.clientX - selectRect.x
      const offsetY = event.clientY - selectRect.y
      
      const containerRect = refContain.current.getBoundingClientRect()
      
      const style = window.getComputedStyle(refContain.current);

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

    if(refSelect.current != null)
      refSelect.current.style.cursor = id != 0 ? cursor(id) : 'grab'
        
  }, [selectEdge]);


  
  const calcXY = (clientX, clientY) => {

    const offset = getPropertyOffset()
    
    const x = clientX - offset.x
    const y = clientY - offset.y

    const imageRect = getPropertyImageRect()
    
    const endX = imageRect.x + imageRect.width - refSelect.current.offsetWidth
    const endY = imageRect.y + imageRect.height - refSelect.current.offsetHeight

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

    const position = keepRatio ? keepRatioLeftTop(newX, newY, calcWidth, calcHeight, imageRect, keepRatio)
                              : {x:newX, y:newY, width:calcWidth, height:calcHeight}

    const newWidth = position.width < selectMinWidth ? selectMinWidth : position.width
    const newHeight = position.height < selectMinHeight ? selectMinHeight : position.height

    return {x: position.x, y: position.y, width:newWidth, height:newHeight}
  }


  const keepRatioLeftTop = (x, y, width, height, imageRect, keepRatio) => {

    if(width > (height * keepRatio)){
      
      y -= (width / keepRatio) - height
      
      if(y < imageRect.y) {
        
        const overHeight = (imageRect.y - y)
        width -= (overHeight * keepRatio)
        x += (overHeight * keepRatio)
        y = imageRect.y
      }

      height = width / keepRatio
    }
    else{      

      x -= (height * keepRatio) - width

      if(x < imageRect.x){
        const overWidth = (imageRect.x - x)
        height -= (overWidth / keepRatio)
        y += (overWidth / keepRatio)
        x = imageRect.x
      }

      width = height * keepRatio
    }

    return {x:Math.round(x), y:Math.round(y), width:Math.round(width), height:Math.round(height)}
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

    const position = keepRatio ? keepRatioRightTop(newX, newY, calcWidth, calcHeight, imageRect, keepRatio, maxWidth)
                              : {x:newX, y:newY, width:calcWidth, height:calcHeight}
    
    const newWidth = position.width < selectMinWidth ? selectMinWidth : position.width
    const newHeight = position.height < selectMinHeight ? selectMinHeight : position.height

    return {x: position.x, y: position.y, width:newWidth, height:newHeight}
  }


  const keepRatioRightTop = (x, y, width, height, imageRect, keepRatio, maxWidth) => {

    if((height * keepRatio) > width){

      width = height * keepRatio

      if(width > maxWidth){

        const overWidth = (width - maxWidth)
        width = maxWidth
        height -= overWidth / keepRatio
        y += overWidth / keepRatio
      }
    }
    else{

      y -= (width / keepRatio) - height
                
      if(y < imageRect.y){
        const overHeight = (imageRect.y - y)
        width -= (overHeight * keepRatio)
        y = imageRect.y
      }

      height = width / keepRatio
    }

    return {x:Math.round(x), y:Math.round(y), width:Math.round(width), height:Math.round(height)}
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

    const position = keepRatio ? keepRatioLeftBottom(newX, newY, calcWidth, calcHeight, imageRect, keepRatio, maxHeight)
                              : {x:newX, y:newY, width:calcWidth, height:calcHeight}
    
    const newWidth = position.width < selectMinWidth ? selectMinWidth : position.width
    const newHeight = position.height < selectMinHeight ? selectMinHeight : position.height

    return {x: position.x, y: position.y, width: newWidth, height:newHeight}
  }


  const keepRatioLeftBottom = (x, y, width, height, imageRect, keepRatio, maxHeight) => {

    if(width > (height * keepRatio)){

      height = width / keepRatio

      if(height > maxHeight){

        const overHeight = (height - maxHeight)
        height = maxHeight
        width -= (overHeight * keepRatio)
        x += (overHeight * keepRatio)
      }
    }
    else{

      x -= ((height * keepRatio) - width)
                
      if(x < imageRect.x){
        const overWidth = (imageRect.x - x)
        height -= overWidth / keepRatio
        x = imageRect.x
      }

      width = height * keepRatio
    }

    return {x:Math.round(x), y:Math.round(y), width:Math.round(width), height:Math.round(height)}
  }
  

  const dragRigthBottom = (x, y, imageRect, lastRect) => {

    const newX = lastRect.x
    const newY = lastRect.y    
    
    let calcWidth = lastRect.width + (x - newX)
    let calcHeight = lastRect.height + (y - newY)
    
    const maxWidth = ((imageRect.x + imageRect.width) - lastRect.x)
    const maxHeight = ((imageRect.y + imageRect.height) - lastRect.y)


    const position = keepRatio ? keepRatioRightBottom(newX, newY, calcWidth, calcHeight, imageRect, keepRatio, maxWidth, maxHeight)
                              : {x:newX, y:newY, width:(calcWidth > maxWidth ? maxWidth : calcWidth), height:(calcHeight > maxHeight ? maxHeight : calcHeight)}
            
    const newWidth = position.width < selectMinWidth ? selectMinWidth : position.width
    const newHeight = position.height < selectMinHeight ? selectMinHeight : position.height

    return {x: position.x, y: position.y, width:newWidth, height:newHeight}
  }


  const keepRatioRightBottom = (x, y, width, height, imageRect, keepRatio, maxWidth, maxHeight) => {

    if(width > height * keepRatio)
      height = width / keepRatio
    else
      width = height * keepRatio

    const overWidth = (width - maxWidth)
    const overHeight = (height - maxHeight)

    if(overWidth >= (overHeight * keepRatio)){  
      if(overWidth > 0){    
        width -= overWidth
        height -= overWidth / keepRatio
      }
    }
    else{    
      if(overHeight > 0){      
        width -= overHeight * keepRatio
        height -= overHeight
      }
    }

    return {x:Math.round(x), y:Math.round(y), width:Math.round(width), height:Math.round(height)}
  }



  const setPropertyIsLoadImage = (loaded) => {

    if(refContain.current == null)
      return
    
    const style = refContain.current.style
    style.setProperty('--loaded', loaded)
  }


  const getPropertyIsLoadImage = () => {

    if(refContain.current == null)
      return

    const style = refContain.current.style
    const loaded = style.getPropertyValue('--loaded')

    if(loaded == null)
      return false
    
    return loaded
  }


  const setPropertyOffset = (offsetX, offsetY) => {

    if(refSelect.current == null)
      return

    const style = refSelect.current.style
    
    style.setProperty('--offset_x', offsetX)
    style.setProperty('--offset_y', offsetY)
  }


  const getPropertyOffset = () => {

    if(refSelect.current == null)
      return

    const style = refSelect.current.style

    const offsetX = style.getPropertyValue('--offset_x')
    const offsetY = style.getPropertyValue('--offset_y')

    return {x: parseInt(offsetX), y: parseInt(offsetY)}
  }


  const setPropertyImageRect = (x, y, width, height) => {

    if(refContain.current == null)
      return
    
    const style = refContain.current.style
    
    style.setProperty('--x', x)
    style.setProperty('--y', y)
    style.setProperty('--width', width)
    style.setProperty('--height', height)
  }


  const getPropertyImageRect =() => {

    if(refContain.current == null)
      return

    const style = refContain.current.style

    const x = style.getPropertyValue('--x')
    const y = style.getPropertyValue('--y')
    const width = style.getPropertyValue('--width')
    const height = style.getPropertyValue('--height')

    return {x: parseInt(x), y: parseInt(y), width:parseInt(width), height:parseInt(height)}

  }

  const setPropertyLastRect = (x, y, width, height) => {

    if(refSelect.current == null)
      return

    const style = refSelect.current.style

    style.setProperty('--x', x);
    style.setProperty('--y', y);
    style.setProperty('--width', width);
    style.setProperty('--height', height);
  }

  const getPropertyLastRect = () => {

    if(refSelect.current == null)
      return

    const style = refSelect.current.style

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
      <div id='container' className={`${isLoading ? 'spin': ''}`} ref={refContain} style={{'--radius--':'128px', '--spinWidth--':'16px', width: `${containerWidth}px`, height: `${containerHeight}px`, backgroundImage: `url(${containerCanvasUrl})`, backgroundSize:`${isContain ? 'contain': 'cover'}`}}>
        <canvas ref={refCover} style={{width: `${coverSize.width}px`, height: `${coverSize.height}px`}}/>
          {selectRect != null && 
          <div id='select' ref={refSelect} onMouseDown={onMouseDown}
            style={{ left: `${selectRect.x}px`, top: `${selectRect.y}px`, width: `${selectRect.width}px`, height: `${selectRect.height}px`, backgroundImage: `url(${transparent})`}}
          >
          <div id='selectEdge'></div>
        </div>
        }
      </div>
  )
}
