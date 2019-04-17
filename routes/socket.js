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
    console.log("connected")

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

                    if (chatRoom.startTime <= moment().format('HH') && moment().format('HH') <= chatRoom.endTime) {
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
                                database.getChatAdminByChatRoom(user.chatroom._id, (chatAdmins)=> {
                                    logger.info("chatAdmins", chatAdmins)
                                    if (chatAdmins != 0 && chatAdmins != -1) {
                                        for (var k = 0; k < chatAdmins.length; k++) {
                                            if (chatAdmins[k] != undefined) {
                                                usernames.push(chatAdmins[k].username)
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
            data = data.msg
            if (typeof data.blocked == "string") {
                data.blocked = parseInt(data.blocked)
            }

            logger.info("data", data)
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}

            info.status = "done"
            info._id = data.user._id
            if (data.blocked == 0) {
                data.blockedTime = ""
            }
            else {
                data.blockedTime = new Date().getTime()
            }
            database.updateStudent(data, data.user._id, (blocked)=> {
                info.blocked = blocked
                info.msg = data.msg
                logger.info("socketIds[data._id]", socketIds)
                // io.to(socketIds[data._id]).emit('warnMsg', info)
                if (socketIds[data.caId] != undefined) {
                    io.sockets.connected[socketIds[data.caId]].emit('blockMsg', info)
                }
                if (socketIds[data.user._id] != undefined) {
                    io.sockets.connected[socketIds[data.user._id]].emit('blockMsg', info)
                }
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
                        if (socketIds[reported.chatAdmins[i]._id] != undefined) {
                            io.sockets.connected[socketIds[reported.chatAdmins[i]._id]].emit('reportMsg', info)

                        }
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
            data = data.msg
            data.warned = true
            database.updateStudent(data, data.user._id, (warned)=> {
                info.count = warned
                info.msg = data.warnMsg
                logger.info("socketIds[data._id]", socketIds)
                logger.info("_id]", data)

                // io.to(socketIds[data._id]).emit('warnMsg', info)
                if (socketIds[data.caId] != undefined) {
                    io.sockets.connected[socketIds[data.caId]].emit('warnMsg', info)
                }
                if (socketIds[data.user._id] != undefined) {
                    io.sockets.connected[socketIds[data.user._id]].emit('warnMsg', info)

                }
            })

        });

        //tutor
        socket.on('tutor', function (dat) {
            if (typeof dat == "string") {
                dat = JSON.parse(dat)
            }
            let data = dat.data
            let info = {}
            console.log("data of tutor", data)
            socketIds[data._id] = socket.id;
            console.log("data of tutor", socketIds)

            info.msg = "you are connected now"
            io.sockets.connected[socketIds[data._id]].emit('connected', info)
            // socket.emit('connected', info)
        });

        socket.on('chatRequest', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            let info = {}
            console.log("data" , data)
            socketIds[data._id] = socket.id;
            socket.room = data._id
            socket.join(data._id);
            database.getlevelOfStudent(data._id , (level)=>{
                if(level == 0 || level == -1){
                    info.msg = "there is no tutor right now"
                    socket.emit('noTutor', info)
                }
                else{
                    database.getTutorByLevel(level._id, (tutors)=> {
                        if (tutors == -1 || tutors == 0) {
                            info.msg = "there is no tutor right now"
                            socket.emit('noTutor', info)
                        }
                        else {
                            for (var i = 0; i < tutors.length; i++) {
                                if (socketIds[tutors[i]._id] != undefined) {
                                    let info = {}
                                    info.fname = data.fname
                                    info.lname = data.lname
                                    info._id = data._id
                                    info.avatarUrl = data.avatarUrl
                                    info.score = data.score
                                    info.time = new Date().getTime()
                                    io.sockets.connected[socketIds[tutors[i]._id]].emit('requested', info)
                                }
                            }
                        }
                    })
                }
            })

            // io.to(socketIds[data._id]).emit('warnMsg', info)
        });

        socket.on('acceptChat', function (dat) {
            if (typeof dat == "string") {
                dat= JSON.parse(dat)
            }
            let data = dat.data
            console.log("dataacceptChat" , data)
            database.popUserFromOtherTutors(data.user, (popoed)=> {
                database.addUserForTutor(data.user, data.tutor._id, (addedUser)=> {
                    database.getVIPUserMessages(data.user._id, (allMesssages)=> {
                        if (allMesssages == -1 || allMesssages == 0) {
                            data.allMessages = []
                        }
                        else {
                            data.allMessages = allMesssages
                        }
                        socket.room = data.user._id
                        socket.join(data.user._id);
                        console.log("socket in acceptChat" , socket)
                        io.sockets.connected[socketIds[data.tutor._id]].emit('accepted', data)

                        if (socketIds[data.user._id] != undefined) {

                            io.sockets.connected[socketIds[data.user._id]].emit('chatAccepted', data)
                        }
                    })

                })
            })
        });

        socket.on('pvChat', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }

            let info = {}
            info.usrId = data.user._id;
            info.tutorId = data.tutor._id;
            info.time = new Date().getTime()
            info.msg = data.msg
            info.voice = ""
            info.img = ""
            // socketIds[data._id] = socket.id;

            if(socket.id ==socketIds[data.user._id] ){
                info.sender = "student"
            }
            else{
                info.sender = "tutor"
            }
            // socket.room = data.user._id
            database.addTutorMsg(info, (message)=> {
                // logger.info("message" , message)
                message.student = data.user
                message.tutor = data.tutor
                // message.msg = data.msg
                io.to(socket.room).emit('updatePVchat', message);
                // if (socketIds[data.user._id])
                //     io.sockets.connected[socketIds[data.user._id]].emit('updatePVchat', message)
                // if (socketIds[data.tutor._id])
                //     io.sockets.connected[socketIds[data.tutor._id]].emit('updatePVchat', message)
            })
        });

        socket.on('pvVoice', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }

            let base64 = data.base64
            const imgBuffer = Buffer.from(base64, 'base64')
            var s = new Readable()
            s.push(imgBuffer)
            s.push(null)
            let time = new Date().getTime()
            let filePath = `${config.uploadPathVIPVoiceMsg}/`
            lesson.addDir(filePath, function (newPath) {
                filePath = `${config.uploadPathVIPVoiceMsg}/${time}.mp3`
                s.pipe(fs.createWriteStream(filePath));
                // we tell the client to execute 'updatechat' with 2 parameters
                let msgInfo = {}
                msgInfo.msg = "";
                msgInfo.img = "";
                msgInfo.usrId = data.user._id
                msgInfo.tutorId = data.tutor._id
                msgInfo.time = new Date().getTime()
                msgInfo.voice = `${config.downloadPathVIPVoiceMsg}/${time}.mp3`
                database.addTutorMsg(msgInfo, (newMsg)=> {
                    io.to(socket.room).emit('updatePVchat', newMsg);

                    // if (socketIds[data.user._id])
                    //     io.sockets.connected[socketIds[data.user._id]].emit('updatePVchat', newMsg)
                    // if (socketIds[data.tutor._id])
                    //
                    //     io.sockets.connected[socketIds[data.tutor._id]].emit('updatePVchat', newMsg)
                })
            })


        });

        socket.on('pvImg', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }

            let base64 = data.base64
            const imgBuffer = Buffer.from(base64, 'base64')
            var s = new Readable()
            s.push(imgBuffer)
            s.push(null)
            let time = new Date().getTime()
            let filePath = `${config.uploadPathVIPImgMsg}/`
            lesson.addDir(filePath, function (newPath) {
                filePath = `${config.uploadPathVIPImgMsg}/${time}.png`
                s.pipe(fs.createWriteStream(filePath));
                // we tell the client to execute 'updatechat' with 2 parameters
                let msgInfo = {}
                msgInfo.msg = "";
                msgInfo.img = "";
                msgInfo.usrId = data.user._id
                msgInfo.tutorId = data.tutor._id
                msgInfo.time = new Date().getTime()
                msgInfo.voice = `${config.downloadPathVIPImgMsg}/${time}.png`
                database.addTutorMsg(msgInfo, (newMsg)=> {
                    io.to(socket.room).emit('updatePVchat', newMsg);

                    // if (socketIds[data.user._id])
                    //     io.sockets.connected[socketIds[data.user._id]].emit('updatePVchat', newMsg)
                    // if (socketIds[data.tutor._id])
                    //
                    //     io.sockets.connected[socketIds[data.tutor._id]].emit('updatePVchat', newMsg)
                })
            })


        });

        socket.on('endChat', function (data) {
            if (typeof data == "string") {
                data= JSON.parse(data)
            }
            database.popUserFromOtherTutors(data.user, (popoed)=> {
                data.user.endChat = true
                database.addUserForTutor(data.user, data.tutor._id, (addedUser)=> {
                    io.to(socket.room).emit('endedChat', data.user);
                    socket.leave(data.user._id)
                    // socket.emit("endedChat" , data.user)
                })
            })
        });



        // when the user disconnects.. perform this
        socket.on('disconnect', function (reason) {
            console.log("disconnect" , socketIds[socket.id])
            let usrId = socketIds[socket.id]
            // delete socketIds[socket.id]
            // console.log("disconnect" , socketIds)
            // socket.emit("disconnectedUser" ,usrId )

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