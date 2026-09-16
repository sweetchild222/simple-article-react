import * as restAPI from './RestAPI'

export async function getUser(user_id) {

  const url = '/api/user/' + user_id

  return await restAPI.get(url)
}


export async function getUsers(query) {

  const url = '/api/user'

  return await restAPI.get(url, query)
}


export async function postUserPasswordCheck(jwt, user_id, password) {
    
  const url = '/api/user/' + user_id + '/password'

  const payload =  {password: password}
  
  return await restAPI.post(url, payload, jwt)
}


export async function patchUser(jwt, user_id, payload){
  
  const url = '/api/user/' + user_id
  
  return await restAPI.patch(url, payload, jwt)
}


export async function patchPasswordReset(email){

  const url = '/api/password-reset/email/' + email
      
  return await restAPI.patch(url)
}


export async function postCertifyPasswordReset(email) {
  
  const url = '/api/certify/password-reset'
  const payload = {email: email}
    
  return await restAPI.post(url, payload)
}


export async function patchCertifyPasswordReset(email, code){
      
  const url = '/api/certify/password-reset'
  const payload = {email: email, code:code}

  return await restAPI.patch(url, payload)
}


export async function postUser(usename, password, image, nickname){

  const url = '/api/user'
  const payload = {username: usename, password: password, image:image, nickname:nickname}
    
  return await restAPI.post(url, payload)
}


export async function getExistUser(username){

  const url = '/api/user/' + username + '/exist'

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

