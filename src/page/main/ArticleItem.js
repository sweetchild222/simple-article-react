import {useContext} from "react";
import {useNavigate} from 'react-router-dom';
import AuthContext from "@util/AuthContext.js";
import ElapsedTime from "@util/ElapsedTime.js";
import CountWithUnit from "@util/CountWithUnit.js";
import StateProgsImage from "@gui/StateProgsImage.js";
import * as ArticleAPI from '@rest/ArticleAPI.js'
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { MdThumbDownAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { IoMdHeart } from "react-icons/io";
import {Vertical, Horizental} from "@gui/Flex.js";

export default function({article}) {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    
    const navigate = useNavigate()
    
    const onClickNavigateArticle = async() => {
        
        navigate('/blog/' + article.blog_id + '/article/' + article.id)
    }
    
    return (
        <Horizental onClick={onClickNavigateArticle} style={{flex:'1', padding:'10px', cursor:'pointer', borderRadius:'3px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', backgroundColor:'#F5F5F5'}}>
            <Vertical style={{ flex:'1', marginLeft:'5px', marginRight:'5px'}}>
                <div className={'clamped-text underline-text'} style={{'--line-count':2, fontSize:'18px', fontWeight:'600', marginBottom:'10px', color:'#1A1A1A'}}>{article.title != '' ? article.title : '...'}</div>
                <div className={'clamped-text underline-text'} style={{'--line-count':3, marginBottom:'10px', color:'#222222'}}>{article.head.length >= 255 ? article.head + '...' : (article.head != '' ? article.head : '내용 없음')}</div>
                <div style={{flex:'1'}}></div>
                <Horizental style={{alignItems:'center', color:'#888888'}}>
                    {article.posted == 1 &&                     
                        <Horizental>
                            <Horizental>
                                <IoMdHeart size={22}/>
                                <div style={{width:'5px'}}/>
                                {CountWithUnit(article.bookmark_count)}
                            </Horizental>
                            <div style={{width:'30px'}}/>
                            <Horizental>
                                <MdThumbUpAlt size={22}/>
                                <div style={{width:'5px'}}/>
                                {CountWithUnit(article.like_count)}
                            </Horizental>                            
                            <div style={{width:'30px'}}/>
                            <Horizental>
                                <BiSolidComment size={22}/>
                                <div style={{width:'5px'}}/>
                                {CountWithUnit(article.comment_count)}
                            </Horizental>
                            <div style={{width:'30px'}}/>
                        </Horizental>
                    }
                    <Horizental style={{flex:'1', whiteSpace: 'nowrap', justifyContent:'flex-end'}} >{article.post_at ? ElapsedTime(article.post_at) : ''}</Horizental>
                </Horizental>

            </Vertical>
            {article.thumbnail != '' && <StateProgsImage src={article.thumbnail + '?size=170x170'} width={170} height={170} borderWidth={0}/>}
        </Horizental>
    )
}

