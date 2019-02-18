let database = require('../database/database')
const members = database.getStudentByLessonId(lsnId)
let chatHistory = []

module.exports.broadcastMessage= (message) =>{
    members.forEach(m => m.emit('message', message))
}

module.exports.addEntry=(entry)=> {
    chatHistory = chatHistory.concat(entry)
}

module.exports.getChatHistory=() =>{
    return chatHistory.slice()
}

module.exports.addUser=(client)=> {
    members.set(client.id, client)
}

module.exports.removeUser=(client) =>{
    members.delete(client.id)
}

module.exports.serialize=()=> {
    return {
        name,
        image,
        numMembers: members.size
    }
}