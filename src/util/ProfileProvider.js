import {useEffect, useState} from 'react'
import ProfileContext from './ProfileContext'

export default function({children}) {

    const key = 'profgile'
    const empty = ''

    const [profile, setProfile] = useState(() => {
  
        const item = localStorage.getItem(key)

        return (item === null || item === empty) ? empty : JSON.parse(item)
    })
    
    
    const updateProfile = (profile) => {

        const profileStr = JSON.stringify({ ...profile })

        localStorage.setItem(key, profileStr)
        setProfile({ ...profile })
    }


    const removeProfile = () => {

        localStorage.setItem(key, empty)
        setProfile(empty)
    }


    const validProfile = (profile) => {

        if(profile == null)
            return false

        if(profile === empty)
            return false
    
        return true
    }


    useEffect(() => {

        const storageListener = () => {

            const item = localStorage.getItem(key)
            
            setProfile((item === null || item === empty) ? empty : JSON.parse(item))
        }

        window.addEventListener("storage", storageListener)

        return () => {
            window.removeEventListener("storage", storageListener)
        }

    }, [])

    
    const values = {profile, updateProfile, validProfile, removeProfile}

    return (
        <ProfileContext.Provider value={values}>
            {children}
        </ProfileContext.Provider>
    )
}




