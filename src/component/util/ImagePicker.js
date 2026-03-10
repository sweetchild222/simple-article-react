import {useEffect, useState} from 'react'
import AuthContext from './AuthContext'


export const pickImage = async() => {

    try{
        
        const options = {
            types: [{
                description: 'Images',
                accept: {'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'], 'image/gif': ['.gif']}}
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


export const getImageFormat = (file) => {

    return new Promise((resolve, reject) => {

        const reader = new FileReader()

        reader.onload = (event) => {

            const bytes = new Uint8Array(event.target.result)
            
            if (bytes[0] === 0xFF && bytes[1] === 0xD8)
                resolve('image/jpeg')
            else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47)
                resolve('image/png')
            else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
                resolve('image/gif')
            else
                resolve('unknown')
        }

        reader.onerror = (event) => {
            reject('error')
        }

        reader.readAsArrayBuffer(file.slice(0, 4))
    })
}

