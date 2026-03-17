import axios from 'axios'


export async function postProfile(jwt, payload) {

  try {

    const authStr = 'Bearer '.concat(jwt);
  
    const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
    
    const response = await axios.post(`/blob/profile`, payload, { headers: headers})

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

    const response = await axios.get('/blob/profile/' + id, { headers: {Authorization: authorization}, responseType: 'blob'})

    return response.data

  }
  catch(error){

    console.log(error)

    return null
  }
}




export async function postArticleImage(jwt, payload) {

  try {

    const authStr = 'Bearer '.concat(jwt);
  
    const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
    
    const response = await axios.post('/blob/article', payload, { headers: headers})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



