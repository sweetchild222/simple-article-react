
export default function(){

  const ua = navigator.userAgent;
  
  if(/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
    return "pad"
  
  if(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    return "pad"
  
  if(/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua))
    return "mobile"
  
  return "desktop"
}
