import {useState, useEffect, useRef} from "react";

import PrettyButton from "@gui/PrettyButton.js";
import {Vertical, Horizental} from "@gui/Flex.js";

import * as UserRepository from "@util/UserRepository.js";
import DOMPurify from 'dompurify';
import TextArea from "./TextArea.js";

import * as ReplaceUserTag from "@util/ReplaceUserTag.js";

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
        
        ReplaceUserTag.toUserLink(comment.comment).then(replaceString =>
            setSeenComment(DOMPurify.sanitize(replaceString))
        )

        ReplaceUserTag.toUserNickname(comment.comment).then(replaceString =>
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
            <Vertical style={{position:'relative', justifyContent:'end', alignItems:'start', width:editable ? '100%' : 'auto'}}>
                {editable && <TextArea ref={refArea} comment={editingComment} atCandidates={atCandidates} onInput={onInput} maxCharLength={maxCharLength}></TextArea>}
                {!editable && <div ref={refComment} dangerouslySetInnerHTML={{ __html: seenComment}} className={isExpand ? 'none-clamped-text' : 'clamped-text'} style={{boxSizing: 'border-box', '--line-count':5, whiteSpace: 'pre-line', width:'auto', padding:'5px'}}/>}
                
                {!editable && isClamped && !isExpand && <div style={{position: 'absolute', alignSelf:'end'}}>
                    <PrettyButton type={'transparent'} style={{color:'orange', backgroundColor:'lavender'}} onClick={() => setIsExpand(true)}><RiArrowDownWideLine size={16}/></PrettyButton>
                </div>}

                {editable && <Horizental style={{justifyContent:'end', width:'100%', alignItems:'center', marginTop:'5px'}}>
                    <label>{inputLength}</label>
                    <div style={{width:'10px'}}/>
                    <PrettyButton tooltip={'수정'} isLoading={isModifyLoading} onClick={onClickModifyCompleteInner} >{'수정'}</PrettyButton>
                    <div style={{width:'10px'}}></div>
                    <PrettyButton tooltip={'취소'} disabled={isModifyLoading} onClick={onClickModifyCancelInner}>{'취소'}</PrettyButton>
                </Horizental>
                }
            </Vertical>
        ) : null
}


