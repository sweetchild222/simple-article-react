import axios from 'axios'



export async function getCategories(blog_id) {

  try{
    
      const url = '/api/blog/' + blog_id + '/category'

      const response = await axios.get(url)

      return response.data

  }
  catch(error){

    console.log(error)

    return null;
  }
}


export async function deleteCategory(jwt, category_id){


    try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.delete('/api/category/' + category_id, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}




export async function patchCategory(jwt, category_id, payload){

  try{

    const authorization = 'Bearer '.concat(jwt);
    
    const response = await axios.patch('/api/category/' + category_id, payload, { headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function postCategory(jwt, payload){

  try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.post('/api/category', payload, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}


