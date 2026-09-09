import I18n from './I18n.js'

const calcDayBefore = (dateA, dateB)=> {

    for(var i = 0; i < 3; i++){

        const beforeDay = new Date((dateB.getTime() - i * (24 * 60 * 60 * 1000)))

        if(beforeDay.getFullYear() == dateA.getFullYear() && beforeDay.getMonth() == dateA.getMonth() && beforeDay.getDate() == dateA.getDate())
            return i
    }

    return -1
}


export default function(timestamp){
        
    const secGap = (Date.now() - timestamp) / 1000    
        
    if(secGap < 60 * 10)
        return I18n.t('system.justNow')
    

    if(secGap < 3600){
        const minGap = Math.round(secGap / 60)
        return I18n.t('system.minuteAgo', {minute:minGap})
    }


    if(secGap >= 3600 && secGap < (3600 * 6)){
        const hourGap = Math.round(secGap / 3600)
        return I18n.t('system.hourAgo', {hour:hourGap})
    }

    const date = new Date(timestamp)
    const current = new Date()

    const dayBefore = calcDayBefore(date, current)

    if(dayBefore == 0)
        return I18n.t('system.today')
    else if(dayBefore == 1)
        return I18n.t('system.yesterday')
        
    const year = date.getFullYear() == current.getFullYear() ? '': date.getFullYear() + '.'
    const month = String(date.getMonth() + 1).padStart(2, '0') + '.'
    const day = String(date.getDate()).padStart(2, '0')


    const formattedDate = `${year}${month}${day}`;

    return formattedDate
}
