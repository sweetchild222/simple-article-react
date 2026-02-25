
export function password(password) {

    if(password == null)
      return false

    if(password == '')
      return false

    const pattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[!@#$%^&*()-+=]).{8,20}$/

    return pattern.test(password)
}


export function email(email) {
    
    if(email == null)
        return false
    
    if(email == '')        
        return false        

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email)
}


export function verifyCode(code) {

    if(code == null)
      return false

    if(code == '')
      return false

    const pattern = /^\d{6}$/;

    return pattern.test(code)
}
