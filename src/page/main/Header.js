import {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import AuthContext from "@util/AuthContext.js";
import ProfileImage from "@gui/ProfileImage.js";
import AlarmModal from "./AlarmModal.js";
import PrettyButton from "@gui/PrettyButton.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import * as AlarmAPI from '@rest/AlarmAPI.js'
import { VscBellDot } from "react-icons/vsc";
import { VscBell } from "react-icons/vsc";

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

                setAlarms(res.payload)

                //setAlarmCount(res.payload.length)
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

        //console.log(alarm)

        setIsOpenAlarmModal(true)
        
        // if(!validAuth(auth))
        //     return

        // const res = await AlarmAPI.getAlarm(auth.jwt, auth.user_id)
        // console.log(res)

        // console.log('alarm')
    }
    

    return (
            <Horizental style={{ alignItems: 'center', width:'100%'}}>
                <Horizental style={{ alignItems: 'center', flexGrow:'1'}}/>

                <Horizental style={{justifyContent:'center', alignItems: 'center', flexGrow:'1'}}>
                    <input id="search" placeholder="검색" maxLength="256" style={{width:'300px', minWidth:'50px'}} onKeyDown={onKeyDown}></input>
                    <PrettyButton  type='success' onClick={onClickSearch}>검색</PrettyButton>
                </Horizental>
                <Horizental style={{justifyContent:'end', flexGrow:'1', alignItems:'center', marginRight:'20px'}}>
                    {!validAuth(auth) && <PrettyButton type='confirm' onClick={onClickLogIn}>로그인</PrettyButton>}
                    {validAuth(auth) && alarms != null && <PrettyButton  type='transparent' style={{height:'fit-content', marginRight:'10px', color:'black'}} onClick={onClickSearch} onClick={onClickAlarm}>{(alarms.length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}

                    {validAuth(auth) && <AlarmModal isOpen={isOpenAlarmModal} onClose={()=>setIsOpenAlarmModal(false)} alarms={alarms}></AlarmModal>}

                    {validAuth(auth) && <ProfileImage shape={'circle'} key={reloadKey} userId={auth.user_id} onClick={onClickUser} onClickAtError={onClickAtError}/>}
                </Horizental>
                
            </Horizental>
    )
}
