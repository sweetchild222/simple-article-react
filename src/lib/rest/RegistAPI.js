import * as restAPI from './RestAPI'


export async function postUser(usename, password, image, nickname){

  const url = '/api/user'
  const payload = {username: usename, password: password, image:image, nickname:nickname}
    
  return await restAPI.post(url, payload)
}


export async function getExistUser(username){

  const url = '/api/user/exist/' + username

  return await restAPI.get(url)
}


export async function postVerifyEmail(email) {
  
  const url = '/api/verifyEmail'
  const payload = {email: email}
    
  return await restAPI.post(url, payload)
}


export async function getVerifyEmail(email, code){
    
  const url = '/api/verifyEmail/' + email + '/' + code

  return await restAPI.get(url)
}

