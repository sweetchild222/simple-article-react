import React from "react";
import axios from 'axios';

import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';

export default function Home() {

  let inputEmail = null
  let inputPassword = null
  let verifyCode = null

  const navigate = useNavigate();
  

  const test = async() => {


    navigate('/DraggableDiv')
    
  };

  const test2 = async() => {

    window.showToast('login 완료', 'error')
    
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

      <button onClick={test}>imageRegion</button>
      <button onClick={test2}>테스트2</button>
      <button onClick={downFile}>다운로드</button>
      <input type="file" onChange={uploadFile} accept="image/*"/>
    </div>
  );  
}

