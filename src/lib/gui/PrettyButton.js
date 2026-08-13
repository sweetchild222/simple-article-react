import './PrettyButton.css';

export default function(props) {


    const isDisable = (props) => {
        
        if(props.isLoading == true || props.disabled == true)
            return true
        else
            return false
    }


    const isDeviceTouch = () => {
        
        const ua = navigator.userAgent;
        
        if(/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
            return true
        
        if(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
            return true

        if(/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua))
            return true

        return false
    }

    const type = (props.type == 'transparent') && (isDeviceTouch() == true) ? 'transparent-touch' : props.type

    return (
        <button ref={props.ref} id={props.id} title={props.tooltip} className={`beauty-button ${type ? type : 'default'} ${props.isLoading ? 'spin': ''}`} disabled={isDisable(props)} style={{whiteSpace:'nowrap', ...props.style}} onClick={props.onClick}>
            {props.children}
        </button>
    );
}
