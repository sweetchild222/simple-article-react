import './PrettyButton.css';

export default function(props) {    


    const isDisable = (props) => {
        
        if(props.isLoading == true || props.disabled == true)
            return true
        else
            return false
    }

    return (
        <button ref={props.ref} id={props.id} title={props.tooltip} className={`beauty-button ${props.type ? props.type : 'default'} ${props.isLoading ? 'circle': ''}`} disabled={isDisable(props)} style={{...props.style}} onClick={props.onClick}>
            {props.children}
        </button>
    );
}
