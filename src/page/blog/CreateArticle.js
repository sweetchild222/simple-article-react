
import { useContext } from "react";

import { useNavigate } from 'react-router-dom';

import * as BlobAPI from '@rest/BlobAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'

import AuthContext from "@util/AuthContext.js";
import PrettyButton from "@gui/PrettyButton.js";
import {Vertical, Horizental} from "@gui/Flex.js";

export default function({ref, blogId, categoryId}) {    
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const navigate = useNavigate()

    const isEditable = ()=> {

        return (validAuth(auth) && auth.blog_id == blogId)
    }


    const findCategoryId = async(blogId) => {
    
        const res = await CategoryAPI.getCategories(blogId)
        
        if(res.success == false)
            return -1

        res.payload.sort((a, b)=> {
            return a.id - b.id
        })

        if(res.payload.length == 0)
            return -1

        return res.payload[0].id
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

        const category_id = categoryId == 0 ? await findCategoryId(blogId) : categoryId

        if(category_id == -1){
            window.showToast('카테고리를 찾을 수 없습니다', 'user-error')
            return
        }

        const payload = {
            title:'',
            content:'',
            head:'',
            posted:0,
            thumbnail:'',
            category_id:category_id
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
            <PrettyButton type={'confirm'} tooltip='새글 작성' style={{marginTop:'8px',  whiteSpace: 'nowrap'}} onClick={onClickNewArticle}>{'새글 작성'}</PrettyButton>
        </Vertical>
    )
}