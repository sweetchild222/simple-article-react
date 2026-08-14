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
import DeviceType from "@util/DeviceType.js";
import {VPad, HPad} from "@gui/Pad.js";

export default function({article, categoryName, style}) {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    
    const navigate = useNavigate()
    
    const onClickNavigateArticle = async() =>{

        if(article.posted == 1)
            navigate('article/' + article.id)
        else{
            
            if(validAuth(auth)){

                if(auth.blog_id != article.blog_id)
                    return

                const res = await ArticleAPI.getArticle(auth.jwt, article.id)

                if(res.success == false){
                    window.showToast('작성 중인 글 가져오기가 실패하였습니다', 'system-error')
                    return
                }
                navigate('/blog/' + article.blog_id + '/write', {state:res.payload})
            }
        }
    }
        
    return (
        <Horizental onClick={onClickNavigateArticle} style={{flex:'1', padding:'8px', cursor:'pointer', borderRadius:'3px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', backgroundColor:'#F5F5F5', ...style}}>
            <Vertical style={{flex:'1', marginLeft:'4px', marginRight:'8px'}}>
                <div className={'clamped-text underline-text'} style={{'--line-count':1, fontSize:'18px', fontWeight:'500', marginBottom:'4px', color:'#1A1A1A'}}>{article.title != '' ? article.title: '...'}</div>
                <div className={'clamped-text underline-text'} style={{'--line-count':DeviceType() == 'mobile' ? 2 : 5, marginBottom:'8px', color:'#222222'}}>{article.head.length >= 255 ? article.head + '...' : (article.head != '' ? article.head + 'asfasfiljasfisdjisodjofiwjwoijoiejwfiojwfiofjwiosdfoijsdoifjsoifjsdoifjsdiojsdiosdjfoisdjosdfjoasfasfiljasfisdjisodjofiwjwoijoiejwfiojwfiofjwiosdfoijsdoifjsoifjsdoifjsdiojsdiosdjfoisdjosdfjoasfasfiljasfisdjisodjofiwjwoijoiejwfiojwfiofjwiosdfoijsdoifjsoifjsdoifjsdiojsdiosdjfoisdjosdfjoasfasfiljasfisdjisodjofiwjwoijoiejwfiojwfiofjwiosdfoijsdoifjsoifjsdoifjsdiojsdiosdjfoisdjosdfjo' : '내용 없음')}</div>
                <div style={{flex:'1'}}></div>
                <Horizental style={{alignItems:'center', color:'#888888'}}>
                    {article.posted == 1 &&
                        <Horizental>
                            <IoMdHeart size={22}/>
                            <HPad size={4}/>
                            {CountWithUnit(article.bookmark_count)}
                            <div style={{width:'32px'}}/>
                            <MdThumbUpAlt size={22}/>
                            <HPad size={4}/>
                            {CountWithUnit(article.like_count)}
                            <HPad size={32}/>
                            <BiSolidComment size={22}/>
                            <HPad size={4}/>
                            {CountWithUnit(article.comment_count)}
                            <HPad size={32}/>
                        </Horizental>
                    }
                    {article.posted == 0 && <Horizental style={{marginRight:'32px'}}>
                            <div className={'clamped-text'} style={{'--line-count':1}}>{categoryName}</div>
                        </Horizental>
                    }
                    <Horizental style={{flex:'1', whiteSpace: 'nowrap', justifyContent:'flex-end'}} >{article.post_at ? ElapsedTime(article.post_at) : ''}</Horizental>
                </Horizental>
            </Vertical>
            {DeviceType() == 'mobile' && article.thumbnail != '' && <StateProgsImage src={article.thumbnail + '?size=96x96'} width={96} height={96} borderWidth={0}/>}
            {DeviceType() != 'mobile' && article.thumbnail != '' && <StateProgsImage src={article.thumbnail + '?size=170x170'} width={170} height={170} borderWidth={0}/>}
        </Horizental>
    )
}

