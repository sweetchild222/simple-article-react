import * as restAPI from './RestAPI'

export async function postArticle(jwt, payload) {

  const url = '/api/article'

  return await restAPI.post(url, payload, jwt)
}


export async function getArticles(query) {

  const url = '/api/article'

  return await restAPI.get(url, query)
}



export async function getArticle(jwt, article_id) {  

  const url = '/api/article/' + article_id

  return await restAPI.get(url, null, jwt)
}



export async function getBlogArticles(jwt, blog_id, query) {

  const url = '/api/blog/' + blog_id + '/article'  

  return await restAPI.get(url, query, jwt)
}


export async function deleteArticle(jwt, article_id) {

  const url = '/api/article/' + article_id

  return await restAPI.del(url, jwt)
}


export async function postArticleShowed(article_id){

  const url = '/api/article/' + article_id + '/showed'

  return await restAPI.post(url, null, null)
}


export async function putArticle(jwt, article_id, payload){

  const url = '/api/article/' + article_id

  return await restAPI.put(url, payload, jwt)
}
