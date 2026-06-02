import axios from 'axios'


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



export async function del(url, jwt=null) {

  try{
    const authorization = jwt ? 'Bearer '.concat(jwt) : null

    const response = await axios.delete(url, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}





export async function putArticle(jwt, article_id, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.put('/api/article/' + article_id, payload, { headers: headers})

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}


