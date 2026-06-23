import * as restAPI from './RestAPI'

export async function getCategory(category_id){
    
  const url = '/api/category/' + category_id

  return await restAPI.get(url)
}


export async function getCategories(blog_id) {
      
  const url = '/api/blog/' + blog_id + '/category'

  return await restAPI.get(url)
}


export async function deleteCategory(jwt, category_id){
    
  const url = '/api/category/' + category_id

  return await restAPI.del(url, jwt)    
}


export async function patchCategory(jwt, category_id, payload){
  
  const url = '/api/category/' + category_id
  
  return await restAPI.patch(url, payload, jwt)
}


export async function postCategory(jwt, payload){
  
  const url = '/api/category'

  return await restAPI.post(url, payload, jwt)    
}


