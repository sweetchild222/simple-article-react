import './BeautyButton.css';

export default function(props) {    

    const combinedStyle = {
    
    ...props.style // The passed style object
    }

    const isDisable = (props) => {
        
        if(props.isLoading == true || props.disabled == true)
            return true
        else
            return false
    }

    return (
        <button ref={props.ref} id={props.id} title={props.tooltip} className={`beauty-button ${props.type ? props.type : 'default'} ${props.isLoading ? 'circle': ''}`} disabled={isDisable(props)} style={{...combinedStyle}} onClick={props.onClick}>
            {props.children}
        </button>
    );
}
