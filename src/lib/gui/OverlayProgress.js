import {useEffect, useState} from 'react'

import './OverlayProgress.css'

export default function(props) {

  const size = props.size != null ? props.size + 'px' : '256px'    
  const type = props.type != null ? props.type : 'overall' // 'overall', 'relative', 'absolute'

  const [start, setStart] = useState(false)

  useEffect(()=> {

    setTimeout(()=>{

      setStart(true)

    }, 500)

  }, [])


  return (type == 'overall' ? <div className={start ? 'overlayProgress' : ''} style={{'--width--':size, '--height--':size, position: 'fixed', top:'0', left:0, width:'100vw', height:'100vh', zIndex:'1000'}}/> : 
    
      ( type  == 'absolute' ? <div className={start ? 'overlayProgress' : ''} style={{'--width--':size, '--height--':size}}/>
          :
          <div style={{position:'relative', width:'100%', height:'100%'}}><div className={start ? 'overlayProgress' : ''} style={{'--width--':size, '--height--':size}}/></div>
      ))
}
