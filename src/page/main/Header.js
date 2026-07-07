import {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import AuthContext from "@util/AuthContext.js";
import ProfileImage from "@gui/ProfileImage.js";
import AlarmModal from "./AlarmModal.js";
import PrettyButton from "@gui/PrettyButton.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import * as AlarmAPI from '@rest/AlarmAPI.js'
import * as CommentAPI from '@rest/CommentAPI.js'
import { VscBellDot } from "react-icons/vsc";
import { VscBell } from "react-icons/vsc";
import * as UserRepository from "@util/UserRepository.js";
import * as ReplaceUserTag from "@util/ReplaceUserTag.js";

export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [alarms, setAlarms] = useState(null)
    const [isOpenAlarmModal, setIsOpenAlarmModal] = useState(false)
    
    const navigate = useNavigate()

    useEffect(() => {

        if(validAuth(auth)) {            

            AlarmAPI.getAlarm(auth.jwt, auth.user_id).then(res=>{

                if(res.success == false)
                    return

                const alarms = res.payload

                alarms.sort((a, b)=> b.id - a.id)

                const promises = []

                alarms.map(alarm => promises.push(alarm.checked == 0 ? ReplaceUserTag.toUserNicknameGreen(alarm.comment) : ReplaceUserTag.toUserNicknameGray(alarm.comment)))

                Promise.all(promises).then(res => {

                    if(res.length != alarms.length)
                        return

                    res.map((data, index) => alarms[index].seenComment = data)                                    

                    const user_ids = alarms.map(({from_user_id}) => from_user_id)
        
                    UserRepository.getByIDList([...new Set(user_ids)]).then(users => {
                                        
                    for(const alarm of alarms)
                        
                        alarm.user = users.find(user => user.id == alarm.from_user_id)
                        
                        setAlarms(alarms)
                    })
                })
            })
        }
        else{
            setAlarms(null)
            setIsOpenAlarmModal(false)
        }

    }, [auth])


    const onKeyDown = (e) => {

        if(e.key === 'Enter')
            onClickSearch(inputElement.value)
    }


    const onClickLogIn = (e) =>{

        navigate("/account")
    }


    const onClickUser = (e) =>{

        if(validAuth(auth))
            navigate('/user/' + auth.user_id)
        else
            navigate('/account')
    }


    const onClickSearch = (e) => {

    }

    const onClickAtError= (e) => {

        removeAuth()
        navigate('/account')
    }


    const onClickHome = (e) =>{

        navigate('/')
    }


    const onClickAlarm = async(e) => {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account')
            return
        }

        if(alarms == null)
            return

        if(alarms.length == 0)
            return

        setIsOpenAlarmModal(true)
    }


    const onCloseAlarmModal = async() => {        

        
        setIsOpenAlarmModal(false)
    }

    const onUpdatedAlarms = async(alarms)=>{

        setAlarms(structuredClone(alarms))
    }

    const onClickNavigateMyBlog = async() =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/', {state:{comback:true}})
            return
        }
    
        navigate("/blog/" + auth.blog_id)
    }
    
    return (
            <Horizental style={{alignItems: 'center', width:'100%', marginTop:'8px', paddingLeft:'16px', paddingRight:'16px'}}>
                <PrettyButton>{'최신순'}</PrettyButton>
                <div style={{width:'8px'}}/>
                <PrettyButton>{'인기순'}</PrettyButton>
                <div style={{width:'8px'}}/>
                <PrettyButton>{'댓글 많은 순'}</PrettyButton>
                <div style={{width:'8px'}}/>
                <PrettyButton>{'구독한 글'}</PrettyButton>
                <Horizental style={{flex:'1'}}></Horizental>
                <input id="search" placeholder="검색" maxLength="256" style={{width:'100%', minWidth:'100px', maxWidth:'400px'}} onKeyDown={onKeyDown}></input>
                <div style={{width:'8px'}}/>
                <PrettyButton  type='success' onClick={onClickSearch}>검색</PrettyButton>
                <Horizental style={{flex:'1'}}></Horizental>
                {!validAuth(auth) && <PrettyButton type='confirm' onClick={onClickLogIn}>로그인</PrettyButton>}
                {validAuth(auth) && <Horizental style={{alignItems: 'center'}}>
                    <PrettyButton onClick={onClickNavigateMyBlog}>{'내 블로그'}</PrettyButton>
                    <div style={{width:'8px'}}/>
                    {alarms != null && <PrettyButton  type='transparent' style={{color:'black'}} onClick={onClickSearch} onClick={onClickAlarm}>{(alarms.filter(item => item.checked == 0).length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}
                    {alarms != null && <div style={{width:'8px'}}/>}
                    {alarms != null && <AlarmModal isOpen={isOpenAlarmModal} onClose={onCloseAlarmModal} onUpdatedAlarms={onUpdatedAlarms} alarms={alarms}></AlarmModal>}                    
                    <ProfileImage shape={'circle'}  userId={auth.user_id} size={48} onClick={onClickUser} onClickAtError={onClickAtError}/>
                    </Horizental>
                }
                        
            </Horizental>
        )
}
