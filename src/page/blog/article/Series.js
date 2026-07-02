
import {useState, useContext, useEffect} from "react";
import { useNavigate } from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import AuthContext from "@util/AuthContext.js";
import ElapsedTime from "@util/ElapsedTime.js";
import { MdEdit } from "react-icons/md";
import { FaPen } from "react-icons/fa6"

import {Vertical, Horizental} from "@gui/Flex.js";

export default function({ref, blog_id, article_id, category_id}) {

    const [articles, setArticles] = useState(null)

    const navigate = useNavigate()
        
    useEffect(()=> {

        const limit = 4

        const min_query =  'limit=' + limit + '&category_id=' + category_id + '&min_article_id=' + article_id + '&order=0'
        const max_query =  'limit=' + limit + '&category_id=' + category_id + '&max_article_id=' + article_id + '&order=1'
        
        ArticleAPI.getBlogArticles(null, blog_id, min_query).then(minRes => {

            if(minRes.success == false)
                return
                        
            ArticleAPI.getBlogArticles(null, blog_id, max_query).then(maxRes => {

                if(maxRes.success == false)
                    return

                const combined = [...minRes.payload, ...maxRes.payload]

                const unique = [...new Map(combined.map(article => [article.id, article])).values()];

                unique.sort((a, b)=> a.post_at - b.post_at)

                if(unique.length > 1)
                    setArticles(unique)                
            })
        })
        
    }, [article_id])


    const onClickArticle = async(value)=> {

        if(article_id == value)
            return

        navigate('/blog/' + blog_id + '/article/' + value)
    }

    return articles ? (
        <Vertical style={{width:'100%'}}>
            <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'10px', alignSelf:'start'}}>앞뒤 글</label>
            <Vertical style={{alignItems:'left', padding:'10px', borderRadius:'3px', backgroundColor:'#EDEFF4', border:'1px solid #E4E6EA'}}>
                {articles.map((data, index) => 
                    <Horizental style={{alignItems:'center'}}>                        
                        
                        <div className={data.id != article_id ? ('clamped-text underline-text') : ('clamped-text')} key={data.id} style={{'--line-count':1, color:'black', marginTop:'10px', marginBottom:'10px', fontWeight:(data.id == article_id  ? '600' : null)}} onClick={()=> onClickArticle(data.id)}>
                            {data.title}
                        </div>
                        <div style={{width:'16px'}}></div>
                        <div style={{color:'gray'}}>{ElapsedTime(data.post_at)}</div>
                    </Horizental>
                    )
                }
            </Vertical>
        </Vertical>        
    ) : null
}