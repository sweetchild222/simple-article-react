import * as restAPI from './RestAPI'


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

