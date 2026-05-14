const calcDayBefore = (date)=> {

    for(var i = 0; i < 3; i++){

        const current = new Date()

        const beforeDay = new Date((current.getTime() - i * (24 * 60 * 60 * 1000)))

        if(beforeDay.getFullYear() == date.getFullYear() && beforeDay.getMonth() == date.getMonth() && beforeDay.getDate() == date.getDate())
            return i
    }
    return -1        
}



export default function(timestamp){
    
    const date = new Date(timestamp)

    const dayBefore = calcDayBefore(date)

    if(dayBefore == 0)
        return '오늘'        
    else if(dayBefore == 1)
        return '어제'
    else if(dayBefore == 2)
        return '그제'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const formattedDate = `${year}.${month}.${day}`;

    return formattedDate
}