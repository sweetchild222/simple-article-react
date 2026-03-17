import axios from 'axios'



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

    console.log('1111')
  
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

    console.log('xxxx')

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



