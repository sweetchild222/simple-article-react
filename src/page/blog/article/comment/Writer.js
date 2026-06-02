import React, {useState, useContext, useRef} from "react";

import TextArea from "./TextArea.js";
import PrettyButton from "@gui/PrettyButton.js";

export default function(props) {

    const atCandidates = props.atCandidates
    const combinedStyle = { ...props.style }

    const [isPostLoading, setIsPostLoading] = useState(false)
    const [inputLength, setInputLength] = useState('0/1000')
    
    const refArea = useRef(null)

    const maxCharLength = 1000

    const onClickPost = async()=> {

        if(!refArea.current)
            return

        setIsPostLoading(true)

        let value = refArea.current.value()

        for(const candidate of atCandidates){

            if(candidate.nickname != '')
                value = value.replaceAll('@' + candidate.nickname + ' ', ('<user>' + candidate.id + '</user>'))
        }

        if(props.onPostText)
            props.onPostText(value)        

        setIsPostLoading(false)
    }


    const onInput = async(value) =>{

        setInputLength(value.length + '/' + maxCharLength)
    }

    
    const onClickCancel = async() => {
        
        if(props.onCancel)
            props.onCancel()
    }

    return  (<div style={{position:'relative', display:'flex', flexDirection: 'column', justifyContent:'end', width:'100%', backgroundColor:'lightgreen'}}>
                <TextArea ref={refArea} atCandidates={atCandidates} onInput={onInput} maxCharLength={maxCharLength}></TextArea>
                <div style={{display:'flex', flexDirection: 'row', width:'100%', justifyContent:'end', alignItems:'center'}}>
                    <label>{inputLength}</label>
                    <div style={{width:'10px'}}/>
                    <PrettyButton isLoading={isPostLoading} onClick={()=>onClickPost()}>{'올리기'}</PrettyButton>
                    <div style={{width:'10px'}}/>
                    <PrettyButton disabled={isPostLoading ? true : false} onClick={()=>onClickCancel()}>{'취소'}</PrettyButton>
                </div>
            </div>
        )
}
