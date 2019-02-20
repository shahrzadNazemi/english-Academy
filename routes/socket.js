var io = require('socket.io')();
let database = require('../database/database')
// usernames which are currently connected to the chat
var usernames = [];

// rooms which are currently available in chat

// })

io.sockets.on('connection', function (socket) {
    database.getAllLessons((lessons)=> {
        let rooms = []
        if (lessons[0] != undefined) {
            for (var i = 0; i < lessons.length; i++) {
                rooms.push(lessons[i].title)
            }
        }
        // when the client emits 'getChatInfo', this listens and executes
        socket.on('getChatInfo', function (user) {
            if (typeof user == "string") {
                user = JSON.parse(user)
            }
            // store the username in the socket session for this client
            database.getStudentOfOneLesson(user._id, (result)=> {
                // usernames[username] = username;
                for (var k = 0; k < result.length; k++) {
                    if (result[k].student[0] != undefined) {
                        if (result[k].student[0]._id == user._id) {
                            socket.username = result[k].student[0].username
                            socket.userData = result[k].student[0]
                            // delete socket.userData.password

                        }
                        usernames.push(result[k].student[0].username)
                    }
                }
                socket.room = result[0].lesson[0].title;
                socket.join(result[0].lesson[0].title);
                let data = {}
                data.chatroomName = socket.room
                data.userCount = usernames.length
                // socket.emit('updateChat', 'SERVER', `you have connected to ${socket.room}`);
                // echo to room 1 that a person has connected to their room
                io.to(result[0].lesson[0].title).emit('updateInfo', data);
                // socket.emit('updateRooms', rooms, socket.room);

            })
        });

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendChat', function (data) {
            if (typeof data == "string") {
                data = JSON.parse(data)
            }
            // we tell the client to execute 'updatechat' with 2 parameters
            let info = {}
            // console.log("socket.userData" , socket.userData)
            info.user = {}
            info.user.fname = socket.userData.fname
            info.user.lname = socket.userData.lname
            info.user.avatarUrl = socket.userData.avatarUrl
            info.user._id = socket.userData._id
            info.user.username = socket.userData.username
            info.time = new Date().getTime()
            info.msg = data.msg
            io.to(socket.room).emit('updateChat', info);
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
            delete usernames[socket.username];
            // update list of users in chat, client-side
            io.sockets.emit('updateusers', usernames);
            // echo globally that this client has left
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);
        });
    });
})


module.exports = io;