import * as restAPI from './RestAPI'


export async function getArticleComments(article_id) {
  
  const url = '/api/article/' + article_id + '/comment'

  return await restAPI.get(url)
}



export async function postComment(jwt, payload) {

  const url = '/api/comment'

  return await restAPI.post(url, payload, jwt)
}



export async function putComment(jwt, comment_id, payload) {

  const url = '/api/comment/' + comment_id

  return await restAPI.put(url, payload, jwt)
}


export async function deleteComment(jwt, comment_id){
  
  const url = '/api/comment/' + comment_id

  return await restAPI.del(url, jwt)
}
