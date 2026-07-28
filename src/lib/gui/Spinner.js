import {useEffect, useState} from 'react'

import './Spinner.css'
import { useFetcher } from 'react-router-dom';

export default function({type='default', radius=256, spinnerWidth=26, spinnerColor='rgba(95, 158, 160, 0.5)'}) {
    
  const calcTop = () =>{
        
    return 'calc((100% - ' + radius + 'px - '+ (spinnerWidth*2) + 'px)/2)'
  }


  const calcLeft = () =>{
    
    return 'calc((100% - ' + radius + 'px - '+ (spinnerWidth*2) + 'px)/2)'
  }
  

  return type == 'absolute' ? 
          (<div className={'spinnerProgress'} style={{position:'absolute', width:radius+'px', height:radius+'px', top:calcTop(), left:calcLeft(), zIndex:'1000', border:spinnerWidth + 'px solid rgba(0, 0, 0, 0)', borderTop: spinnerWidth + 'px solid ' + spinnerColor}}/>)
          :
          (<div style={{display:'flex', width:'100%', justifyContent:'center', height:'100%', alignItems:'center'}}>
            <div className={'spinnerProgress'} style={{width:radius+'px', height:radius+'px', border: spinnerWidth + 'px solid rgba(0, 0, 0, 0)', borderTop:spinnerWidth + 'px solid ' + spinnerColor}}/>
          </div>)          
}
