
import {useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import ElapsedTime from "@util/ElapsedTime.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import {HPad} from "@gui/Pad.js";

export default function({blog_id, article_id, category_id, category_name}) {

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
            <div style={{marginBottom:'8px', fontSize:'14px', color:'dimgray'}}>{'\'' + category_name + '\' ≫ 카테고리의 다른 글'}</div>
            <Vertical style={{alignItems:'left', padding:'8px', borderRadius:'3px', backgroundColor:'#EDEFF4', border:'1px solid #E4E6EA'}}>
                {articles.toReversed().map((data, index) => 
                    <Horizental key={data.id} style={{alignItems:'center'}}>
                        <div className={data.id != article_id ? ('clamped-text underline-text') : ('clamped-text')} key={data.id} style={{'--line-count':1, userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', color:'black', marginTop:'8px', marginBottom:'8px', fontWeight:(data.id == article_id  ? '600' : null)}} onClick={()=> onClickArticle(data.id)}>
                            {data.title}
                        </div>
                        <HPad size={16}/>
                        <div style={{color:'gray'}}>{ElapsedTime(data.post_at)}</div>
                    </Horizental>
                    )
                }
            </Vertical>
        </Vertical>        
    ) : null
}