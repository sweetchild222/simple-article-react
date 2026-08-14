import {useContext} from "react";
import {useNavigate} from 'react-router-dom';
import AuthContext from "@util/AuthContext.js";
import ProfileImage from "@gui/ProfileImage.js";
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
import {VPad, HPad} from "@gui/Pad.js";
import './ArticleItem.css'

export default function({article, style}) {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    
    const navigate = useNavigate()    
    
    const onClickNavigateArticle = async() => {

        navigate('/blog/' + article.blog_id + '/article/' + article.id)
    }
    
    
    return (
        <Vertical onClick={onClickNavigateArticle} style={{cursor:'pointer', ...style}}>
            <div className={'card'} style={{'--imgurl--': article.thumbnail != '' ? `url(${article.thumbnail + '?size=960x540'})` : 'url(/logo/logo128.png)'}}>
                <div style={{position:'absolute', zIndex:1, inset: 0, backgroundColor:'rgba(0, 0, 0, 0.4)', color:'white', borderRadius:'3px'}}/>
                <div className={'clamped-text'} style={{'--line-count':3, position:'absolute', zIndex:2, fontSize:'18px', color:'lightgray', left:'0px', top:'0px', marginTop:'8px', marginLeft:'8px', marginRight:'8px', textShadow:'2px 2px 2px rgba(0, 0, 0, 0.3)'}}>
                    {article.head}
                </div>
                <Horizental style={{position:'absolute', zIndex:3, left:'0px', bottom:'0px', color:'lightgray', width:'100%', alignItems:'center', paddingLeft:'8px', paddingRight:'8px', paddingBottom:'8px'}}>
                    <IoMdHeart size={22}/>
                    <HPad size={4}/>
                    {CountWithUnit(article.bookmark_count)}
                    <HPad size={32}/>
                    <MdThumbUpAlt size={22}/>
                    <HPad size={4}/>
                    {CountWithUnit(article.like_count)}
                    <HPad size={32}/>
                    <BiSolidComment size={22}/>
                    <HPad size={4}/>
                    {CountWithUnit(article.comment_count)}
                    <Horizental style={{display:'flex', flex:'1', whiteSpace: 'nowrap', justifyContent:'flex-end'}} >{article.post_at ? ElapsedTime(article.post_at) : ''}</Horizental>
                </Horizental>
            </div>
            
            <Horizental style={{alignItems:'start', marginTop:'8px'}}>
                <ProfileImage shape={'circle'} size={48} user={article.user}></ProfileImage>
                <HPad size={16}/>
                <div className={'clamped-text'} style={{'--line-count':2, fontSize:'18px', color:'black', textShadow:'2px 2px 2px rgba(0, 0, 0, 0.3)'}}>{article.title}</div>
            </Horizental>

        </Vertical>
    )
}

