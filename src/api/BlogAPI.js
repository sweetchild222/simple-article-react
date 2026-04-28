import axios from 'axios'



export async function getBlog(id) {

    try{

      const url = '/api/blog/' + id

      const response = await axios.get(url)

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function patchBlog(jwt, blog_id, payload){

  try{

    const authorization = 'Bearer '.concat(jwt);
    
    const response = await axios.patch('/api/blog/' + blog_id, payload, { headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}
