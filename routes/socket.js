var io = require('socket.io')();
let database = require('../database/database')
let moment = require('moment-jalaali')
let logger = require('../util/logger')
var fs = require('fs')
var Readable = require('stream').Readable
let config = require('../util/config')
let lesson = require('../routes/lesson')
let socketIds = {};

io.sockets.on('connection', function (socket) {
    console.log("socket Connected")

    database.getAllChatrooms((chatrooms)=> {
        let rooms = []

        if (chatrooms[0] != undefined) {
            for (var i = 0; i < chatrooms.length; i++) {
                rooms.push(chatrooms[i].title)
            }
        }
        socket.on('getChatInfo', function (user) {
            var usernames = [];

            if (typeof user == "string") {
                user = JSON.parse(user)
            }
            socketIds[user._id] = socket.id;

            database.getChatroomById(user.chatroom._id, (chatRoom)=> {
                if (chatRoom == -1) {
                    if (user.chatAdmin) {
                        database.getChatAdminById(user._id, (chatAdmin)=> {
                            database.studentByChId(user.chatroom._id, (result)=> {
                                for (var k = 0; k < result.length; k++) {
                                    if (result[k] != undefined) {
                                        usernames.push(result[k].username)
                                    }
                                }
                                console.log("usernames", usernames)

                                socket.username = chatAdmin.username
                                socket.userData = chatAdmin
                                usernames.push(chatAdmin.username)
                                socket.room = user.chatroom.title;
                                socket.join(user.chatroom.title);
                                let data = {}
                                database.getMsgByChatRoom(user.chatroom._id, (msg)=> {
                                    if (msg == 0 || msg == -1) {
                                        data.allChat = []
                                    }
                                    else {
                                        data.pin = msg[0].pin
                                        data.mark = msg[0].mark
                                        delete msg[0].pin
                                        delete msg[0].mark
                                        data.allChat = msg
                                    }
                                    data.title = socket.room
                                    data.userCount = usernames.length
                                    // socket.emit('updateChat', 'SERVER', `you have connected to ${socket.room}`);
                                    // echo to room 1 that a person has connected to their room
                                    socket.emit('updateInfo', data)
                                })

                            })
                        })
                    }
                    else {
                        database.studentByChId(user.chatroom._id, (result)=> {
                            for (var k = 0; k < result.length; k++) {
                                if (result[k] != undefined) {
                                    if (result[k]._id == user._id) {
                                        socket.username = result[k].username
                                        socket.userData = result[k]
                                        // delete socket.userData.password

                                    }
                                    usernames.push(result[k].username)
                                }
                            }
                            socket.room = user.chatroom.title;
                            socket.roomId = user.chatroom._id
                            socket.join(user.chatroom.title);
                            let data = {}
                            database.getMsgByChatRoom(user.chatroom._id, (msg)=> {
                                if (msg == 0 || msg == -1) {
                                    data.allChat = []
                                }
                                else {
                                    data.pin = msg[0].pin
                                    data.mark = msg[0].mark
                                    delete msg[0].pin
                                    delete msg[0].mark
                                    data.allChat = msg
                                }
                                data.title = socket.room
                                data.userCount = usernames.length
                                // socket.emit('updateChat', 'SERVER', `you have connected to ${socket.room}`);
                                // echo to room 1 that a person has connected to their room
                                socket.emit('updateInfo', data)
                                // socket.emit('updateRooms', rooms, socket.room);
                            })


                        })
                    }
                }
                else if (chatRoom == 0) {
                    let data = {"errMsg": "there is no such a chatRoom"}
                    socket.emit('updateInfo', data)
                }
                else {
                    if (typeof chatRoom.startTime == "string") {
                        chatRoom.startTime = parseInt(chatRoom.startTime)
                    }
                    if (typeof chatRoom.endTime == "string") {
                        chatRoom.endTime = parseInt(chatRoom.endTime)
                    }

                    if (1) {
                        if (user.chatAdmin == true) {

                            console.log("here")
                            database.getChatAdminById(user._id, (chatAdmin)=> {
                                database.studentByChId(user.chatroom._id, (result)=> {
                                    for (var k = 0; k < result.length; k++) {
                                        if (result[k] != undefined) {
                                            usernames.push(result[k].username)

                                        }
                                    }
                                    socket.username = chatAdmin.username
                                    chatAdmin.role = "admin"
                                    socket.userData = chatAdmin
                                    usernames.push(chatAdmin.username)
                                    socket.room = user.chatroom.title;
                                    socket.roomId = user.chatroom._id
                                    socket.join(user.chatroom.title);

                                    // socketIds.push(socket.id)
                                    let data = {}
                                    database.getMsgByChatRoom(user.chatroom._id, (msg)=> {
                                        if (msg == 0 || msg == -1) {
                                            data.allChat = []
                                        }
                                        else {
                                            data.pin = msg[0].pin
                                            data.mark = msg[0].mark
                                            delete msg[0].pin
                                            delete msg[0].mark
                                            data.allChat = msg
                                        }
                                        data.title = socket.room
                                        data.userCount = usernames.length
                                        // socket.emit('updateChat', 'SERVER', `you have connected to ${socket.room}`);
                                        // echo to room 1 that a person has connected to their room
                                        logger.info("socketIds", socketIds)

                                        socket.emit('updateInfo', data)
                                    })

                                })
                            })
                        }
                        else {
                            let data = {}

                            data.blocked = 0
                            database.getStudentById(user._id, (currentUser)=> {
                                if (currentUser.chatrooms != undefined) {
                                    for (var i = 0; i < currentUser.chatrooms.length; i++) {
                                        if (currentUser.chatrooms[i] && currentUser.chatrooms[i]._id == user.chatroom._id) {
                                            data.blocked = currentUser.chatrooms[i].blocked
                                        }
                                    }
                                }
                                database.studentByChId(user.chatroom._id, (result)=> {
                                    for (var k = 0; k < result.length; k++) {
                                        if (result[k] != undefined) {
                                            if (result[k]._id == user._id) {
                                                socket.username = result[k].username
                                                result[k].role = "student"
                                                socket.userData = result[k]
                                                // delete socket.userData.password

                                            }
                                            usernames.push(result[k].username)
                                        }
                                    }
                                    socket.room = user.chatroom.title;
                                    socket.roomId = user.chatroom._id
                                    socket.join(user.chatroom.title);
                                    socketIds[user._id] = socket.id
                                    database.getMsgByChatRoom(user.chatroom._id, (msg)=> {
                                        if (msg == 0 || msg == -1) {
                                            data.allChat = []
                                        }
                                        else {
                                            data.pin = msg[0].pin
                                            data.mark = msg[0].mark
                                            delete msg[0].pin
                                            delete msg[0].mark
                                            data.allChat = msg
                                        }
                                        data.title = socket.room
                                        data.userCount = usernames.length
                                        // socket.emit('updateChat', 'SERVER', `you have connected to ${socket.room}`);
                                        // echo to room 1 that a person has connected to their room
                                        // io.to(socket).emit('updateInfo', data);
                                        logger.info("warn io", socketIds)

                                        socket.emit('updateInfo', data)
                                        // socket.emit('updateRooms', rooms, socket.room);
                                    })
                                })

                            })
                        }
                    }
                    else {
                        console.log("studentByChId", chatRoom.startTime <= moment().format('HH') && moment().format('HH') <= chatRoom.endTime)
                        socket.room = user.chatroom.title
                        socket.join(user.chatroom.title);
                        let data = {"time": "time is over"}
                        socket.emit('updateInfo', data)
                    }
                }
            })

        });

        socket.on('sendVoice', function (base64) {
            const imgBuffer = Buffer.from(base64, 'base64')
            var s = new Readable()
            s.push(imgBuffer)
            s.push(null)
            let time = new Date().getTime()
            let filePath = `${config.uploadPathVoiceMsg}/`
            lesson.addDir(filePath, function (newPath) {
                filePath = `${config.uploadPathVoiceMsg}/${time}.mp3`
                s.pipe(fs.createWriteStream(filePath));
                // we tell the client to execute 'updatechat' with 2 parameters
                let info = {}
                logger.error("socket.userData", socket.userData)
                info.user = {}
                if (socket.userData.fname != undefined) {
                    info.user.fname = socket.userData.fname
                    info.user.lname = socket.userData.lname
                }
                else {
                    info.user.name = socket.userData.name
                }

                info.user.avatarUrl = socket.userData.avatarUrl
                info.user = socket.userData
                info.time = new Date().getTime()
                info.msg = ""
                info.voice = `${config.downloadPathVoiceMsg}/${new Date().getTime()}.mp3`
                let msgInfo = {}
                msgInfo.msg = "";
                msgInfo.usrId = info.user._id
                msgInfo.chId = socket.roomId
                msgInfo.user = socket.userData
                msgInfo.time = new Date().getTime()
                msgInfo.voice = `${config.downloadPathVoiceMsg}/${time}.mp3`
                database.addMsg(msgInfo, (newMsg)=> {
                    io.to(socket.room).emit('updateChat', newMsg);
                })
            })


        });

        socket.on('sendChat', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            logger.error("socket.userData", socket.userData)
            info.user = {}
            if (socket.userData.fname != undefined) {
                info.user.fname = socket.userData.fname
                info.user.lname = socket.userData.lname
            }
            else {
                info.user.name = socket.userData.name
            }

            info.user.avatarUrl = socket.userData.avatarUrl
            info.user = socket.userData
            info.time = new Date().getTime()
            info.msg = data.msg
            let msgInfo = {}
            msgInfo.msg = info.msg;
            msgInfo.usrId = info.user._id
            msgInfo.chId = socket.roomId
            msgInfo.user = socket.userData
            msgInfo.time = new Date().getTime()
            msgInfo.voice = "";
            msgInfo.type = "text"
            database.addMsg(msgInfo, (newMsg)=> {
                io.to(socket.room).emit('updateChat', newMsg);
            })
        });

        socket.on('delete', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            logger.info("data", data)
            let info = {}
            info.status = "done"
            info._id = data.msg._id
            if (data.msg.pinned == true) {
                let pin = {}
                pin._id = ""
                io.to(socket.room).emit('pinMsg', pin);
            }
            database.delMsg(data.msg._id)
            io.to(socket.room).emit('delMsg', info);
        });

        socket.on('pin', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            data = data.msg
            logger.info("datain pin", data)
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            data.pinned = true
            info._id = data._id
            info.msg = data.msg
            database.editMsg(data._id, data)
            io.to(socket.room).emit('pinMsg', info);
        });

        socket.on('block', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            if (typeof data.blocked == "string") {
                data.blocked = parseInt(data.blocked)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            info._id = data._id
            database.updateStudent(data, data._id, (blocked)=> {
                info.blocked = blocked
                info.msg = data.msg
                logger.info("socketIds[data._id]", socketIds)
                // io.to(socketIds[data._id]).emit('warnMsg', info)
                io.sockets.connected[socketIds[data._id]].emit('blockMsg', info)
            })


        });

        socket.on('report', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            info._id = data._id
            database.editMsg(data.msgId, data, (reported)=> {
                info.msg = reported
                logger.info("socketIds[data._id]", socketIds)
                if (reported.chatAdmins != 0 && reported.chatAdmins != -1) {
                    for (var i = 0; i < reported.chatAdmins.length; i++) {
                        io.sockets.connected[socketIds[reported.chatAdmins[i]._id]].emit('reportMsg', info)
                    }
                }

                // io.to(socketIds[data._id]).emit('warnMsg', info)

            })


        });

        socket.on('warn', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            info._id = data._id
            data.warned = true
            database.updateStudent(data, data._id, (warned)=> {
                info.count = warned
                info.msg = data.msg
                logger.info("socketIds[data._id]", socketIds)
                // io.to(socketIds[data._id]).emit('warnMsg', info)
                io.sockets.connected[socketIds[data.caId]].emit('warnMsg', info)
                io.sockets.connected[socketIds[data._id]].emit('warnMsg', info)
            })

        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function (reason) {
            // remove the username from global usernames list
            // delete usernames[socket.username];
            // // update list of users in chat, client-side
            // io.sockets.emit('updateusers', usernames);
            // // echo globally that this client has left
            // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            // socket.leave(socket.room);
            logger.error("disconnected socket", reason)
        });
    });
})


module.exports = io;