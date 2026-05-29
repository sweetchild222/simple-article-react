


import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';

import * as UserAPI from '../../../api/UserAPI.js'

const repository = []

export const getByIDList = async(userIDList) => {

    const filterIDList = userIDList.filter(id => (repository.find(item => item.id == id) == null))
    
    if(filterIDList.length > 0) {
        
        const newUserList = await UserAPI.getUsers('id=' + filterIDList)

        newUserList.forEach(item=>repository.push(item))
    }

    return repository.filter(item => userIDList.find(id => item.id == id))
}


export const getByID = async(userId) => {

    const findUser = repository.find(item => item.id == userId)
    
    if(findUser == null) {
        
        const newUserList = await UserAPI.getUsers('id=' + [userId])

        newUserList.forEach(item=>repository.push(item))
    }

    return repository.find(item => item.id == userId)
}
