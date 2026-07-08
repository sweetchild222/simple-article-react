import * as UserAPI from '@rest/UserAPI.js'

const repository = []

export const getByIDList = async(userIDList) => {

    const filterIDList = userIDList.filter(id => (repository.find(item => item.id == id) == null))
    
    if(filterIDList.length > 0) {
        
        const limit = 100
        let startIndex = 0

        while(filterIDList.length > startIndex){

            const list = filterIDList.slice(startIndex, startIndex + limit)

            const newUserList = await UserAPI.getUsers('id=' + list)

            if(newUserList.success == true)
                newUserList.payload.forEach(item=>repository.push(item))
            
            startIndex += limit
        }
    }

    return repository.filter(item => userIDList.find(id => item.id == id))
}


export const getByID = async(userId) => {

    const findUser = repository.find(item => item.id == userId)
    
    if(findUser == null) {
        
        const newUserList = await UserAPI.getUsers('id=' + [userId])

        if(newUserList.success == true)
            newUserList.payload.forEach(item=>repository.push(item))
    }

    return repository.find(item => item.id == userId)
}
