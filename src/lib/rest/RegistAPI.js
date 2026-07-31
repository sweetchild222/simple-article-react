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


export async function postCertifyUserJoin(email) {
  
  const url = '/api/certify/user-join'
  const payload = {email: email}
    
  return await restAPI.post(url, payload)
}


export async function patchCertifyUserJoin(email, code){
      
  const url = '/api/certify/user-join'
  const payload = {email: email, code:code}  

  return await restAPI.patch(url, payload)
}

