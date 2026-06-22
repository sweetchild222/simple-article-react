import * as restAPI from './RestAPI'


export async function deleteBookmark(jwt, bookmark_id){
    
  const url = '/api/bookmark/' + bookmark_id

  return await restAPI.del('/api/bookmark/' + bookmark_id, jwt)
}


export async function getUserBookmark(jwt, user_id, query){

  
  const url = '/api/user/' + user_id + '/bookmark'
  
  return await restAPI.get(url, query, jwt)
}


export async function postBookmark(jwt, payload){
  
  const url = '/api/bookmark'

  return await restAPI.post(url, payload, jwt)
}

