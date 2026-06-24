import * as restAPI from './RestAPI'

export async function getAlarm(jwt, user_id){
    
  const url = '/api/user/' + user_id + '/alarm'  

  return await restAPI.get(url, null, jwt)
}



export async function postAlarm(jwt, payload) {
  
  const url = '/api/alarm'

  return await restAPI.post(url, payload, jwt)
}



export async function deleteAlarm(jwt, alarm_id){
    
  const url = '/api/alarm/' + alarm_id

  return await restAPI.del(url, jwt)    
}



export async function patchAlarm(jwt, alarm_id, payload){

  const url = '/api/alarm/' + alarm_id

  return await restAPI.patch(url, payload, jwt)
}
