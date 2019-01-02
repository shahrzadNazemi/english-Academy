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
            logger.info("response body", body)
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













