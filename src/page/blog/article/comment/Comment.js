import {useState, useEffect, useRef} from "react";

import PrettyButton from "@gui/PrettyButton.js";
import {Horizental, Vertical} from "@gui/Flex.js";

import * as UserRepository from "./UserRepository.js";
import DOMPurify from 'dompurify';
import TextArea from "./TextArea.js";

import { RiArrowDownWideLine } from "react-icons/ri";
import { MdOutlineDoneOutline } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import './Comment.css'


export default function({ref, comment, editable, onClickModifyComplete, onClickModifyCancel, atCandidates}) {

    const [isClamped, setIsClamped] = useState(false)
    const [isExpand, setIsExpand] = useState(false)
    const [isModifyLoading, setIsModifyLoading] = useState(false)
    const [inputLength, setInputLength] = useState('0/1000')
    const [seenComment, setSeenComment] = useState(null)
    const [editingComment, setEditingComment] = useState(null)
        
    const refComment = useRef(null)
    const refArea = useRef(null)

    const maxCharLength = 1000
    
    const onInput = (value) => {
            
        setInputLength(value.length + '/' + maxCharLength)
    }

    useEffect(()=>{

        const rawComment = comment.comment
        const regex = /\<user\>(.*?)\<\/user\>/g

        replaceAsync(rawComment, regex, toUserLink).then(replaceString =>
            setSeenComment(DOMPurify.sanitize(replaceString))
        )

        replaceAsync(rawComment, regex, toUserNickname).then(replaceString =>
            setEditingComment(replaceString)
        )

    }, [comment])


    useEffect(()=> {

        if(!editable)
            return

        const length = editingComment.length
        setInputLength(length + '/' + maxCharLength)

    }, [editable])


    

    useEffect(()=>{

        if(refComment.current && seenComment){
            
            const element = refComment.current
            
            setIsClamped(element.scrollHeight >  element.clientHeight)
        }

    }, [seenComment])



    async function replaceAsync(str, regex, asyncFn) {

        const promises = []
    
        str.replace(regex, (match, ...args) => {
            promises.push(asyncFn(match, ...args))
            return match
        })
  
        const data = await Promise.all(promises)
        return str.replace(regex, () => data.shift())
    }
    

    const toUserLink = async(matched)=>{
        
        const match = matched.match(/\<user\>(.*?)\<\/user\>/)

        if(!match)
            return matched
        
        if(match.length > 0){

            const id = match[1]

            const user = await UserRepository.getByID(id)

            const host = 'http://' + window.location.host

            if(user == null)
                return '@알수없음 '
                        
            const link = '<a href=\"' + host + '/user/' + id + '\">'+ '@' + user.nickname + ' ' +'</a>'
        
            return link
        }

        return matched
    }

    
    const toUserNickname = async(matched)=>{

        const match = matched.match(/\<user\>(.*?)\<\/user\>/)

        if(!match)
            return

        if(match.length > 0){

            const id = match[1]

            const user = await UserRepository.getByID(id)

            if(user == null)
                return '@알수없음 '
            
            return '@' + user.nickname + ' '
        }

        return matched
    }


    const onClickModifyCompleteInner = async() => {

        if(onClickModifyComplete){

            if(!refArea.current)
                return            

            setIsModifyLoading(true)
                
            let value = refArea.current.value()
            
            for(const candidate of atCandidates){

                if(candidate.nickname != '')
                    value = value.replaceAll('@' + candidate.nickname + ' ', ('<user>' + candidate.id + '</user>'))
            }
                                    
            await onClickModifyComplete(value)
            setIsModifyLoading(false)
        }
    }

    const onClickModifyCancelInner = async() => {

        if(onClickModifyCancel)
            onClickModifyCancel()
    }
        

    return seenComment ? (
            <Horizental style={{position:'relative', justifyContent:'end', backgroundColor:'orange', alignItems:'start', width:editable ? '100%' : 'auto'}}>

                {editable && <TextArea ref={refArea} comment={editingComment} atCandidates={atCandidates} onInput={onInput} maxCharLength={maxCharLength}></TextArea>}
                {!editable && <div ref={refComment} dangerouslySetInnerHTML={{ __html: seenComment}} className={isExpand ? 'none-clamped-text' : 'clamped-text'} style={{boxSizing: 'border-box', '--line-count':5, whiteSpace: 'pre-line', backgroundColor:'lightblue', width:'auto', padding:'5px'}}/>}
                
                {!editable && isClamped && !isExpand && <div style={{position: 'absolute', alignSelf:'end'}}>
                    <PrettyButton type={'transparent'} style={{color:'black'}} onClick={() => setIsExpand(true)}><RiArrowDownWideLine size={12}/></PrettyButton>
                </div>}

                {editable && <Vertical style={{justifyContent:'end', width:'100%', alignItems:'center'}}>
                    <label>{inputLength}</label>
                    <div style={{width:'10px'}}/>
                    <PrettyButton type={'transparent'} tooltip={'적용'} style={{color:'black'}} isLoading={isModifyLoading} onClick={onClickModifyCompleteInner} >{<MdOutlineDoneOutline size={22}/>}</PrettyButton>
                    <div style={{width:'10px'}}></div>
                    <PrettyButton type={'transparent'} tooltip={'취소'} style={{color:'black'}} disabled={isModifyLoading} onClick={onClickModifyCancelInner} >{<MdCancel size={22}/>}</PrettyButton>
                </Vertical>
                }
            </Horizental>
        ) : null
}


