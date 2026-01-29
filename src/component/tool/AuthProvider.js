import React, {useEffect, useState} from 'react';

import AuthContext from './AuthContext';





const AuthProvider = ({children}) => {

    const key = 'autrrtg'
    const logout = ''

    const [auth, setAuth] = useState(() => {
  
        const item = localStorage.getItem(key)
        
        return (item === null || item === logout) ? logout : JSON.parse(item)
    })
    
    
    const updateAuth = (auth) => {

        auth.expire_time = Date.now() + 1000 * 60 * 60;
        localStorage.setItem(key, JSON.stringify(auth))
        setAuth(auth)
    }


    const removeAuth = () => {

        localStorage.setItem(key, logout)
        setAuth(logout)
    }

    
    const validAuth = (auth) => {

        if(auth === '')
            return false

        if(Date.now() > auth.expire_time){
            removeAuth()
            return false
        }

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

    
    const values = {auth, updateAuth, removeAuth, validAuth}

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider



