


const calcScaled = (imageWidth, imageHeight, maxWidth, maxHeight, minWidth, minHeight) => {

    const ratioMaxWidth = maxWidth / imageWidth;
    const ratioMaxHeight = maxHeight / imageHeight;

    const ratioMax = ratioMaxWidth < ratioMaxHeight ? ratioMaxWidth : ratioMaxHeight

    const newWidth = Math.round(imageWidth * ratioMax);
    const newHeight = Math.round(imageHeight * ratioMax);
    
    if(newWidth < minWidth){

      const ratioMin = minWidth / imageWidth;
      const scaledWidth = Math.round(imageWidth * ratioMin);

      const sHeight = Math.round(maxHeight * (1 / ratioMin))
      const sy = Math.round((imageHeight - sHeight) / 2)

      return {sx:0, sy:sy, sWidth:imageWidth, sHeight:sHeight, dx:0, dy:0, dWidth:scaledWidth, dHeight:maxHeight}
    }
    else if(newHeight < minHeight){

      const ratioMin = minHeight / imageHeight;
      const scaledHeight = Math.round(imageHeight * ratioMin);

      const sWidth = Math.round(maxWidth * (1 / ratioMin))
      const sx = Math.round((imageWidth - sWidth) / 2)

      return {sx:sx, sy:0, sWidth:sWidth, sHeight:imageHeight, dx:0, dy:0, dWidth:maxWidth, dHeight:scaledHeight}    
    }
    else{
      return {sx:0, sy:0, sWidth:imageWidth, sHeight:imageHeight, dx:0, dy:0, dWidth:newWidth, dHeight:newHeight}
    }
}



export default function(file, maxWidth, maxHeight, minWidth, minHeight){

    return new Promise((resolve) => {

      const img = new Image();
      //img.src = path;

      const url = URL.createObjectURL(file)
      img.src = url

      img.onload = () => {

          const scaled = calcScaled(img.width, img.height, maxWidth, maxHeight, minWidth, minHeight)
              
          const canvas = document.createElement('canvas');
          canvas.width = scaled.dWidth;
          canvas.height = scaled.dHeight;
          const ctx = canvas.getContext('2d');

          ctx.drawImage(img, scaled.sx, scaled.sy, scaled.sWidth, scaled.sHeight, scaled.dx, scaled.dy, scaled.dWidth, scaled.dHeight);
          resolve(canvas)
      }

      img.onerror = () =>{

          resolve(null)
      }
    })
}


