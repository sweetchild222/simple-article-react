import axios from 'axios'


export async function postArticle(jwt, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.post('/api/article', payload, { headers: headers})

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}




export async function getArticles(query) {

  try{
  
    const response = await axios.get('/api/article?' + query)
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function getArticleOpen(article_id) {

  try{
      const response = await axios.get('/api/article/' + article_id)

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}


export async function getArticle(jwt, article_id) {

  try{
        
      const authorization = 'Bearer '.concat(jwt);

      const response = await axios.get('/api/article/' + article_id, { headers: {Authorization: authorization} })

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function getUserArticles(jwt, user_id, query) {

  try{

      const authorization = 'Bearer '.concat(jwt);

      const response = await axios.get('/api/user/' + user_id + '/article?' + query, { headers: {Authorization: authorization}})

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}


export async function deleteArticle(jwt, article_id) {

  try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.delete('/api/article/' + article_id, { headers: {Authorization: authorization} })
    
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

