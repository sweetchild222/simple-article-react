
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import './Home.css'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import ProfileContext from "../../util/ProfileContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";

export default function() {

  const { id } = useParams()

  const navigate = useNavigate()

  const [categories, setCategories] = useState(null)
  const [movingbarPos, setMovingbarPos] = useState({curIndex:0, start:0, end:0})
  const [animationKey, setAnimationKey] = useState(0);
  
    
  useEffect(()=> {

    if(!Number.isInteger(parseInt(id))){
      navigate('/pageNotFound')
      return
    }
    

    BlogAPI.getBlog(id).then((blog)=> {

      if(blog == null) {
        navigate('/pageNotFound')
        return
      }

      getCategory(blog.user_id).then((categories) =>{

        if(categories == null || categories.length == 0){
          window.showToast('카테고리를 가져 올 수 없습니다', 'error')
          return
        }
        
        setCategories(categories)

      })
    })
  
  }, [] )


  const getCategory = async(user_id) => {

      const res = await ArticleAPI.getCategories(user_id)
      
      if(res == null)
          return null

      if(res.length == 0)
          return null
  
      res.sort((a, b)=> {

          if(a.is_default != b.is_default)
              return b.is_default - a.is_default
          else
              return a.id - b.id
      })

      return res
  }

  
  const onClickCategory = async(id) => {

    const index = categories.findIndex(categorie => categorie.id === id)
    
    const width = 100
    const margin = 10
    
    const endPos = index * (width + margin)
      
    setMovingbarPos({curIndex: index, start:movingbarPos.end, end:endPos})
    restartAnimation()
  }
  
  const restartAnimation = () => setAnimationKey(prev => prev + 1);

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%'}}>
      <div style={{ display: 'flex', flexDirection: 'column'}}>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          {categories && categories.map((data, index) => <BeautyButton type='success'  key={data.id} style={{color:'black', width:'100px', marginRight:'10px'}} onClick={()=> onClickCategory(data.id)}>{data.name}</BeautyButton>)}
        </div>
        {categories && <div key={animationKey} className={'movingbar'} style={{width:'100px', height:'3px', borderRadius:'2px', backgroundColor:'gray', '--start--':movingbarPos.start + 'px', '--end--':movingbarPos.end + 'px', marginTop:'3px'}}></div>}
      </div>
    </div>
  );
}
