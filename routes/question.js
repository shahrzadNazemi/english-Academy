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
let config = require('../util/config')
let lesson = require('./lesson')
let fs = require('fs')
let moment = require('moment')
let jwt = require('../util/jwtHelper')

const question = {
    type: "object",
    properties: {
        content: {type: "string"},
        score: {type: "string"},
        typeId: {type: "string"},
        answers: {type: "string"},
        lesson: {type: "string"},
        exam: {type: "string"},
        trueIndex: {type: "string"}
    },
    required: ["typeId"],
    additionalProperties: false
};

router.post('/', (req, res)=> {
    console.log("body in here", req.body)
    let valid = ajv.validate(question, req.body);
    if (!valid) {
        // console.log(ajv.errors)
        // let normalisedErrors = normalise(ajv.errors);

        // console.log(normalisedErrors)

        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == "title ") {
                errorData = {"title": ["وارد کردن عنوان ضروری است."]}
            }
            else if (Data == "description") {
                errorData = {"description": ["وارد کردن توضیحات ضروری است."]}
            }
            else {
                errorData = {"description": ["وارد کردن ترتیب ضروری است."]}
            }
        }
        else if (ajv.errors[0].keyword == 'minLength') {
            if (ajv.errors[0].params.limit == level.properties.title.minLength) {
                errorData = {"lvl_title": ["عنوان نباید کمتر از 3 حرف باشد."]}

            }
            else {
                errorData = {"description": ["توضیحات نباید کمتر از 20 حرف باشد."]}
            }
        }
        else if (ajv.errors[0].keyword == 'maxLength') {
            errorData = {"title": ["عنوان نباید بیشتر از 20 حرف باشد."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    } else {
        if (req.body.lesson && typeof req.body.lesson == "string") {
            req.body.lesson = JSON.parse(req.body.lesson)
        }
        if (req.body.exam && typeof req.body.exam == "string") {
            req.body.exam = JSON.parse(req.body.exam)
        }
        if (req.body.answers && typeof req.body.answers == "string") {
            req.body.answers = JSON.parse(req.body.answers)
        }
        if (req.files) {
            if (req.body.url == undefined) {
                req.body.url = ""
            }
            if (req.files.file != null) {
                // type file
                database.getTypeById(req.body.typeId, (type)=> {
                    if (type == -1 || 0) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        req.body.type = type.title
                        if (req.body.type == "quiz") {
                            req.body.exam = {}
                        }
                        else if (req.body.type == "exam") {
                            req.body.lesson = {}
                        }
                        if (!req.body.type) {
                            req.body.exam = {}
                            req.body.lesson = {}
                            req.body.type = ""
                        }
                        if (typeof req.body.trueIndex == "string") {
                            req.body.trueIndex = parseInt(req.body.trueIndex)
                        }
                        if (typeof req.body.score == "string") {
                            req.body.score = parseInt(req.body.score)
                        }
                        for (var i = 0; i < req.body.answers.length; i++) {
                            if (i == req.body.trueIndex) {
                                req.body.answers[i].isTrue = true
                            }
                            else {
                                req.body.answers[i].isTrue = false
                            }
                        }
                        database.addQuestion(req.body, (addResult)=> {
                            if (addResult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (addResult == -2) {
                                let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                                response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (addResult == -3) {
                                let errData = {"order": "ترتیب سطح نمیتواند تکراری باشد"}
                                response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                req.body._id = addResult
                                // res.json(req.body)
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathQvoice}/${req.body._id}/`;
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
                                            req.body.url = path.replace(`${config.uploadPathQvoice}`, `${config.downloadPathQvoice}`)
                                            // req.body._id = (req.body._id.replace(/"/g, ''));
                                            console.log("body", req.body)
                                            database.updateQuestion(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
            if (req.body.url == undefined) {
                req.body.url = ""
            }
            if (req.body.lesson && typeof req.body.lesson == "string") {
                req.body.lesson = JSON.parse(req.body.lesson)
            }
            if (req.body.exam && typeof req.body.exam == "string") {
                req.body.exam = JSON.parse(req.body.exam)
            }
            if (req.body.answers && typeof req.body.answers == "string") {
                req.body.answers = JSON.parse(req.body.answers)
            }
            database.getTypeById(req.body.typeId, (type)=> {
                if (type == -1 || 0) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    req.body.type = type.title
                    if (req.body.type == "quiz") {
                        req.body.exam = {}
                    }
                    else if (req.body.type == "exam") {
                        req.body.lesson = {}
                    }
                    if (!req.body.type) {
                        req.body.exam = {}
                        req.body.lesson = {}
                        req.body.type = ""
                    }
                    if (typeof req.body.trueIndex == "string") {
                        req.body.trueIndex = parseInt(req.body.trueIndex)
                    }
                    if (typeof req.body.score == "string") {
                        req.body.score = parseInt(req.body.score)
                    }
                    for (var i = 0; i < req.body.answers.length; i++) {
                        if (i == req.body.trueIndex) {
                            req.body.answers[i].isTrue = true
                        }
                        else {
                            req.body.answers[i].isTrue = false
                        }
                    }
                    database.addQuestion(req.body, (addResult)=> {
                        if (addResult == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (addResult == -2) {
                            let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else if (addResult == -3) {
                            let errData = {"order": "ترتیب سطح نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
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

        }


    }
});

router.put('/:QId', (req, res)=> {
    if (req.body.score && typeof req.body.score == "string") {
        req.body.score = parseInt(req.body.score)
    }
    if (req.body.trueIndex && typeof req.body.trueIndex == "string") {
        req.body.trueIndex = parseInt(req.body.trueIndex)
    }
    if (req.body.lesson && typeof req.body.lesson == "string") {
        req.body.lesson = JSON.parse(req.body.lesson)
    }
    if (req.body.exam && typeof req.body.exam == "string") {
        req.body.exam = JSON.parse(req.body.exam)
    }
    if (req.body.answers && typeof req.body.answers == "string") {
        req.body.answers = JSON.parse(req.body.answers)
    }

    if (req.body.answers != undefined && req.body.trueIndex != undefined)
        for (var i = 0; i < req.body.answers.length; i++) {
            if (i == req.body.trueIndex) {
                req.body.answers[i].isTrue = true
            }
            else {
                req.body.answers[i].isTrue = false
            }
        }
    database.getQuestionById(req.params.QId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.files) {
                var unlinkPath = result.url.replace(`${config.downloadPathQvoice}`, `${config.uploadPathQvoice}`);
                fs.unlink(unlinkPath, function (err) {
                    try {
                        if (req.files.file != null) {
                            req.body._id = req.params.QId
                            var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                            var file = req.files.file.name.replace(`.${extension}`, '');
                            var newFile = new Date().getTime() + '.' + extension;
                            // path is Upload Directory
                            var dir = `${config.uploadPathQvoice}/${req.body._id}/`;
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
                                        req.body.url = path.replace(`${config.uploadPathQvoice}`, `${config.downloadPathQvoice}`)
                                        // var newLevel = Object.assign(req.body, level)
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
                                    }
                                })
                            });
                        }
                        else {
                            response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                                res.json(result)
                            })
                        }
                    }
                    catch (e) {
                        console.log(e)
                    }


                })

            } else {
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

            }
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

router.get('/quiz/:lsnId', (req, res)=> {
    database.getQuestionByLsnId(req.params.lsnId, (question)=> {
        if (question == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (question == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات سوالات', question, (result)=> {
                res.json(result)
            })
        }
    })
})

router.get('/exam/:exId', (req, res)=> {
    database.getExamQUestion(req.params.exId, (question)=> {
        if (question == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (question == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات سوالات', question, (result)=> {
                res.json(result)
            })
        }
    })
})

router.get('/lesson/:lsnId', (req, res)=> {
    database.getAllQuestionOfLesson(req.params.lsnId, (question)=> {
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
            response.response('اطلاعات سوالات', question, (result)=> {
                res.json(result)
            })
        }
    })
})

router.post('/answer', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    req.body.username = verify.userID
    database.getStudentByUsername(req.body.username, (student)=> {
        if (student == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })

        }
        else if (student == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            req.body.usrId = student[0]._id
            database.getResultUsrLsn(student[0]._id, req.body.lsnId, (result)=> {
                if (result == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })

                }
                else if (result == 0) {
                    response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })

                }
                else {
                    if(req.body.type == "exam"){
                        if (result.timePassed) {
                            let pass = moment(result.timePassed).add(1 , 'h')
                            let currentTime = new Date().getTime()
                            if (currentTime < moment(result.timePassed).add(result.exam.time , 'm')) {
                                database.answerQuestion(req.body, (question)=> {
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
                                        response.response('اطلاعات سوالات', question, (result)=> {
                                            res.json(result)
                                        })

                                    }
                                })
                            }
                            else {
                                if (pass < currentTime) {
                                    req.body.round = true
                                    database.answerQuestion(req.body, (question)=> {
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
                                            response.response('اطلاعات سوالات', question, (result)=> {
                                                res.json(result)
                                            })

                                        }
                                    })
                                }
                                else {
                                    response.validation('یک ساعت ', {}, 403, (result)=> {
                                        res.json(result)
                                    })
                                }
                            }


                        }
                        else {
                            database.answerQuestion(req.body, (question)=> {
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
                                    response.response('اطلاعات سوالات', question, (result)=> {
                                        res.json(result)
                                    })

                                }
                            })

                        }
                    }
                    else{
                        if (result.timePassed) {
                            let pass = moment(result.timePassed).add(1 , 'h')
                            let currentTime = new Date().getTime()
                            if (currentTime < moment(result.timePassed).add(result.quiz.time , 'm')) {
                                database.answerQuestion(req.body, (question)=> {
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
                                        response.response('اطلاعات سوالات', question, (result)=> {
                                            res.json(result)
                                        })

                                    }
                                })
                            }
                            else {
                                if (pass < currentTime) {
                                    req.body.round = true
                                    database.answerQuestion(req.body, (question)=> {
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
                                            response.response('اطلاعات سوالات', question, (result)=> {
                                                res.json(result)
                                            })

                                        }
                                    })
                                }
                                else {
                                    response.validation('یک ساعت ', {}, 403, (result)=> {
                                        res.json(result)
                                    })
                                }
                            }


                        }
                        else {
                            database.answerQuestion(req.body, (question)=> {
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
                                    response.response('اطلاعات سوالات', question, (result)=> {
                                        res.json(result)
                                    })

                                }
                            })

                        }
                    }

                }
            })

        }
    })
});

module.exports = router