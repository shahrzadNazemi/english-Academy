var io = require('socket.io')();
let database = require('../database/database')
let moment = require('moment-jalaali')

io.sockets.on('connection', function (socket) {
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
                                    io.to(user.chatroom.title).emit('updateInfo', data);
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
                                io.to(user.chatroom.title).emit('updateInfo', data);
                                // socket.emit('updateRooms', rooms, socket.room);
                            })


                        })
                    }
                }
                else if (chatRoom == 0) {
                    let data = {"errMsg": "there is no such a chatRoom"}
                    io.to(user.chatroom.title).emit('updateInfo', data);
                }
                else {
                    if (typeof chatRoom.startTime == "string") {
                        chatRoom.startTime = parseInt(chatRoom.startTime)
                    }
                    if (typeof chatRoom.endTime == "string") {
                        chatRoom.endTime = parseInt(chatRoom.endTime)
                    }

                    if (1) {
                        if (user.chatAdmin) {
                            database.getChatAdminById(user._id, (chatAdmin)=> {
                                database.studentByChId(user.chatroom._id, (result)=> {
                                    for (var k = 0; k < result.length; k++) {
                                        if (result[k] != undefined) {
                                            usernames.push(result[k].username)
                                        }
                                    }
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
                                        io.to(user.chatroom.title).emit('updateInfo', data);
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
                                    io.to(user.chatroom.title).emit('updateInfo', data);
                                    // socket.emit('updateRooms', rooms, socket.room);
                                })


                            })
                        }
                    }
                    else {
                        console.log("studentByChId", chatRoom.startTime <= moment().format('HH') && moment().format('HH') <= chatRoom.endTime)
                        socket.room = user.chatroom.title
                        let data = {"time": "time is over"}
                        io.to(user.chatroom.title).emit('updateInfo', data);
                    }
                }
            })

        });

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendChat', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            console.log("socket.userData", socket.userData)
            info.user = {}
            if (socket.userData.fname != undefined) {
                info.user.fname = socket.userData.fname
                info.user.lname = socket.userData.lname
            }
            else {
                info.user.name = socket.userData.name
            }

            info.user.avatarUrl = socket.userData.avatarUrl
            info.user._id = socket.userData._id
            info.user.username = socket.userData.username
            info.time = new Date().getTime()
            info.msg = data.msg
            let msgInfo = {}
            msgInfo.msg = info.msg;
            msgInfo.usrId = info.user._id
            msgInfo.chId = socket.roomId
            database.addMsg(msgInfo)
            io.to(socket.room).emit('updateChat', info);
        });

        socket.on('delete', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            let info = {}
            info.status = "done"
            database.delMsg(data.msgId)
            io.to(socket.room).emit('delMsg', info);
        });

        socket.on('pin', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            data.pinned = true
            database.editMsg(data.msgId, data)
            io.to(socket.room).emit('pinMsg', info);
        });

        socket.on('mark', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            data.marked = true
            database.editMsg(data.msgId, data)
            io.to(socket.room).emit('markMsg', info);
        });

        socket.on('warn', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            info.status = "done"
            data.warned = true
            database.editMsg(data.msgId, data)
            io.to(socket.room).emit('warnMsg', info);
        });


        socket.on('switchRoom', function (newroom) {
            // leave the current room (stored in session)
            socket.leave(socket.room);
            // join new room, received as function parameter
            socket.join(newroom);
            socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
            // sent message to OLD room
            socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room');
            // update socket session room title
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
            socket.emit('updaterooms', rooms, newroom);
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            // remove the username from global usernames list
            // delete usernames[socket.username];
            // // update list of users in chat, client-side
            // io.sockets.emit('updateusers', usernames);
            // // echo globally that this client has left
            // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            // socket.leave(socket.room);
        });
    });
})


module.exports = io;