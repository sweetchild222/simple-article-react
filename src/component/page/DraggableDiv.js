import React, { useState, useRef, useEffect, useCallback } from 'react';

import '../css/DraggableDiv.css'
import { CgFontHeight } from 'react-icons/cg';


const DraggableDiv = () => {

  const [rect, setRect] = useState({ x: 0, y: 0, width: 100, height: 100});  
  const [selectEdge, setSelectEdge] = useState(-1);
  const selectRef = useRef(null);
  const containRef = useRef(null);
  const selectMinHeight = 100
  const selectMinWidth = 100


  useEffect(() => {    
    
    if (containRef.current){
        const imagePath = '/image/test.png'
        containRef.current.style.backgroundImage = `url(${imagePath})`
    }

    //setRect({ x: 10, y: 10, width: 100, height: 100})
    
  }, []);


  const handleMouseDown = useCallback((event) => {

    //event.stopPropagation()

    if(event.target.className == 'select'){

        const id = getEdgeID(event.clientX, event.clientY, event.target.getBoundingClientRect())
        
        setSelectEdge(id)

        console.log('select edge ', id)

        if(id == 0)
          selectRef.current.style.cursor = 'grabbing'

        const offsetX = event.clientX - rect.x;
        const offsetY = event.clientY - rect.y;
        
        const containerRect = containRef.current.getBoundingClientRect()
        const selectRect = event.target.getBoundingClientRect()
        
        const x = selectRect.x - containerRect.x
        const y = selectRect.y - containerRect.y

        const width = event.target.getBoundingClientRect().width
        const height = event.target.getBoundingClientRect().height

        setLastOffset(offsetX, offsetY)
        setLastRect(x, y, width, height)
    }

  }, [rect]);

  
  const calcXY = (clientX, clientY) => {

    const offset = getLastOffset()
    
    const x = clientX - offset.x
    const y = clientY - offset.y
    
    const endX = containRef.current.offsetWidth - selectRef.current.offsetWidth
    const endY = containRef.current.offsetHeight - selectRef.current.offsetHeight

    const calcX = x < 0 ? 0 : (x > endX ? endX : x)
    const calcY = y < 0 ? 0 : (y > endY ? endY : y)

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

      console.log(lastRect.x)
            
      if(selectEdge == 1){
                
        const maxX = lastRect.x + (lastRect.width - selectMinWidth)
        const maxY = lastRect.y + (lastRect.height - selectMinHeight)

        const newX = clamp(x, 0, maxX)
        const newY = clamp(y, 0, maxY)
        
        const caclWidth = lastRect.width + (lastRect.x - newX)
        const caclHeight = lastRect.height + (lastRect.y - newY)
        
        const newWidth = caclWidth < selectMinWidth ? selectMinWidth : caclWidth
        const newHeight = caclHeight < selectMinHeight ? selectMinHeight : caclHeight

        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }
      else if(selectEdge == 2){

        const maxY = lastRect.y + (lastRect.height - selectMinHeight)

        const newX = lastRect.x
        const newY = clamp(y, 0, maxY)
        
        const caclWidth = lastRect.width + (x - newX)
        const caclHeight = lastRect.height + (lastRect.y - newY)

        const maxWidth = (containRef.current.offsetWidth - lastRect.x)        
        
        const newWidth = clamp(caclWidth, selectMinWidth, maxWidth)
        const newHeight = caclHeight < selectMinHeight ? selectMinHeight : caclHeight
                                          
        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }
      else if(selectEdge == 3){

        const maxX = lastRect.x + (lastRect.width - selectMinWidth)

        const newX = clamp(x, 0, maxX)
        const newY = lastRect.y
        
        const caclWidth = lastRect.width + (lastRect.x - newX)
        const caclHeight = lastRect.height + (y - newY)

        const maxHeight = (containRef.current.offsetHeight - lastRect.y)

        const newWidth = caclWidth < selectMinWidth ? selectMinWidth : caclWidth
        const newHeight = clamp(caclHeight, selectMinHeight, maxHeight)

        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }
      else if(selectEdge == 4){

        const newX = lastRect.x
        const newY = lastRect.y
        
        const caclWidth = lastRect.width + (x - newX)
        const caclHeight = lastRect.height + (y - newY)

        const maxWidth = (containRef.current.offsetWidth - lastRect.x)
        const maxHeight = (containRef.current.offsetHeight - lastRect.y)

        const newWidth = clamp(caclWidth, selectMinWidth, maxWidth)
        const newHeight = clamp(caclHeight, selectMinHeight, maxHeight)

        return {x: newX, y: newY, width:newWidth, height:newHeight}
      }

      return null
  }




  const setLastOffset = (offsetX, offsetY) => {
    
    selectRef.current.style.setProperty('--offset_x', offsetX);
    selectRef.current.style.setProperty('--offset_y', offsetY);    
  }


  const getLastOffset = () => {

    const offsetX = selectRef.current.style.getPropertyValue('--offset_x')
    const offsetY = selectRef.current.style.getPropertyValue('--offset_y')

    return {x: parseInt(offsetX), y: parseInt(offsetY)}

  }

  const setLastRect = (x, y, width, height) => {

    selectRef.current.style.setProperty('--x', x);
    selectRef.current.style.setProperty('--y', y);
    selectRef.current.style.setProperty('--width', width);
    selectRef.current.style.setProperty('--height', height);
  }

  const getLastRect = () => {

    const x = selectRef.current.style.getPropertyValue('--x')
    const y = selectRef.current.style.getPropertyValue('--y')

    const width = selectRef.current.style.getPropertyValue('--width')
    const height = selectRef.current.style.getPropertyValue('--height')

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
      
    if(id != 0)
      selectRef.current.style.cursor = cursor(id)
    else
      selectRef.current.style.cursor = 'grab'
    
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
    <div ref={containRef} className="container">
      <div
        ref={selectRef} className='select' onMouseDown={handleMouseDown}
        style={{ left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`}}
      >
        <div className='edge'></div>
      </div>
      
    </div>
  );
};

export default DraggableDiv;