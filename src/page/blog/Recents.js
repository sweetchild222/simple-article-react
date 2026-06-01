
import {useState, useContext, useEffect} from "react";
import { useNavigate} from 'react-router-dom';

import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import { MdEdit } from "react-icons/md";
import { FaPen } from "react-icons/fa6"

export default function({ref, blogId, isEdit}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [articles, setArticles] = useState(null)
    const navigate = useNavigate()
    
    useEffect(()=> {
        
        loadArticles()

    }, [blogId])


    const loadArticles = async() => {

        const query = 'offset=0&limit=5&order=1'

        const articles = await ArticleAPI.getBlogArticles(null, blogId, query)

        if(articles == null){
            window.showToast('최근 작성한 글을 가져 올 수 없습니다', 'error')
            return
        }
        
        setArticles(articles.length > 0 ? articles : null)
    }


    const onClickArticle = (id) =>{

        navigate('article/' + id)        
    }


    return articles ? (
        <div style={{display:'flex', flexDirection:'column'}}>
            <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'10px'}}>최근 글</label>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'left', padding:'10px', borderRadius:'3px', backgroundColor:'#EDEFF4', border:'1px solid #E4E6EA'}}>
                {articles.map((data, index) => <div className={'clamped-text'} key={data.id} style={{'--line-count':1, color:'black', cursor:'pointer', marginTop:'10px', marginBottom:'10px', whiteSpace: 'nowrap', fontWeight:'600'}} onClick={()=> onClickArticle(data.id)}>{data.title}</div>)}
            </div>
        </div>
    ) : null
}