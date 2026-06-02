import axios from 'axios'


export async function get(url, query=null, jwt=null) {

  try{

    const authorization = jwt ? 'Bearer '.concat(jwt) : null

    const response = await axios.get(url + (query ? ('?' + query) : ''), {headers: {Authorization: authorization}})
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}


export async function post(url, payload=null, jwt=null){

  try {
      
    const authorization = jwt != null ? 'Bearer '.concat(jwt) : null
      
    const response = await axios.post(url, payload, {headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}


export async function postBlob(url, payload=null, jwt=null){

  try {

    const authorization = jwt != null ? 'Bearer '.concat(jwt) : null

    const response = await axios.post(url, payload, {headers: {Authorization: authorization, 'Content-Type':'multipart/form-data'}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function del(url, jwt=null) {

  try{
    
    const authorization = jwt ? 'Bearer '.concat(jwt) : null

    const response = await axios.delete(url, { headers: {Authorization: authorization}})
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function put(url, payload=null, jwt=null){

  try {

    const authorization = jwt ? 'Bearer '.concat(jwt) : null
      
    const response = await axios.put(url, payload, { headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function patch(url, payload=null, jwt=null){
  
  try {

    const authorization = jwt ? 'Bearer '.concat(jwt) : null
    
    const response = await axios.patch(url, payload, { headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}
