import {useNavigate} from 'react-router-dom';

import ProfileImage from "@gui/ProfileImage.js";
import ElapsedTime from "@util/ElapsedTime.js";
import CountWithUnit from "@util/CountWithUnit.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import {HPad, VPad} from "@gui/Pad.js";

import { MdThumbUpAlt } from "react-icons/md";
import { IoMdHeart } from "react-icons/io";
import { PiChatTeardropTextFill } from "react-icons/pi";

import './ArticleItem.css'

export default function({article, style}) {
    
    const navigate = useNavigate()
    
    const onClickNavigateArticle = async() => {

        navigate('/blog/' + article.blog_id + '/article/' + article.id)
    }
    
    return (
        <Vertical onClick={onClickNavigateArticle} style={{cursor:'pointer', ...style}}>
            <div className={'card'} style={{position: 'relative', '--imgurl--': article.thumbnail != '' ? `url(${article.thumbnail + '?size=960x540'})` : 'url(/logo/logo128.png)'}}>
                <div style={{position:'absolute', zIndex:1, inset: 0, backgroundColor:'rgba(0, 0, 0, 0.3)', color:'white', borderRadius:'3px'}}/>
                <Vertical style={{position:'absolute', zIndex:2, left:'0px', top:'0px', marginTop:'8px', marginLeft:'8px', marginRight:'8px'}}>
                    <div className={'clamped-text'} style={{'--line-count':2, fontSize:'24px', color:'white', textShadow:'2px 2px 2px rgba(0, 0, 0, 0.3)'}}>
                        {article.title}
                    </div>
                    <VPad size={16}/>
                    <div className={'clamped-text'} style={{'--line-count':3, fontSize:'18px', color:'whitesmoke'}}>
                        {article.head}
                    </div>
                </Vertical>
                <Horizental style={{position:'absolute', zIndex:3, left:'0px', bottom:'0px', color:'whitesmoke', width:'100%', alignItems:'center', paddingLeft:'8px', paddingRight:'8px', paddingBottom:'8px'}}>
                    <IoMdHeart size={22}/>
                    <HPad size={4}/>
                    {CountWithUnit(article.bookmark_count)}
                    <HPad size={32}/>
                    <MdThumbUpAlt size={22}/>
                    <HPad size={4}/>
                    {CountWithUnit(article.like_count)}
                    <HPad size={32}/>
                    <PiChatTeardropTextFill size={22}/>
                    <HPad size={4}/>
                    {CountWithUnit(article.comment_count)}
                    <Horizental style={{display:'flex', flex:'1', whiteSpace: 'nowrap', justifyContent:'flex-end'}} >{article.post_at ? ElapsedTime(article.post_at) : ''}</Horizental>
                </Horizental>
            </div>
            
            <Horizental style={{alignItems:'center', marginTop:'8px'}}>
                <ProfileImage shape={'circle'} size={48} user={article.user} style={{borderWidth:'1px'}}></ProfileImage>
                <HPad size={8}/>
                <div className={'clamped-text'} style={{'--line-count':1, fontSize:'18px', color:'black'}}>{article.user.nickname}</div>
            </Horizental>

        </Vertical>
    )
}

