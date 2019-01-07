var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let response = require('../util/responseHelper');
const ajv = require("ajv")({
    removeAdditional: true,
    $data: true,
    verbose: true,
    allErrors: true
});
let config = require('../util/config');
let fs = require('fs')
let lesson = require('./lesson')


router.post('/', (req, res)=> {
    if (req.files) {
        if (req.body.avatarUrl == undefined) {
            req.body.avatarUrl = ""
        }
        if (req.files.file != null) {
            // type file
            database.addNotif(req.body, (notification)=> {
                if (notification == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    req.body._id = notification
                    // res.json(req.body)
                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                    var file = req.files.file.name.replace(`.${extension}`, '');
                    var newFile = new Date().getTime() + '.' + extension;
                    // path is Upload Directory
                    var dir = `${config.uploadPathNotifImage}/${req.body._id}/`;
                    console.log("dir", dir)
                    lesson.addDir(dir, function (newPath) {
                        var path = dir + newFile;
                        req.files.file.mv(path, function (err) {
                            if (err) {
                                console.error(err);
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                req.body.avatarUrl = path.replace(`${config.uploadPathNotifImage}`, `${config.downloadPathNotifImage}`)
                                // req.body._id = (req.body._id.replace(/"/g, ''));
                                console.log("body", req.body)

                                database.updateNotif(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
                                    if (result == -1) {
                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                            res.json(result)
                                        })
                                    }
                                    else if (result == 0) {
                                        response.respondNotFound('کاربر مورد نظر یافت نشد', {}, (result)=> {
                                            res.json(result)
                                        })
                                    }
                                    else {
                                        response.response('اطلاعات با موفقیت ثبت شد.', req.body, (result)=> {
                                            res.json(result)

                                        })
                                    }
                                })
                            }

                        })
                    });
                }
            })
        }
        else {
            let errData = {"file": "فایلی به این نام فرستاده نشده است"}
            response.validation('فایلی به این نام فرستاده نشده است', errData, "required", (result)=> {
                res.json(result)
            })
        }
    }
    else {
        database.addNotif(req.body, (addResult)=> {
            if (addResult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else {
                response.responseCreated('اطلاعات با موفقیت ثبت شد.', addResult, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.put('/:QId', (req, res)=> {
    console.log("req.body in updateQ" , req.body)

    if (req.body.score &&typeof req.body.score == "string") {
        req.body.score = parseInt(req.body.score)
    }
    if (req.body.trueIndex && typeof req.body.trueIndex == "string") {
        req.body.trueIndex = parseInt(req.body.trueIndex)
    }
    if (req.body.answers != undefined && req.body.trueIndex!= undefined)
        for (var i = 0; i < req.body.answers.length; i++) {
            if (i == req.body.trueIndex) {
                req.body.answers[i].isTrue = true
            }
            else {
                req.body.answers[i].isTrue = false
            }
        }

    console.log(req.body)
    database.updateQuestion(req.body, req.params.QId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('ویرایش با موفقیت انجام شد', result, (result)=> {
                res.json(result)

            })
        }
    })

});

router.delete('/:QId', (req, res)=> {
    database.delQuestion(req.params.QId, (question)=> {
        if (question == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (question == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', question, (result)=> {
                res.json(result)

            })


        }
    })
});

router.get('/:QId', (req, res)=> {
    database.getQuestionById(req.params.QId, (question)=> {
        if (question == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (question == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('سوال مورد نظر یافت شد.', question, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    database.getAllQuestions((question)=> {
        if (question == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (question == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.page != undefined) {
                response.paginationClient(req.query.page, req.query.limit, question, (result1)=> {
                    let countPages = Math.ceil(question.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی سوالات', result1, (result)=> {
                        res.json(result)
                    })
                })

            }
            else {
                response.response('اطلاعات همه ی سوالات', question, (result)=> {
                    res.json(result)
                })
            }

        }
    })

});


module.exports = router