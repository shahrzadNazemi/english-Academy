var express = require('express');
var request = require('request')
var logger = require("../util/logger");
var config = require('../util/config');
var util = require('util')


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

module.exports.addLevel = (levelInfo, cb)=> {
    request.post({
        url: `${config.databaseServer}/api/level`,
        headers: {"content-Type": "application/json"},
        body: levelInfo,
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

module.exports.updateLevel = (updateInfo, cb)=> {
    request.put({
        url: `${config.databaseServer}/api/level/${updateInfo.lvlID}`,
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



