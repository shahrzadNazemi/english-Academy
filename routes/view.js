var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let response = require('../util/responseHelper');
let jwt = require('../util/jwtHelper');


router.get('/', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == -1 || student == 0) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let userId = student[0]._id
            if (req.query.vdId) {
                
                database.updateViewToSetTrue(req.query.vdId,userId ,'video',(result)=> {
                    if (result == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == 0) {
                        response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {

                        response.response('تغییر با موفقیت انجام شد', result, (result1)=> {
                            res.json(result1)

                        })
                    }
                })
            }
            else if (req.query.sndId) {
                database.updateViewToSetTrue(req.query.sndId,userId ,'sound',(result)=> {
                    if (result == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == 0) {
                        response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {

                        response.response('تغییر با موفقیت انجام شد', result, (result1)=> {
                            res.json(result1)

                        })
                    }
                })
            }
            else {
                let errData = {"query": "داده ای فرستاده نشده است"}
                response.validation('اطلاعات وارد شده صحیح نیست', errData, "required", (result)=> {
                    res.json(result)
                })
            }
        }
    })

})

module.exports = router