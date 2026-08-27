export default function(targetY, duration=300) {

  const startY = window.scrollY
  const difference = targetY - startY
  let startTime = null

  const step = (timestamp) => {

    if(!startTime)
      startTime = timestamp

    const progress = timestamp - startTime
  
    const percent = Math.min(progress / duration, 1)
      
    const ease = percent < 0.5 ? 4 * percent * percent * percent : 1 - Math.pow(-2 * percent + 2, 3) / 2

    window.scrollTo(0, startY + difference * ease)

    if(progress < duration)
      window.requestAnimationFrame(step)
  }
  
  window.requestAnimationFrame(step)

}


