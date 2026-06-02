import * as restAPI from './RestAPI'


export async function postProfile(jwt, payload) {

  const url = '/api/blob/profile'

  return await restAPI.postBlob(url, payload, jwt)
}


export async function postArticleImage(jwt, payload) {

  const url = '/api/blob/article'

  return await restAPI.postBlob(url, payload, jwt)
}


export async function postArticleThumbnail(jwt, payload) {

  const url = '/api/blob/article/thumbnail'

  return await restAPI.postBlob(url, payload, jwt)
}


export async function postBlogImage(jwt, payload) {

  const url = '/api/blob/blog/image'

  return await restAPI.postBlob(url, payload, jwt)
}


