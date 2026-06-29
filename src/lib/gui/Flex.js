export function Vertical(props){
    
    return (
        <div ref={props.ref} id={props.id} onClick={props.onClick} style={{display: 'flex', flexDirection: 'column', justifyContent:'start', boxSizing: 'border-box', ...props.style}}>
            {props.children}
        </div>
    )        
}



export function Horizental(props){

    return (
        <div ref={props.ref} id={props.id} onClick={props.onClick} style={{display: 'flex', flexDirection: 'row',  justifyContent:'start', boxSizing: 'border-box', ...props.style}}>
            {props.children}
        </div>
    )
}