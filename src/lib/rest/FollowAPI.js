import * as restAPI from './RestAPI'


export async function deleteFollow(jwt, follow_id){
    
  const url = '/api/follow/' + follow_id

  return await restAPI.del(url, jwt)
}


export async function getFollow(query){

  const url = '/api/follow'
  
  return await restAPI.get(url, query)
}


export async function patchFollow(jwt, follow_id, payload){
  
  const url = '/api/follow/' + follow_id
  
  return await restAPI.patch(url, payload, jwt)
}


export async function postFollow(jwt, payload){
  
  const url = '/api/follow'

  return await restAPI.post(url, payload, jwt)
}

