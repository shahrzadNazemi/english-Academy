/**
 * Created by Ardeshir on 1/2/2019.
 */
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
let lesson = require('../routes/lesson')
let fs = require('fs');
let jwt = require('../util/jwtHelper')

const exam = {
    type: "object",
    properties: {
        title: {type: "string"},
        time: {type: "string"},
        preLesson: {type: "string"},
    },
    required: [],
    additionalProperties: false
};

router.post('/', (req, res)=> {

    let valid = ajv.validate(exam, req.body);
    if (!valid) {
        console.log(ajv.errors)
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
        if (req.body.preLesson) {
            req.body.preLesson = JSON.parse(req.body.preLesson)
        }
        if (req.files) {
            if (req.files.file != null) {
                // type file
                if (typeof req.body.time == "string") {
                    req.body.time = parseInt(req.body.time)
                }
                database.addExam(req.body, (addResult)=> {
                        if (addResult == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
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
                            var dir = `${config.uploadPathExamImage}/${req.body._id}/`;
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
                                        req.body.avatarUrl = path.replace(`${config.uploadPathExamImage}`, `${config.downloadPathExamImage}`)
                                        // req.body._id = (req.body._id.replace(/"/g, ''));
                                        console.log("body", req.body)

                                        if (req.body.time && typeof req.body.time == "string") {
                                            req.body.time = parseInt(req.body.time)
                                        }
                                        database.updateExam(req.body, req.body._id, (result)=> {
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
                                                response.response('اطلاعات با موفقیت ثبت شد.', result, (result)=> {
                                                    res.json(result)

                                                })
                                            }
                                        })
                                    }

                                })
                            });
                        }
                    }
                )
            }
            else {
                let errData = {"file": "فایلی به این نام فرستاده نشده است"}
                response.validation('فایلی به این نام فرستاده نشده است', errData, "required", (result)=> {
                    res.json(result)
                })
            }
        }
        else {
            if (req.body.time != undefined && typeof req.body.time == "string") {
                req.body.time = parseInt(req.body.time)
            }
            database.addExam(req.body, (addResult)=> {
                if (addResult == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
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
    }
});

router.put('/:exId', (req, res)=> {
    let valid = ajv.validate(exam, req.body);
    if (!valid) {
        console.log(ajv.errors)
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            if (Data == "title ") {
                errorData = {"title": ["وارد کردن عنوان ضروری است."]}
            }
            else {
                errorData = {"description": ["وارد کردن توضیحات ضروری است."]}
            }
        }
        else if (ajv.errors[0].keyword == 'minLength') {
            if (ajv.errors[0].params.limit == level.properties.title.minLength) {
                errorData = {"title": ["عنوان نباید کمتر از 3 حرف باشد."]}

            }
            else {
                errorData = {"description": ["توضیحات  نباید کمتر از 20 حرف باشد."]}
            }
        }
        else if (ajv.errors[0].keyword == 'maxLength') {
            errorData = {"title": ["عنوان نباید بیشتر از 30 حرف باشد."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        if (req.body.preLesson) {
            req.body.preLesson = JSON.parse(req.body.preLesson)
        }
        if (req.body.time && typeof req.body.time == "string") {
            req.body.time = parseInt(req.body.time)
        }
        database.getExamById(req.params.exId, (exam)=> {
            if (exam == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (exam == 0) {
                response.respondNotFound('سطح مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (req.files) {
                    let newExam = Object.assign({}, exam, req.body)
                    database.updateExam(newExam, req.params.exId, (result)=> {
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
                            if(exam.avatarUrl== undefined){
                                exam.avatarUrl = ""
                            }
                            var unlinkPath = exam.avatarUrl.replace(`${config.downloadPathExamImage}`, `${config.uploadPathExamImage}`);
                            fs.unlink(unlinkPath, function (err) {
                                try {
                                    if (req.files.file != null) {
                                        req.body._id = exam._id
                                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                        var file = req.files.file.name.replace(`.${extension}`, '');
                                        var newFile = new Date().getTime() + '.' + extension;
                                        // path is Upload Directory
                                        var dir = `${config.uploadPathLessonImage}/${req.body._id}/`;
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
                                                    req.body.avatarUrl = path.replace(`${config.uploadPathLessonImage}`, `${config.downloadPathLessonImage}`)
                                                    var newExam = Object.assign({}, exam, req.body)
                                                    database.updateExam(newExam, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
                                                        if (result == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (result == 0) {
                                                            response.respondNotFound('آزمون مورد نظر یافت نشد', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else {
                                                            response.response('ویرایش با موفقیت انجام شد', req.body, (result)=> {
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
                        }
                    });

                } else {
                    database.updateExam(req.body, req.params.exId, (result)=> {
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


    }
});

router.delete('/:exId', (req, res)=> {
    database.delExam(req.params.exId, (exam)=> {
        if (exam == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (exam == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', exam, (result)=> {
                res.json(result)

            })


        }
    })
});

router.get('/selective', (req, res)=> {
    database.getAllExams(0, (exam)=> {
        if (exam == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (exam == 0) {
            response.respondNotFound('آزمون مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let temp = []

            for (var i = 0; i < exam.length; i++) {
                temp[i] = {}
                temp[i].label = exam[i].title;
                temp[i].value = exam[i]._id
                console.log(temp)
            }
            response.response('اطلاعات همه ی آزمونها', temp, (result)=> {
                res.json(result)
            })

        }
    })
});

router.get('/:exId', (req, res)=> {
    database.getExamById(req.params.exId, (exam)=> {
        if (exam == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (exam == 0) {
            response.respondNotFound('آزمون مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('آزمون مورد نظر یافت شد.', exam, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    req.body.username = verify.userID
    database.getStudentByUsername(req.body.username , (student)=>{
        if(student == -1){
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })

        }
       else if (student ==0) {

            database.getAllExams(0, (exam)=> {
                if (exam == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (exam == 0) {
                    response.respondNotFound('آزمون مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.query.page) {
                        response.paginationClient(req.query.page, req.query.limit, exam, (result1)=> {
                            let countPages = Math.ceil(exam.length / req.query.limit)
                            result1.totalPage = countPages
                            response.response('اطلاعات همه ی آزمونها', result1, (result)=> {
                                res.json(result)
                            })
                        })

                    }
                    else {
                        response.response('اطلاعات همه ی آزمونها', exam, (result)=> {
                            res.json(result)
                        })

                    }

                }
            })

        }

                else {
                    database.getAllExams(student[0]._id, (getREsult)=> {
                        if (getREsult == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (getREsult == 0) {
                            response.respondNotFound('سطح مورد نظر یافت نشد.', [], (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            logger.info("getresult" , getREsult)
                            for(var i =0;i<getREsult.length;i++){
                                if(getREsult[i].result[0] != undefined){
                                    getREsult[i].result = getREsult[i].result[0].exam

                                }
                                getREsult[i].lesson = getREsult[i].lesson[0]
                            }
                            if (req.query.page) {
                                response.paginationClient(req.query.page, req.query.limit, getREsult, (result1)=> {
                                    let countPages = Math.ceil(getREsult.length / req.query.limit)
                                    result1.totalPage = countPages
                                    response.response('اطلاعات همه ی آزمونها', result1, (result)=> {
                                        res.json(result)
                                    })
                                })

                            }
                            else {
                                console.log(getREsult)
                                response.response('اطلاعات همه ی آزمونها', getREsult, (result)=> {
                                    res.json(result)
                                })

                            }
                        }

                    })
                }



    })
})

module.exports = router
