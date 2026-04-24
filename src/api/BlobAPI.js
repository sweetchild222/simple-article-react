import axios from 'axios'


export async function postProfile(jwt, payload) {

  try {

    const authStr = 'Bearer '.concat(jwt);
  
    const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
    
    const response = await axios.post('/api/blob/profile', payload, { headers: headers})

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
    
    const response = await axios.post('/api/blob/article', payload, { headers: headers})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function postArticleThumbnail(jwt, payload) {

  try {

    const authStr = 'Bearer '.concat(jwt);
  
    const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
    
    const response = await axios.post('/api/blob/article/thumbnail', payload, { headers: headers})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



