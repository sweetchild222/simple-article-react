import React, {useContext, useEffect } from "react";
import axios from 'axios';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import AuthContext from "./AuthContext";


export async function getUser(jwt, user_id) {

  try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.get('/api/user/' + user_id, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}


export async function postAuthenticate(username, password) {
                
  try{
      
    const response = await axios.post('/api/authenticate', {username: username, password: password})

    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function postUser(usename, password){

  try{
    
    const response = await axios.post('/api/user', {username: usename, password: password})

    return response.data

  }
  catch(error){

    console.log(error)

    return null
  }
}

  
export async function getExistUser(username){
      
  try{
  
    const response = await axios.get('/api/user/exist/' + username)
    
    return response.data

  }
  catch(error){

    console.log(error)

    return null
  }
}


export async function postVerifyEmail(email) {
  
  try{

    const response = await axios.post('/api/verifyEmail', {email: email})

    return response.data

  }
  catch(error){

    console.log(error)
  }
}


export async function getVerifyEmail(email, code){
          
  try{
    
    const response = await axios.get('/api/verifyEmail/' + email + '/' + code)

    return response.data
          
  }
  catch(error){

    console.log(error)
  }
}



export async function getUserPasswordCheck(jwt, user_id, password) {

  try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.get('/api/user/' + user_id + '/password/' + password, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function patchUser(jwt, user_id, payload){

  try{

    const authorization = 'Bearer '.concat(jwt);
    
    const response = await axios.patch('/api/user/' + user_id, payload, { headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function postProfile(jwt, payload) {

  try {

    const authStr = 'Bearer '.concat(jwt);
  
    const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
    
    const response = await axios.post(`/api//blob/profile`, payload, { headers: headers})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function getProfile(jwt, id) {

  try{  

    const authorization = 'Bearer '.concat(jwt)

    const response = await axios.get('/api//blob/profile/' + id, { headers: {Authorization: authorization}, responseType: 'blob'})

    return response.data

  }
  catch(error){

    console.log(error)

    return null
  }
}

