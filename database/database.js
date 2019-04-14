var express = require('express');
var request = require('request')
var logger = require("../util/logger");
var config = require('../util/config');
var util = require('util')
let fs = require('fs')


module.exports.adminLogin = (loginData, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/admin/login`,
        headers: {"content-Type": "application/json"},
        body: loginData,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.stuLogin = (loginData, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/student/login`,
        headers: {"content-Type": "application/json"},
        body: loginData,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.addLevel = (levelInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/level`,
        headers: {"content-Type": "application/json"},
        body: levelInfo,
        json: true
    }, function (err, response, body) {
        console.log(response.statusCode)
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else if (response.statusCode == 402) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addNotif = (notifInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/notification`,
        headers: {"content-Type": "application/json"},
        body: notifInfo,
        json: true
    }, function (err, response, body) {
        console.log(response.statusCode)
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else if (response.statusCode == 402) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addType = (typeInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson/type`,
        headers: {"content-Type": "application/json"},
        body: typeInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addTypeOfTicket = (typeInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/ticket/type`,
        headers: {"content-Type": "application/json"},
        body: typeInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addCategory = (categoryInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson/category`,
        headers: {"content-Type": "application/json"},
        body: categoryInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateLevel = (updateInfo, lvlId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/level/${lvlId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else if (response.statusCode == 402) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.delLevel = (lvlId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/level/${lvlId}`,
        headers: {"content-Type": "application/json"},
        // body: loginData,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.delTypeOfTicket = (depId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/ticket/type/${depId}`,
        headers: {"content-Type": "application/json"},
        // body: loginData,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.delNote = (ntId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/note/${ntId}`,
        headers: {"content-Type": "application/json"},
        // body: loginData,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.delTrick = (trckId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/trick/${trckId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getLevelById = (lvlId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/level/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getLevels = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/level`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.addAdmin = (adminData, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/admin`,
        headers: {"content-Type": "application/json"},
        body: adminData,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addSupporer = (data, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/supporter`,
        headers: {"content-Type": "application/json"},
        body: data,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addChatAdmin = (data, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/chatAdmin`,
        headers: {"content-Type": "application/json"},
        body: data,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.getAdmins = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/admin`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getSupporters = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/supporter`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getAllTypes = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/type`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getTypeOfTicket = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/ticket/type`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getAllCategories = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/category`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateAdmin = (updateInfo, admId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/admin/${admId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateSupporter = (updateInfo, supId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/supporter/${supId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateChatAdmin = (updateInfo, caId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/chatAdmin/${caId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.delStudent = (stuId, cb)=> {
    console.log(stuId)
    request.delete({
        url: `${config.databaseServer}/api/users/student/${stuId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 403) {
            console.log('last admin can not be deleted')
            cb(-4)
        }

        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delChatAdmin = (caId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/users/chatAdmin/${caId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 403) {
            console.log('last admin can not be deleted')
            cb(-4)
        }

        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.delCategory = (catId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/category/${catId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 403) {
            console.log('last admin can not be deleted')
            cb(-4)
        }

        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addLesson = (lsnInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson`,
        headers: {"content-Type": "application/json"},
        body: lsnInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addVideo = (videoInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson/video`,
        headers: {"content-Type": "application/json"},
        body: videoInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addTrick = (trickInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/trick`,
        headers: {"content-Type": "application/json"},
        body: trickInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addSound = (soundInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson/sound`,
        headers: {"content-Type": "application/json"},
        body: soundInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addQuestion = (QInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/question`,
        headers: {"content-Type": "application/json"},
        body: QInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addExam = (examInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/exam`,
        headers: {"content-Type": "application/json"},
        body: examInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addText = (textInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson/text`,
        headers: {"content-Type": "application/json"},
        body: textInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addNote = (noteInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/lesson/note`,
        headers: {"content-Type": "application/json"},
        body: noteInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateLesson = (updateInfo, lsnId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/lesson/${lsnId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateText = (updateInfo, txtId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/lesson/text/${txtId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateTutor = (updateInfo, tId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/tutor/${tId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addUserForTutor = (updateInfo, tId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/tutor/${tId}/student`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.popUserFromOtherTutors = (updateInfo, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/tutor/popStu`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.addTutorMsg = (data , cb)=> {
    request.post({
        url: `${config.databaseServer}/api/message/tutor`,
        headers: {"content-Type": "application/json"},
        body: data,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getTutorByLevel = (lvlId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/tutor/level/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getVIPUserMessages = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/message/user/vip/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getClosedChatsOfTutor = (trId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/user/tutor/${trId}/closedChat`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getOpenChatsOfTutor = (trId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/user/tutor/${trId}/openChat`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};




module.exports.getTutorById = (tId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/tutor/${tId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};



module.exports.delTutor = (tId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/users/tutor/${tId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getTutors = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/tutor`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addTutor = (updateInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/tutor`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.updateNote = (updateInfo, ntId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/lesson/note/${ntId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateQuestion = (updateInfo, QId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/question/${QId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateVideo = (updateInfo, vdId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/lesson/video/${vdId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateTrick = (updateInfo, trckId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/trick/${trckId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateSound = (updateInfo, sndId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/lesson/sound/${sndId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateExam = (updateInfo, exId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/exam/${exId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delLesson = (lsnId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        } else if (response.statusCode == 402) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delAdmin = (admId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/users/admin/${admId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delSupporter = (supId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/users/supporter/${supId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delQuestion = (QId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/question/${QId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delExam = (exId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/exam/${exId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delVideo = (vdId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/video/${vdId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delNotification = (NId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/notification/${NId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delSound = (sndId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/sound/${sndId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delChatroom = (chId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/chatroom/${chId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delType = (typeId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/type/${typeId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.delText = (txtId, cb)=> {
    request.delete({
        url: `${config.databaseServer}/api/lesson/text/${txtId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }
        else if (response.statusCode == 403) {
            cb(-3)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getVideoByLsnLvl = (lvlId, lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/${lsnId}/video/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getSoundByLsnLvl = (lvlId, lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/${lsnId}/sound/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getSoundBysndId = (sndId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/sound/${sndId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};

module.exports.getTypeOfTicketById = (depId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/ticket/type/${depId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};

module.exports.getChatAdminById = (caId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/chatAdmin/${caId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};

module.exports.getChatAdmins = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/chatAdmin`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};


module.exports.getStudentOfLevel = (lvlId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/level/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};

module.exports.getTypeById = (typeId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/type/${typeId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};

module.exports.getTextBytxtId = (txtId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/text/${txtId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            console.log(body)
            cb(body)
        }
    })
};

module.exports.getVideoByVDId = (vdId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/video/${vdId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getTrickById = (trckId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/trick/${trckId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getStuOfLevel = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/bestLevel/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getAllNotes = (lsnId, usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/${lsnId}/note/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getAllLessons = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getAllChatrooms = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};


module.exports.getAllTrickes = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/trick`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getAllQuestions = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/question`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getAllExams = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/exam/user/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getFirstLesson = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/first`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getLessonByLvlId = (lvlId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/level/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};

module.exports.getlevelOfStudent = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/level/student/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })
};


module.exports.getVDByLsnLvl = (lsnId, lvlId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/${lsnId}/video/${lvlId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            cb(body)
        }
    })

};

module.exports.addStu = (stuInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/student`,
        headers: {"content-Type": "application/json"},
        body: stuInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.verification = (info, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/student/verification`,
        headers: {"content-Type": "application/json"},
        body: info,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.addTicket = (ticketInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/ticket`,
        headers: {"content-Type": "application/json"},
        body: ticketInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addChatroom = (chatroomInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/chatroom`,
        headers: {"content-Type": "application/json"},
        body: chatroomInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.addCertificate = (certInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/certificate`,
        headers: {"content-Type": "application/json"},
        body: certInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addView = (viewInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/view`,
        headers: {"content-Type": "application/json"},
        body: viewInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 403) {
            cb(-2)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getStudentById = (stdId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/${stdId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getStudentByUsername = (username, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/username/${username}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            // logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getCertificateById = (certId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/certificate/${certId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getCertificateByUsr = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/certificate/student/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getExamPassedCount = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/result/student/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getStuPlacement = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/placement/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getPrCrNxtLesson = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/prCrNxt/lesson/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllStu = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/best`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            // logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllVideo = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/video`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllSound = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/sound`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllText = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/text`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getQuestionByLsnId = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/question/quiz/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getTicketById = (tktId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/ticket/${tktId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getTicketBySupId = (supId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/ticket/supporter/${supId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getStudentOfOneLesson = (userId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/${userId}/lesson`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getStudentByLesson = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/student/lesson/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllTickets = (supId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/ticket/all/${supId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getTicketByStuId = (stuId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/ticket/student/${stuId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllQuestionOfLesson = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/question/lesson/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getExamQUestion = (exId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/question/exam/${exId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getViewUser = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/view/user/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.updateStudent = (updateInfo, stdId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/users/student/${stdId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateChatroom = (updateInfo, chId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/chatroom/${chId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.updateTicket = (updateInfo, tktId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/ticket/${tktId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateTicketView = (tktId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/ticket/${tktId}/view`,
        headers: {"content-Type": "application/json"},
        body: {},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateTypeOfTicket = (updateInfo, depId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/ticket/type/${depId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateCertificate = (updateInfo, certId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/certificate/${certId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateResult = (updateInfo, stdId, lsnId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/result/${stdId}/${lsnId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateNotif = (updateInfo, NId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/notification/${NId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateViewToInsert = (updateInfo, lsnId, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/view/${lsnId}`,
        headers: {"content-Type": "application/json"},
        body: updateInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.updateViewToSetTrue = (id, userId, type, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/view/${type}/${id}/${userId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else if (response.statusCode == 402) {
            cb(-2)
        }

        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getAdminById = (admId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/admin/${admId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getChatroomById = (chId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom/${chId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.studentByChId = (chId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom/${chId}/student`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getBlockedStuOfChatRoom = (chId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom/${chId}/student/blocked`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getreportedMsgChatRoom = (chId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom/${chId}/reported`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getChatAdminByChatRoom = (chId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom/${chId}/chatAdmin`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};


module.exports.getAllCertifications = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/certificate`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getSupporterById = (supId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/users/supporter/${supId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getResultUsrLsn = (usrId, lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/result/${usrId}/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getExamById = (exId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/exam/${exId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getLessonById = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            // logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getAllNotifications = (cb)=> {
    request.get({
        url: `${config.databaseServer}/api/notification`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getNotificationById = (NId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/notification/${NId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getQuestionById = (QId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/question/${QId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getNextLesson = (lsnId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/lesson/next/${lsnId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getStudentByLevel = (lvlId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/student/level/${lvlId}/best`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.getExamResultUsr = (usrId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/result/exam/${usrId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.stuPlacement = (placeInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/users/student/placement`,
        headers: {"content-Type": "application/json"},
        body: placeInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};

module.exports.answerQuestion = (info, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/result/answerQuestion`,
        headers: {"content-Type": "application/json"},
        body: info,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })

};


module.exports.addMsg = (msgInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/message`,
        headers: {"content-Type": "application/json"},
        body: msgInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.addReportMsg = (reportInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/message/report`,
        headers: {"content-Type": "application/json"},
        body: reportInfo,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.delMsg = (msgId)=> {
    request.delete({
        url: `${config.databaseServer}/api/message/${msgId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        console.log(response.statusCode)
    })
};

module.exports.getMsgByChatRoom = (chId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/message/chatRoom/${chId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};

module.exports.getChatroomByChatAdmin = (caId, cb)=> {
    request.get({
        url: `${config.databaseServer}/api/chatroom/chatAdmin${caId}`,
        headers: {"content-Type": "application/json"},
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


module.exports.editMsg = (msgId, info, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/message/${msgId}`,
        headers: {"content-Type": "application/json"},
        body: info,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('err in sending data to database')
            cb(-1)
        }
        else if (response.statusCode == 500) {
            console.log('err in db')
            cb(-1)
        }
        else if (response.statusCode == 404) {
            cb(0)
        }
        else {
            logger.info("response body", body)
            cb(body)
        }
    })
};


