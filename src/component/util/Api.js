import axios from 'axios'

export async function getUser(user_id) {

  try{

    const response = await axios.get('/api/user/' + user_id)
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}


export async function postAuthenticate(username, password) {
                
  try{
      
    const response = await axios.post('/api/authenticate', {username: username, password: password})

    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function postUser(usename, password){

  try{
    
    const response = await axios.post('/api/user', {username: usename, password: password})

    return response.data

  }
  catch(error){

    console.log(error)

    return null
  }
}

  
export async function getExistUser(username){
      
  try{
  
    const response = await axios.get('/api/user/exist/' + username)
    
    return response.data

  }
  catch(error){

    console.log(error)

    return null
  }
}


export async function postVerifyEmail(email) {
  
  try{

    const response = await axios.post('/api/verifyEmail', {email: email})

    return response.data

  }
  catch(error){

    console.log(error)
  }
}


export async function getVerifyEmail(email, code){

  try{
    
    const response = await axios.get('/api/verifyEmail/' + email + '/' + code)

    return response.data
          
  }
  catch(error){

    console.log(error)
  }
}



export async function getUserPasswordCheck(jwt, user_id, password) {

  try{

    const authorization = 'Bearer '.concat(jwt);

    const response = await axios.get('/api/user/' + user_id + '/password/' + password, { headers: {Authorization: authorization} })
    
    return response.data
  }
  catch(error){

    console.log(error)

    return null;
  }
}



export async function patchUser(jwt, user_id, payload){

  try{

    const authorization = 'Bearer '.concat(jwt);
    
    const response = await axios.patch('/api/user/' + user_id, payload, { headers: {Authorization: authorization}})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}




export async function postArticleImage(jwt, payload) {

  try {

    const authStr = 'Bearer '.concat(jwt);
  
    const headers = {Authorization: authStr, 'Content-Type':'multipart/form-data'};
    
    const response = await axios.post(`/api/blob/article`, payload, { headers: headers})

    return response.data
  }
  catch(error){

    console.log(error)

    return null
  }
}


export async function postArticle(jwt, payload){

  try {

      const authStr = 'Bearer '.concat(jwt);

      const headers = {Authorization: authStr};
      
      const response = await axios.post(`/api/article`, payload, { headers: headers})

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

