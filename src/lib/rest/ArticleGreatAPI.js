import * as restAPI from './RestAPI'

export async function getArticleGreat(query) {

  const url = '/api/article/great'

  return await restAPI.get(url, query)
}


export async function postArticleGreat(jwt, payload){

  const url = '/api/article/great'

  return await restAPI.post(url, payload, jwt)
}


export async function patchArticleGreat(jwt, great_id, payload){

  const url = '/api/article/great/' + great_id

  return await restAPI.patch(url, payload, jwt)
}


export async function deleteArticleGreat(jwt, great_id) {

  const url = '/api/article/great/' + great_id

  return await restAPI.del(url, jwt)
}
