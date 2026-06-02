import * as restAPI from './RestAPI'

export async function getBlog(id) {

  const url = '/api/blog/' + id

  return await restAPI.get(url)
}


export async function postBlog(jwt, payload){

  const url = '/api/blog'

  return await restAPI.post(url, payload, jwt)  
}


export async function deleteBlog(jwt, blog_id){

  const url = '/api/blog/' + blog_id

  return await restAPI.del(url, jwt)
}


export async function patchBlog(jwt, blog_id, payload){

  const url = '/api/blog/' + blog_id

  return await restAPI.patch(url, payload, jwt)
}
