import * as restAPI from './RestAPI'


export async function postAuthenticate(username, password) {

  const url = '/api/authenticate'
  const payload =  {username: username, password: password}
      
  return await restAPI.post(url, payload)
}

