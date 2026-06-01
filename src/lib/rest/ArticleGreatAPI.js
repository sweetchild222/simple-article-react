import axios from 'axios'



export async function getArticleGreat(query) {

  try{

    const response = await axios.get('/api/article/great' + (query ? ('?' + query) : ''))
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}




export async function postArticleGreat(jwt, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.post('/api/article/great', payload, { headers: headers})

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}




export async function patchArticleGreat(jwt, great_id, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.patch('/api/article/great/' + great_id, payload, { headers: headers})

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}






export async function deleteArticleGreat(jwt, great_id) {

  try{

    const authStr = 'Bearer '.concat(jwt);

    const headers = {Authorization: authStr};
  
    const response = await axios.delete('/api/article/great/' + great_id, { headers: headers})
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



