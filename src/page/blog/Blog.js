
import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import ProfileContext from "../../util/ProfileContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";

export default function() {
  
  const location = useLocation()

  const state = location.state

  if(state == null)
      return (<div>잘못된 방식으로 접근하였습니다</div>)

    

  return (
    <div className="App">
      <button>Library</button>      
    </div>
  );
}
