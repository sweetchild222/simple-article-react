export function VPad(props){

    const size = props.size == null ? 8 : props.size
    
    return (
        <div style={{height: size + 'px', minHeight: size + 'px', maxHeight: size + 'px', ...props.style}}/>
    )        
}

export function HPad(props){

    const size = props.size == null ? 8 : props.size    

    return (
        <div style={{width: size + 'px', minWidth: size + 'px', maxWidht: size + 'px', ...props.style}}/>
    )
}