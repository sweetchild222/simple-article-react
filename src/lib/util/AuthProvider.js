import {useEffect, useState} from 'react'
import AuthContext from './AuthContext'

export default function({children}){

    const key = 'auth'
    const logout = ''

    const [auth, setAuth] = useState(() => {
  
        const item = localStorage.getItem(key)
        
        return (item === null || item === logout) ? logout : JSON.parse(item)
    })
    
    
    const updateAuth = (auth) => {

        auth.expire_time = Date.now() + 1000 * 60 * 60
        auth.update_time = Date.now()
        //auth.expire_time = Date.now() + 1000 * 15
        localStorage.setItem(key, JSON.stringify(auth))
        setAuth(auth)
    }


    const reloadAuth = (auth) => {
        
        auth.update_time = Date.now()

        const newAuth = { ...auth }

        //newAuth.expire_time = (auth.expire_time - 1)    //hack to reload 
        localStorage.setItem(key, JSON.stringify(newAuth))
        setAuth(newAuth)
    }


    const removeAuth = () => {

        localStorage.setItem(key, logout)
        setAuth(logout)
    }

    
    const validAuth = (auth) => {

        if(auth == null)
            return false

        if(auth === logout)
            return false
        
        if(Date.now() > auth.expire_time)
            return false

        return true
    }


    useEffect(() => {

        const storageListener = () => {

            const item = localStorage.getItem(key)
            
            setAuth((item === null || item === logout) ? logout : JSON.parse(item))
        }

        window.addEventListener("storage", storageListener)

        return () => {
            window.removeEventListener("storage", storageListener)
        }

    }, [])

    
    const values = {auth, updateAuth, removeAuth, reloadAuth, validAuth}

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}
