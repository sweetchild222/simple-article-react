export default function(count){
    
    if(count > 1000){
        if(count > 1000000)
            return (count / 1000000).toFixed(1) + 'M'

        return (count / 1000).toFixed(1) + 'K'
    }

    return count
}