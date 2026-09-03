import {useState, useRef} from "react";

import {Vertical} from "@gui/Flex.js";
import PrettyButton from "@gui/PrettyButton.js";
import {VPad, HPad} from "@gui/Pad.js";

import TextArea from "./TextArea.js";

export default function(props) {

    const atCandidates = props.atCandidates

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


    return  (<Vertical style={{position:'relative', justifyContent:'end', width:'100%'}}>
                <TextArea ref={refArea} atCandidates={atCandidates} onInput={onInput} maxCharLength={maxCharLength}></TextArea>
                <VPad size={4}/>
                <div style={{display:'flex', flexDirection: 'row', width:'100%', justifyContent:'end', alignItems:'center'}}>
                    <label>{inputLength}</label>
                    <HPad size={8}/>
                    <PrettyButton isLoading={isPostLoading} type={'success'} onClick={()=>onClickPost()} style={{width:'64px'}}>{'올리기'}</PrettyButton>
                    <HPad size={8}/>
                    <PrettyButton disabled={isPostLoading ? true : false} type={'cancel'} onClick={()=>onClickCancel()} style={{width:'64px'}}>{'취소'}</PrettyButton>
                </div>
            </Vertical>
        )
}
