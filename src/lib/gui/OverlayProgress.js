import './OverlayProgress.css'

export default function(props) {

  const size = props.size != null ? props.size + 'px' : '256px'

  console.log(size)

  const type = props.type != null ? props.type : 'overall' // 'overall', 'cover'  

  return type == 'overall' ? <div className={`overlayProgress`} style={{'--width--':size, '--height--':size, position: 'fixed', top:'0', left:0, width:'100vw', height:'100vh', zIndex:'1000'}}/> : (
        <div style={{display:'flex', justifyContent:'center', position:'relative', alignItems:'center', width:'100%', height:'100%'}}>
            <div className={`overlayProgress`} style={{'--width--':size, '--height--':size}}/>
        </div>
      )
}

//<div className={`overlayProgress`} style={{position: 'fixed', top:'0', left:0, width:'100vw', height:'100vh', zIndex:'1000'}}/>