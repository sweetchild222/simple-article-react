export function Vertical(props){

    const combinedStyle = {
        ...props.style
    }

    return (
        <div id={props.id} onClick={props.onClick} style={{display: 'flex', flexDirection: 'column', justifyContent:'start', ...combinedStyle}}>
            {props.children}
        </div>
    )        
}



export function Horizental(props){

    const combinedStyle = {    
        ...props.style
    }

    return (
        <div id={props.id} onClick={props.onClick} style={{display: 'flex', flexDirection: 'row',  justifyContent:'start', ...combinedStyle}}>
            {props.children}
        </div>
    )
}