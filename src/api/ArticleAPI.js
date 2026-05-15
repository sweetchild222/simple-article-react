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

    
  
    const response = await axios.get('/api/article' + (query ? ('?' + query) : ''))
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}




export async function getArticle(jwt, article_id) {

  try{
        
      const authorization = jwt != null ? 'Bearer '.concat(jwt) : null

      const response = await axios.get('/api/article/' + article_id, { headers: {Authorization: authorization} })

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function getBlogArticles(jwt, blog_id, query) {

  try{
    
      const authorization = jwt != null ? 'Bearer '.concat(jwt) : null
      
      const response = await axios.get('/api/blog/' + blog_id + '/article' + (query ? ('?' + query) : ''), { headers: {Authorization: authorization}})

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




export async function postArticleShowed(article_id){

  try {

      const response = await axios.post('/api/article/' + article_id + '/showed')

      return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}



export async function getArticleGreat(jwt, query) {

  try{

    const authStr = 'Bearer '.concat(jwt);

    const headers = {Authorization: authStr};
  
    const response = await axios.get('/api/article/great' + (query ? ('?' + query) : ''), { headers: headers})
    
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


