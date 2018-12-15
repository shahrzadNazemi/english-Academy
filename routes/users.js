var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let jwt = require('../util/jwtHelper');
let response = require('../util/responseHelper');
let hashHelper = require('../util/hashHelper');
let config = require('../util/config');
let lesson = require('./lesson')


router.post('/admin/login', (req, res) => {
    req.body.password = hashHelper.hash(req.body.password)
    database.adminLogin(req.body, function (loginResult) {
        if (loginResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (loginResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            delete loginResult.password
            let data = loginResult
            data.jwt = jwt.signUser(loginResult.username)

            response.response('ورود با موفقیت انجام شد.', data, (result)=> {
                res.json(result)

            })
        }
    })
});

router.put('/admin/:admId', (req, res) => {
    req.body.password = hashHelper.hash(req.body.password)
    database.updateAdmin(req.body, req.params.admId, (Putresult)=> {
        if (Putresult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (Putresult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            delete  Putresult.password
            response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', Putresult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/admin', (req, res) => {
    database.getAdmins((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات همه ی ادمین ها', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/admin/:admId', (req, res) => {
    database.delAdmin(req.params.admId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == -4) {
            response.validation('آخرین ادمین قابل حذف شدن نیست.', '','lastAdmin' ,  (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات همه ی ادمین ها', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/admin/:admId' , (req , res)=>{
    database.getAdminById(req.params.admId , (admin)=>{

        if (admin == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (admin == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            delete  admin.password
            response.responseUpdated('اطلاعات کاربر مورد نظر', admin, (result)=> {
                res.json(result)

            })
        }
    })
})

router.post('/admin', (req, res)=> {
    req.body.password = hashHelper.hash(req.body.password)

    database.addAdmin(req.body, (addedAdmin)=> {
        if (addedAdmin == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.responseCreated('اطلاعات با موفقیت ثبت شد.', addedAdmin, (result)=> {
                res.json(result)

            })
        }
    })
});


router.post('/student/register', (req, res)=> {

    if (req.body.password == undefined || req.body.username == undefined) {
        res.status(500).end('password is required')
    }
    else {
        if (req.body.fname == undefined) {
            req.body.fname = ""
        }
        if (req.body.lname == undefined) {
            req.body.lname = ""
        }
        if (req.body.mobile == undefined) {
            req.body.mobile = ""
        }
        if (req.body.avatarUrl == undefined) {
            req.body.avatarUrl = ""
        }
        if (req.body.score == undefined) {
            req.body.score = ""
        }
        if (req.body.lastPassedLesson == undefined) {
            req.body.lastPassedLesson = ""
        }
        req.body.password = hashHelper.hash(req.body.password)
        if (req.files.file != null) {
            // type file
            database.addStu(req.body, (student)=> {
                if (student == -1) {
                    res.status(500).end('')
                }
                else {
                    delete student.password
                    req.body.id = student
                    // res.json(req.body)
                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                    var file = req.files.file.name.replace(`.${extension}`, '');
                    var newFile = new Date().getTime() + '.' + extension;
                    // path is Upload Directory
                    var dir = `${config.uploadPathStuImage}/${req.body.id}/`;
                    console.log("dir", dir)
                    lesson.addDir(dir, function (newPath) {
                        var path = dir + newFile;
                        req.files.file.mv(path, function (err) {
                            if (err) {
                                console.error(err);
                                res.status(500).end('')
                            }
                            else {
                                req.body.avatarUrl = path.replace(`${config.uploadPathStuImage}`, `${config.downloadPathStuImage}`)
                                req.body.id = (req.body.stu_id.replace(/"/g, ''));
                                req.body.setAvatar = true
                                database.updateStudent(req.body, JSON.parse(JSON.stringify(req.body.id)), (result)=> {
                                    if (result== -1 ) {
                                        res.status(500).end('')
                                    }
                                        else if(result == 0){
                                        res.status(404).end('')
                                    }
                                    else {
                                        delete  req.body.setAvatar
                                        res.json(req.body)
                                    }
                                })
                            }

                        })
                    });
                }
            })


        }
        else {
            database.addStu(req.body, (student)=> {
                if (student == -1) {
                    res.status(500).end('')
                }
                else {
                    delete student.password
                    req.body.id = student
                    res.json(req.body)
                }
            })
        }

    }


});

router.post('/student/login', (req, res) => {
    if (req.body == undefined) {
        res.status(400).end('no data is sent')
    }
    req.body.password = hashHelper.hash(req.body.password)

    database.stuLogin(req.body, function (loginResult) {
        if (loginResult == -1) {
            res.status(500).end('')
        }
        else if (loginResult == 0) {
            res.status(404).end('')
        }
        else {
            delete loginResult.password
            let data = loginResult
            data.jwt = jwt.signUser(loginResult.username)
            res.json(data)
        }
    })
});

router.put('/student/:stdId', (req, res) => {
    if (req.body.stu_password == undefined) {
        res.status(400).end('password is required')
    }
    else {
        req.body.password = hashHelper.hash(req.body.password)
        database.updateStudent(req.body, req.params.stdId, (Putresult)=> {
            if (Putresult == -1) {
                res.status(500).end('')
            }
            else if (Putresult == 0) {
                res.status(404).end('')
            }
            else {
                delete Putresult.password
                res.json(Putresult)
            }
        })
    }

});

router.get('/student', (req, res) => {
    database.getAdmins((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات همه ی ادمین ها', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/student/:stdId', (req, res) => {
    database.getStudentById(req.params.stdId, (getResult)=> {
        if (getResult == -1) {
            res.status(500).end('')
        }
        else if (getResult == 0) {
            res.status(404).end('')
        }
        else {
            delete getResult.password
            res.json(getResult)
        }
    })
});

router.get('/student/best', (req, res) => {
    database.getAllStu((getResult)=> {
        if (getResult == -1) {
            res.status(500).end('')
        }
        else if (getResult == 0) {
            res.status(404).end('')
        }
        else {
            let temp = []
            let length = getResult.length
            if (length <= 3) {
                res.json(getResult)
            }
            else {
                temp[0] = getResult[length]
                temp[1] = getResult[length - 1]
                temp[2] = getResult[length - 2]
                res.json(temp)
            }
        }
    })
});

router.delete('/student/:stdId', (req, res) => {
    database.delStudent(req.params.stdId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات مورد نظر حذف شد.', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});


module.exports = router