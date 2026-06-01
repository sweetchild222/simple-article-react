import axios from 'axios'



export async function getCommentGreat(query) {

  try{

    const response = await axios.get('/api/comment/great' + (query ? ('?' + query) : ''))
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}




export async function postCommentGreat(jwt, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.post('/api/comment/great', payload, { headers: headers})

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}




export async function patchCommentGreat(jwt, great_id, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.patch('/api/comment/great/' + great_id, payload, { headers: headers})

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}






export async function deleteCommentGreat(jwt, great_id) {

  try{

    const authStr = 'Bearer '.concat(jwt);

    const headers = {Authorization: authStr};
  
    const response = await axios.delete('/api/comment/great/' + great_id, { headers: headers})
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



