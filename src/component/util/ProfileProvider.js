import {useEffect, useState} from 'react'
import ProfileContext from './ProfileContext'

export default function({children}) {

    const key = 'profile'
    const deafultImage = '/image/user.png'
    const empty = ''

    const [profile, setProfile] = useState(() => {
  
        const item = localStorage.getItem(key)
        
        return (item === null || item === empty) ? deafultImage : item
    })
    
    
    const updateProfile = (profile) => {
        
        localStorage.setItem(key, profile)
        setProfile(profile)
    }


    const removeProfile = () => {

        localStorage.setItem(key, deafultImage)
        setProfile(deafultImage)
    }


    useEffect(() => {

        const storageListener = () => {

            const item = localStorage.getItem(key)
            
            setProfile((item === null || item === empty) ? deafultImage : item)
        }

        window.addEventListener("storage", storageListener)

        return () => {
            window.removeEventListener("storage", storageListener)
        }

    }, [])

    
    const values = {profile, updateProfile, removeProfile}

    return (
        <ProfileContext.Provider value={values}>
            {children}
        </ProfileContext.Provider>
    )
}




