var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let jwt = require('../util/jwtHelper');
let response = require('../util/responseHelper');
let hashHelper = require('../util/hashHelper')


router.post('/admin/login', (req, res) => {
    req.body.adm_password = hashHelper.hash(req.body.adm_password)
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
            delete loginResult.adm_password
            let data = loginResult
            data.jwt = jwt.signUser(loginResult.adm_username)

            response.response('ورود با موفقیت انجام شد.', data, (result)=> {
                res.json(result)

            })
        }
    })
});

router.put('/admin/:admId', (req, res) => {
    req.body.adm_password = hashHelper.hash(req.body.adm_password)
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
           delete  Putresult.adm_password
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
            else if(deleteResult == -4){
            response.validation('آخرین ادمین قابل حذف شدن نیست.', '', (result)=> {
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

router.post('/admin', (req, res)=> {
    req.body.adm_password = hashHelper.hash(req.body.adm_password)

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

    if(req.body.stu_password == undefined || req.body.stu_username == undefined){
        res.status(500).end('password is required')
    }
    else{
        if(req.body.stu_fname == undefined){
            req.body.stu_fname = ""
        }
        if(req.body.stu_lname == undefined){
            req.body.stu_lname = ""
        }
        if(req.body.stu_mobile == undefined){
            req.body.stu_mobile = ""
        }
        if(req.body.stu_avatarUrl == undefined){
            req.body.stu_avatarUrl = ""
        }
        if(req.body.stu_score == undefined){
            req.body.stu_score = ""
        }
        if(req.body.stu_lastPassedLesson == undefined){
            req.body.stu_lastPassedLesson = ""
        }
        req.body.stu_password = hashHelper.hash(req.body.stu_password)
            database.addStu(req.body, (student)=> {
                if (student == -1) {
                    res.status(500).end('')
                }
                else {
                    delete student.stu_password
                    req.body.stu_id = student
                    res.json(req.body)
                }
            })

    }


});

router.post('/student/login', (req, res) => {
    if (req.body == undefined) {
        res.status(400).end('no data is sent')
    }
    // req.body.stu_password = hashHelper.hash(req.body.stu_password)

    database.stuLogin(req.body, function (loginResult) {
        if (loginResult == -1) {
            res.status(500).end('')
        }
        else if (loginResult == 0) {
            res.status(404).end('')
        }
        else {
            delete loginResult.stu_password
            let data = loginResult
            data.jwt = jwt.signUser(loginResult.stu_username)
            res.json(data)
        }
    })
});

router.put('/student/:stdId', (req, res) => {
    if(req.body.stu_password  == undefined){
        res.status(400).end('password is required')
    }
    else{
        req.body.stu_password = hashHelper.hash(req.body.stu_password)
        database.updateStudent(req.body, req.params.stdId, (Putresult)=> {
            if (Putresult == -1) {
                res.status(500).end('')
            }
            else if (Putresult == 0) {
                res.status(404).end('')
            }
            else {
                delete Putresult.stu_password
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
            delete getResult.stu_password
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
            let temp =[]
            let length = getResult.length
            if(length <= 3){
                res.json(getResult)
            }
            else{
                temp[0] = getResult[length]
                temp[1] = getResult[length-1]
                temp[2] = getResult[length-2]
                res.json(temp)
            }
        }
    })
});

router.delete('/student/:stdId', (req, res) => {
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
        else {
            response.respondDeleted('اطلاعات همه ی ادمین ها', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.post('/student/avatar' , (req , res)=>{
    
})


module.exports = router