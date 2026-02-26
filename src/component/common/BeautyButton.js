import './BeautyButton.css';

export default function(props) {

    console.log('asdf')

    const isDisable = (props) => {
        
        if(props.isLoading == true || props.disabled == true)
            return true
        else
            return false
    }

    return (
        <button id={props.id} className={`beauty-button ${props.type ? props.type : 'default'} ${props.isLoading ? 'circle': ''}`} disabled={isDisable(props)} onClick={props.onClick}>
            <span>{props.children}</span>
        </button>
    );
}

