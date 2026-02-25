import './BeautyButton.css';

export default function(props) {

    return (
        <button id='beauty-button' className={`${props.type} ${props.isLoading ? 'circle': ''}`} disabled={props.isLoading || props.disabled} onClick={props.onClick}>
            <span>{props.children}</span>            
        </button>
    );
}

