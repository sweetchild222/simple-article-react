import {useEffect, useState} from 'react'
import AuthContext from './AuthContext'


const pickFile = async() => {

    try{
        
        const options = {
            types: [{
                description: 'Images',
                accept: {'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'], 'image/gif': ['.gif'], 'image/webp': ['.webp']}}
            ],
            excludeAcceptAllOption: false,
            multiple: false
        }

        const [fileHandle] = await window.showOpenFilePicker(options)
        return await fileHandle.getFile()
    }
    catch(error) {
        
        return null
    }
}


export const pickImageFile = async() => {

    const file = await pickFile()

    if(file == null)
        return null

    try{
        
        const format = await getImageFormat(file)
        
        return {file:file, format:format}
    }
    catch(error) {

        return null
    }

}


export const getImageFormat = (file) => {

    return new Promise((resolve, reject) => {

        const reader = new FileReader()

        reader.onload = (event) => {

            const bytes = new Uint8Array(event.target.result)

            if(bytes.length < 12){
                resolve('unknown')
                return
            }
            
            if (bytes[0] === 0xFF && bytes[1] === 0xD8)
                resolve('image/jpeg')
            else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47)
                resolve('image/png')
            else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
                resolve('image/gif')
            else if(bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
                resolve('image/webp')
            else{
                resolve('unknown')
            }
        }

        reader.onerror = (event) => {
            
            reject('error')
        }

        reader.readAsArrayBuffer(file.slice(0, 12))
    })
}

