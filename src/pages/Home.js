import React from "react";
import axios from 'axios';



export default function Home() {

  console.log('home')


  let inputEmail = null
  let inputPassword = null
  let verifyCode = null
  

  const login = async() => {

    const auth_url = 'authenticate'
    const url = 'user'
        
    try{
      
      const response = await axios.post(auth_url, {username: "crazygun22@nate.com", password:"Sweetchild@22"})
    
      const token = response.data.jwt

      const user_id = response.data.user_id
      
      const authStr = 'Bearer '.concat(token);
      
      const response2 = await axios.get(url + '/' + user_id, { headers: {Authorization: authStr} })

      console.log(response2)

      //const response3 = await axios.patch(url + '/' + user_id, {withdraw: true}, { headers: {Authorization: authStr} })

      //console.log(response3)
            
    }
    catch(error){

      console.log(error)
    }
    
  };

  const mail = async() => {
    
    const url = 'mailVerify'

    try{

      const response = await axios.post(url, {mail: "crazygun22@nate.com"})

      console.log(response.data)
            
    }
    catch(error){

      console.log(error)
    }
  
  };


  const mailVerfy = async() => {
    
    const url = 'mailVerify'    

    const mail = inputEmail

    try{
      
      const response = await axios.patch(url + '/' + mail, {number:parseInt(verifyCode)})

      console.log(response.data)        
            
    }
    catch(error){

      console.log(error)
    }
  
  };


  const postUser = async() => {
    
    const url = 'user'
  
    try{
      
      const response = await axios.post(url, {username: inputEmail, password: inputPassword})

      console.log(response.data)
            
    }
    catch(error){
      console.log(error)
    }
  
  };

  
  const existUser = async() => {
    
    const url = 'user'

    try{
    
      const response = await axios.get(url + '/exist/' + inputEmail)
      
      console.log(response.data)
            
    }
    catch(error){

      console.log(error)
    }
  
  };


  const userModify = async() => {
    
    const url = 'user/55'


    try{
      
      const response = await axios.patch(url, {delete:true, profile:null, role:'ADMIN'})

      console.log(response.data)        
            
    }
    catch(error){

      console.log(error)
    }

  };


  const emailChange = (event) => {

    inputEmail = event.target.value    
    
  };

  const passwordChange = (event) => {

    inputPassword = event.target.value        
  };

  const verifyCodeChange = (event) => {

    verifyCode = event.target.value        
  };

  
  const uploadFile = async(event) => {

    const file = event.target.files[0];

    if (file.length == 0)
      return

    const formData = new FormData();


    formData.append('image-format', 'jpg');
    formData.append('image', file);

    try {

      const auth_url = 'authenticate'

      const response = await axios.post(auth_url, {username: "crazygun22@nate.com", password:"Sweetchild@22"})
  
      const token = response.data.jwt
    
      const authStr = 'Bearer '.concat(token);

      console.log(authStr)
    
      const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
      
      const response2 = await axios.post(`/file/profile`, formData, { headers: headers})
    }
    catch(error){      
      console.log(error)
    }
  }

  const downFile = async(event) => {

    try {

      const auth_url = 'authenticate'

      const response = await axios.post(auth_url, {username: "crazygun22@nate.com", password:"Sweetchild@22"})
  
      const token = response.data.jwt
    
      const authStr = 'Bearer '.concat(token);

      console.log(authStr)
    
      const headers = {Authorization: authStr};
      
      const fileName = '20251230135313-55dfba6d-bf6d-4049-b222-ec28e161e096.png?size=300x300'
    
      const response2 = await axios.get('/file/profile/' + fileName, { headers: headers})


    }
    catch(error){

      console.log(error)
    }

  }
  



    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="text" onChange={emailChange} placeholder="email"/>
        <input type="text" onChange={passwordChange} placeholder="password"/>
        <input type="text" onChange={verifyCodeChange} placeholder="인증 코드"/>
        <button onClick={login}>로그인</button>
        <button onClick={mail}>메일</button>
        <button onClick={mailVerfy}>인증</button>
        <button onClick={postUser}>사용자 추가</button>
        <button onClick={existUser}>중복 체크</button>
        <button onClick={userModify}>유저 수정</button>        
        <button onClick={downFile}>다운로드</button>
        <input type="file" onChange={uploadFile} accept="image/*"/>
      </div>
    );  
}

