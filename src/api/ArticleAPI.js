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


export async function getCategories(blog_id, query = undefined) {

  try{
    
      const url = '/api/blog/' + blog_id + '/category' + (query ? ('?' + query) : '')

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


