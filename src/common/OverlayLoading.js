import './OverlayLoading.css'

export default function() {
          
    return (
          <div className={`overlayLoading`} style={{position: 'fixed', top:'0', left:0, width:'100vw', height:'100vh', zIndex:'1000'}}/>
        )
}