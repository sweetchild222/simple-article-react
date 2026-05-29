import {useState, useContext, useEffect, useRef, useImperativeHandle, useCallback} from "react";

import getCaretCoordinates from 'textarea-caret';
import BeautyButton from "../../../common/BeautyButton.js";

import './TextArea.css'

export default function({ref, comment, atCandidates, onInput, maxCharLength = 1000}) {
        
    const [menuPosition, setMenuPosition] = useState(null)
    const [focusItemIndex, setFocusItemIndex] = useState(null)
    
    const refMenu = useRef(null)
    const refTextArea = useRef(null)    
    
    const onInputInner = (e) => {

        const element = e.nativeEvent.target
        const value = element.value

        if(onInput)
            onInput(value)
        
        if(!refMenu.current)
            return
        
        const atIndex = value.lastIndexOf('@', element.selectionStart - 1)

        if(atIndex == -1){
            setFocusItemIndex(null)
            return
        }        

        const atStr = value.substring(atIndex + 1, element.selectionStart)
        
        const hasWhitespace = /\s/.test(atStr)

        if(hasWhitespace){
            setFocusItemIndex(null)
            return
        }
                
        if(atStr == ''){
            setFocusItemIndex(null)
            return
        }
        
        const childNodes = refMenu.current.childNodes

        for(let i = 0; childNodes.length > i; ++i){

            const nickName = childNodes[i].innerText

            if(nickName.indexOf('@' + atStr) != -1){
                setFocusItemIndex(i)
                return
            }
        }

        setFocusItemIndex(null)
        setMenuPosition(null)
    }


    useEffect(()=>{
    
        if(!menuPosition)
            return
        
        const handleClick = (event) => { 

            if(!refMenu.current.contains(event.target)){
                setMenuPosition(null)
                setFocusItemIndex(null)
            }
        }

        document.addEventListener('mouseup', handleClick)

        return () => {

            document.removeEventListener('mouseup', handleClick)
        }
    
    }, [menuPosition])


    useEffect(()=>{

        const element = refTextArea.current

        if(!element)
            return
            
        element.focus()
        const length = comment ? comment.length : 0
        element.setSelectionRange(length, length)
        
        element.addEventListener('input', (e) => {
            
            const lastChar = element.selectionStart > 1 ? element.value[element.selectionStart - 2] : ' '

            if (e.data === '@' && (lastChar == ' ' || lastChar == '\n' || lastChar == '\t')) {

                const { top, left } = getCaretCoordinates(element, element.selectionStart)

                const rect = element.getBoundingClientRect()

                const menuHeight = 30 * atCandidates.length

                const topMargin = 30
            
                const menuBottom = rect.y + top - element.scrollTop + menuHeight + topMargin

                const y = top - element.scrollTop + (menuBottom < window.innerHeight ? topMargin : -menuHeight)
                
                setMenuPosition({x:left, y:y})
                setFocusItemIndex(null)
            }
        })
            
    }, [])


    useEffect(()=>{

        if(!refMenu.current)
            return
        
        const childNodes = refMenu.current.childNodes

        if(focusItemIndex != null && focusItemIndex >= childNodes.length)
            return

        for(let i = 0; childNodes.length > i; ++i)
            childNodes[i].style.backgroundColor = i == focusItemIndex ? '#696969' : '#D3D3D3'

    }, [focusItemIndex])
    

    useImperativeHandle(ref, () => {
    
        return {
            value() {

                if(!refTextArea.current)
                    return null

                return refTextArea.current.value
            }
        }
    }, [refTextArea])
        

    const onClickUser = async(user) =>{
        
        setMenuPosition(null)
        setFocusItemIndex(null)
        putNickName(user.nickname)
    }


    const putNickName = (nickname)=> {

        const element = refTextArea.current

        if(!element)
            return

        const value = element.value

        const atIndex = value.lastIndexOf('@', element.selectionStart - 1)

        if(atIndex == -1)
            return

        const atStr = value.substring(atIndex + 1, element.selectionStart)
        
        const hasWhitespace = /\s/.test(atStr)

        if(hasWhitespace)
            return
        
        const nickHead = nickname.substring(0, atStr.length)

        if(atStr == nickHead) {
            const nickFoot = nickname.substring(atStr.length, nickname.length) + ' '
            element.value = value.slice(0, element.selectionStart) + nickFoot + value.slice(element.selectionStart)
        }
        else{
            element.value = value.slice(0, atIndex) + '@' + nickname + ' '
        }

        element.focus()
    }


    const eventKeyDown = useCallback((event) => {

        if(!refMenu.current)
            return
        
        const maxIndex = refMenu.current.childNodes.length

        if(event.code == 'ArrowDown'){
            event.preventDefault()
            setFocusItemIndex(index => index == null ? 0 : ((maxIndex - 1) > index ? index + 1 : index))
        }
        else if(event.code == 'ArrowUp'){
            event.preventDefault()
            setFocusItemIndex(index => index == null ? (maxIndex - 1) : (index > 0 ? index - 1 : index))
        }
        else if(event.code == 'Escape'){
            event.preventDefault()
            setMenuPosition(null)
            setFocusItemIndex(null)
        }
        else if(event.code == 'Backspace'){

            const element = refTextArea.current
            
            if(!refTextArea.current)
                return

            const lastChar = element.value[element.selectionStart - 1]
            
            if(lastChar == '@'){
                setMenuPosition(null)
                setFocusItemIndex(null)
            }
        }
        else if(event.code == 'Space' || event.code == 'Home' || event.code == 'End' || event.code == 'ArrowLeft' || event.code == 'ArrowRight'){

            setMenuPosition(null)
            setFocusItemIndex(null)
        }
        else if(event.code == 'Enter'){

            setMenuPosition(null)
            setFocusItemIndex(null)
            
            if(focusItemIndex == null)
                return            

            event.preventDefault()

            if(maxIndex > focusItemIndex)
                putNickName(atCandidates[focusItemIndex].nickname)
        }
    })


    useEffect(() => {

        window.addEventListener('keydown', eventKeyDown)
        
        return () => {
            window.removeEventListener('keydown', eventKeyDown)    
        }

    }, [eventKeyDown])


    return (
            <div style={{width:'100%'}}>
                {<div style={{display:'grid', gridTemplateColumns:'1fr', width:'100%'}}>
                    <textarea ref={refTextArea} className={'area'}  placeholder={'글을 입력하세요'} defaultValue={comment} suppressContentEditableWarning={true} maxLength={maxCharLength}
                    style={{width:'100%',  minHeight: '4lh', maxHeight:'6lh', resize:'none',  border:'0px solid lightgray', fieldSizing: 'content', overflowY:'auto', padding:'5px', backgroundColor:'green'}} onInput={onInputInner}/>
                </div>
                }

                {menuPosition &&
                    <ul ref={refMenu} className={'atCandidates'} style={{left:menuPosition.x, top:menuPosition.y}}>
                        {atCandidates.map((user, index) =>

                            user.nickname != '' ? 
                                <BeautyButton key={user.id} type={'transparent'}  style={{color:'black', width:'100%', height:'30px'}} onClick={() => onClickUser(user)}>{'@' + user.nickname}</BeautyButton>
                            :null)
                        }
                    </ul>
                }
            </div>
        )
}