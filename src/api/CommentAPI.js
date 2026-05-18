import axios from 'axios'



export async function getArticleComments(article_id) {

  try{
              
      const response = await axios.get('/api/article/' + article_id + '/comment')

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function postComment(jwt, payload){


    try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.post('/api/comment', payload, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function putComment(jwt, comment_id, payload) {


    try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.put('/api/comment/' + comment_id, payload, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function deleteComment(jwt, comment_id){


    try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.delete('/api/comment/' + comment_id, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



