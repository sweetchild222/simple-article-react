import axios from 'axios'

export async function getUser(user_id) {

  try{

    const response = await axios.get('/api/user/' + user_id)
    
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

