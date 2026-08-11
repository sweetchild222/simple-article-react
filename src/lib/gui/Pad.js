export function VPad({size=8}){
    
    return (

        <div style={{height: size + 'px', minHeight: size + 'px', maxHeight: size + 'px'}}/>
    )        
}

export function HPad({size=8}){

    return (
        <div style={{width: size + 'px', minWidth: size + 'px', maxWidht: size + 'px'}}/>
    )
}