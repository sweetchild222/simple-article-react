
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

import Modal from '../../common/Modal.js'
import MDXEditor from './MDXEditor.js'
import BeautyButton from '../../common/BeautyButton.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import AuthContext from "../../util/AuthContext.js";
import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useBlocker} from 'react-router-dom';
import * as ArticleAPI from '../../api/ArticleAPI.js'
import { Prompt } from 'react-router'



import ImageCropModal from '../../common/ImageCropModal.js'

import ImageScale, {getBlob} from "../../util/ImageScale.js";
import LoadingImage from "../../common/LoadingImage.js";
import { BsTrash } from "react-icons/bs";
import { PiTrash } from "react-icons/pi";

import '../../common/RotateLoading.css'
import * as blobToBase64 from '../../util/BlobToBase64.js'


export default ({categories, isOpen, onClose, onPost}) => {

    const [openType, setOpenType] = useState(1)
    const [categoryId, setCategoryId] = useState(categories[0].id)
    
    const modal_config = {type: 'custom', isCloseOutsideClick: false}

    const onChangeRadio = (e) => {

        setOpenType(e.target.value == 'open' ? 1 : 0)
    }


    const onChangeSelect = (e) => {
        
        setCategoryId(parseInt(e.target.value))
    }

    const onPostCore = () => {

        if(onPost != null)
            onPost(categoryId, openType)
    }


    return (
            <Modal config={modal_config} isOpen={isOpen} onClose={onClose}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <select onChange={onChangeSelect} value={categoryId} >
                        {categories.map(item => (<option key={item.id} value={item.id}>{item.name}</option>))}
                    </select>
                    <input type='radio' id='open' name='is_open' value='open' onChange={onChangeRadio} checked={openType == true}/>
                    <label htmlFor='open'>공개</label>
                    <input type='radio' id='private' name='is_open' value='private' onChange={onChangeRadio} checked={openType == false}/>
                    <label htmlFor='private'>비공개</label>
                    <BeautyButton type='success' onClick={onPostCore}>확인</BeautyButton>
                    <BeautyButton type='cancel' onClick={onClose}>취소</BeautyButton>
                </div>
            </Modal>
    )
}

