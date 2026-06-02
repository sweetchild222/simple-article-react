import * as restAPI from './RestAPI'

export async function getCommentGreat(query) {
  
  const url = '/api/comment/great'

  return await restAPI.get(url, query)
}


export async function postCommentGreat(jwt, payload){

  const url = '/api/comment/great'
  
  return await restAPI.post(url, payload, jwt)    
}



export async function patchCommentGreat(jwt, great_id, payload){

  const url = '/api/comment/great/' + great_id
  
  return await restAPI.patch(url, payload, jwt)
}


export async function deleteCommentGreat(jwt, great_id) {
  
  const url = '/api/comment/great/' + great_id

  return await restAPI.del(url, jwt)    
}

