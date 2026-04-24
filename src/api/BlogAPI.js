import axios from 'axios'



export async function getBlog(id) {

    try{

      const url = '/api/blog/' + id

      const response = await axios.get(url)

      return response.data    

  }
  catch(error){

    console.log(error)

    return null;
  }
}