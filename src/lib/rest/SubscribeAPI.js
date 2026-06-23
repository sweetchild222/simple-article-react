import * as restAPI from './RestAPI'


export async function deleteSubscribe(jwt, subscribe_id){
    
  const url = '/api/subscribe/' + subscribe_id

  return await restAPI.del(url, jwt)
}


export async function getSubscribe(query){

  const url = '/api/subscribe'
  
  return await restAPI.get(url, query)
}


export async function postSubscribe(jwt, payload){
  
  const url = '/api/subscribe'

  return await restAPI.post(url, payload, jwt)
}

