
import { useContext } from "react";
import { useNavigate } from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from "@gui/PrettyButton.js";
import {Vertical} from "@gui/Flex.js";


export default function({blogId, categoryId}) {    
    
    const {auth, validAuth} = useContext(AuthContext)

    const navigate = useNavigate()

    const isEditable = ()=> {

        return (validAuth(auth) && auth.blog_id == blogId)
    }


    const onClickNewArticle = async() =>{

        if(!isEditable())
            return
        
        const query = 'posted=0'

        const res = await ArticleAPI.getBlogArticles(auth.jwt, blogId, query)

        if(res.success == false){
            window.showToast('작성 중인 글 가져오기가 실패하였습니다', 'system-error')
            return
        }

        const maxWritingCount = 10

        if(res.payload.length >= maxWritingCount){

            window.showToast('작성 중인 글이 너무 많습니다 (' + maxWritingCount + ' 이하)', 'user-error')
            return
        }
        
        if(categoryId == null){
            window.showToast('카테고리를 찾을 수 없습니다', 'user-error')
            return
        }

        const payload = {
            title:'',
            content:'',
            head:'',
            posted:0,
            thumbnail:'',
            category_id:categoryId
        }
                
        const resArticle = await ArticleAPI.postArticle(auth.jwt, payload)
        
        if(resArticle.success == false) {
            window.showToast('새 글 생성에 실패하였습니다', 'system-error')
            return
        }

        const state = {id:resArticle.payload.id, ...payload}

        navigate('/blog/' + blogId + '/write', {state:state})
    }

    return (
        <Vertical style={{alignItems:'right'}}>
            <PrettyButton type={'default'} tooltip='새글 작성' style={{marginTop:'8px',  whiteSpace: 'nowrap'}} onClick={onClickNewArticle}>{'새글 작성'}</PrettyButton>
        </Vertical>
    )
}