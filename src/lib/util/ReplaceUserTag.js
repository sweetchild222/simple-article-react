import * as UserRepository from "./UserRepository.js";

const replaceAsync = async(str, regex, asyncFn) => {

  const promises = []

  str.replace(regex, (match, ...args) => {
      promises.push(asyncFn(match, ...args))
      return match
  })

  const data = await Promise.all(promises)
  
  return str.replace(regex, () => data.shift())
}


const toUserLinkCore = async(matched)=> {
        
  const match = matched.match(/\<user\>(.*?)\<\/user\>/)

  if(!match)
      return matched
  
  if(match.length > 0){

      const id = match[1]

      const user = await UserRepository.getByID(id)

      const host = 'http://' + window.location.host

      if(user == null)
          return '@알수없음 '
                  
      const link = '<a href=\"' + host + '/user/' + id + '\">'+ '@' + user.nickname + ' ' +'</a>'
  
      return link
  }

  return matched
}

    
const toUserNicknameCore = async(matched)=>{

  const match = matched.match(/\<user\>(.*?)\<\/user\>/)

  if(!match)
      return

  if(match.length > 0){

      const id = match[1]

      const user = await UserRepository.getByID(id)

      if(user == null)
          return '@알수없음 '
      
      return '@' + user.nickname + ' '
  }

  return matched
}

    

const toUserNicknameHtmlCore = async(matched)=>{

  const match = matched.match(/\<user\>(.*?)\<\/user\>/)

  if(!match)
      return

  if(match.length > 0){

      const id = match[1]

      const user = await UserRepository.getByID(id)

      if(user == null)
          return '@알수없음 '
      
      return '<span style="color:green;">@' + user.nickname + '</span>&nbsp'
  }

  return matched
}


export const toUserLink = async(content) => {
          
  const regex = /\<user\>(.*?)\<\/user\>/g

  const replaceString = await replaceAsync(content, regex, toUserLinkCore)
          
  return replaceString
}


export const toUserNickname = async(content) => {
          
  const regex = /\<user\>(.*?)\<\/user\>/g

  const replaceString = await replaceAsync(content, regex, toUserNicknameCore)

  return replaceString
}


export const toUserNicknameHtml = async(content) => {
          
  const regex = /\<user\>(.*?)\<\/user\>/g

  const replaceString = await replaceAsync(content, regex, toUserNicknameHtmlCore)  
  
  return (replaceString)
}

    