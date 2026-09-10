import * as restAPI from './RestAPI'

export async function getUser(user_id) {

  const url = '/api/user/' + user_id

  return await restAPI.get(url)
}


export async function getUsers(query) {

  const url = '/api/user'

  return await restAPI.get(url, query)
}


export async function postAuthenticate(username, password) {

  const url = '/api/authenticate'
  const payload =  {username: username, password: password}
      
  return await restAPI.post(url, payload)
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

