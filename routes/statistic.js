var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let response = require('../util/responseHelper');
let jwt = require('../util/jwtHelper');


router.get('/', (req, res)=> {
    let statistic = {};
    database.getAdmins((admins)=> {
        if (admins == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            database.getAllLessons((lessons)=> {
                if (lessons == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    database.getAllStu((students)=> {
                        if (students == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            database.getLevels((levels)=> {
                                if (levels == -1) {
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    if (levels == 0) {
                                        statistic.levels = 0
                                    }
                                    else {
                                        statistic.levels = levels.length
                                    }
                                    if (students == 0) {
                                        statistic.students = 0
                                    }
                                    else {
                                        statistic.students = students.length
                                    }
                                    if (lessons == 0) {
                                        statistic.lessons = 0
                                    }
                                    else {
                                        statistic.lessons = lessons.length
                                    }
                                    if (admins == 0) {
                                        statistic.admins = 0
                                    }
                                    else {
                                        statistic.admins = admins.length
                                    }
                                    response.response('اطلاعات آماری', statistic, (result)=> {
                                        res.json(result)
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })

})

module.exports = router

module.exports.calculateProgress=(lsnId , cb)=>{
    database.getAllLessons((lessons)=>{
        if(lessons == 0){
            cb(0)
        }
        else if(lessons == -1){
            cb(-1)
        }
        else{
            let k= 0
            for(var i=0;i<lessons.length;i++){
                if(lessons[i]._id == lsnId){
                    k = i
                }
            }
            let progress = (k+1)/lessons.length
            console.log("progresssssss",progress)
            cb(progress)
        }
    })
}