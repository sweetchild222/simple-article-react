
export default function(id) {
    
    if (typeof id == "string"){
        if(isNaN(id))
            return null
    }
    
    const int_id = parseInt(id)

    if(int_id == null)
        return null

    if(!Number.isInteger(int_id))
        return null

    return int_id
}
        