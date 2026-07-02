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
    const [reloadKey, setReloadKey] = useState(0)
    const [alarms, setAlarms] = useState(null)
    const [isOpenAlarmModal, setIsOpenAlarmModal] = useState(false)
    
    const navigate = useNavigate()

    useEffect(() => {

        if(validAuth(auth)){
            setReloadKey(prev => prev + 1)

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
    

    return (
            <Horizental style={{ alignItems: 'center', width:'100%'}}>
                <Horizental style={{ alignItems: 'center', flexGrow:'1'}}>
                    <PrettyButton>{'내 블로그'}</PrettyButton>
                </Horizental>
                <Horizental style={{justifyContent:'center', alignItems: 'center', flexGrow:'1'}}>
                    <input id="search" placeholder="검색" maxLength="256" style={{width:'300px', minWidth:'50px'}} onKeyDown={onKeyDown}></input>
                    <PrettyButton  type='success' onClick={onClickSearch}>검색</PrettyButton>
                </Horizental>
                <Horizental style={{justifyContent:'end', flexGrow:'1', alignItems:'center', marginRight:'20px'}}>
                    {!validAuth(auth) && <PrettyButton type='confirm' onClick={onClickLogIn}>로그인</PrettyButton>}
                    {validAuth(auth) && alarms != null && <PrettyButton  type='transparent' style={{height:'fit-content', marginRight:'10px', color:'black'}} onClick={onClickSearch} onClick={onClickAlarm}>{(alarms.filter(item => item.checked == 0).length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}
                    {validAuth(auth) && alarms != null && <AlarmModal isOpen={isOpenAlarmModal} onClose={onCloseAlarmModal} onUpdatedAlarms={onUpdatedAlarms} alarms={alarms}></AlarmModal>}
                    {validAuth(auth) && <ProfileImage shape={'circle'}  userId={auth.user_id} onClick={onClickUser} onClickAtError={onClickAtError}/>}
                </Horizental>
                
            </Horizental>
    )
}
