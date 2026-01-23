import React, {useEffect, useState} from 'react';

import AuthContext from './AuthContext';





const AuthProvider = ({children}) => {

    const key = 'authdgegeg'
    const logout = ''

    const [auth, setAuth] = useState(() => {
  
        const item = localStorage.getItem(key)

        console.log('xxxxxxx')
        
        return (item === null || item === logout) ? logout : JSON.parse(item)
    })
    
    
    const updateAuth = (auth) => {

        auth.expire_time = Date.now() + 1000 * 5;
        localStorage.setItem(key, JSON.stringify(auth))
        setAuth(auth)
    }


    const removeAuth = () => {

        localStorage.setItem(key, logout)
        setAuth(logout)
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

    
    const values = {auth, updateAuth, removeAuth}

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider



