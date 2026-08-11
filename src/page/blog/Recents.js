
import {useState, useContext, useEffect} from "react";
import { useNavigate} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import AuthContext from "@util/AuthContext.js";
import { MdEdit } from "react-icons/md";
import { FaPen } from "react-icons/fa6"

import {Vertical, Horizental} from "@gui/Flex.js";


export default function({ref, blogId, isEdit}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [articles, setArticles] = useState(null)
    const navigate = useNavigate()
    
    useEffect(()=> {
        
        loadArticles(blogId).then(articles => {

            if(articles == null){
                window.showToast('최근 작성한 글을 가져오기에 실패하였습니다', 'system-error')
                return
            }
        
            setArticles(articles.length > 0 ? articles : null)
        })

    }, [blogId])


    const loadArticles = async(blog_id) => {

        const query = 'offset=0&limit=5&order=1'

        const articles = await ArticleAPI.getBlogArticles(null, blog_id, query)

        if(articles.success == false)
            return null

        return articles.payload
    }


    const onClickArticle = (id) =>{

        navigate('article/' + id)
    }


    return articles ? (
        <Vertical>
            <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'8px'}}>최근 글</label>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'left', padding:'4px 8px 4px 8px', borderRadius:'3px', backgroundColor:'#EDEFF4', border:'1px solid #E4E6EA'}}>
                {articles.map((data, index) => <div className={'clamped-text'} key={data.id} style={{'--line-count':1, color:'black', cursor:'pointer', marginTop:'8px', marginBottom:'8px', whiteSpace: 'nowrap'}} onClick={()=> onClickArticle(data.id)}>{data.title}</div>)}
            </div>
        </Vertical>
    ) : null
}