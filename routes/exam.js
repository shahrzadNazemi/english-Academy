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
    if(req.body.preLesson){
        req.body.preLesson = JSON.parse(req.body.preLesson)
    }
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

                                            if (req.body.time  &&typeof req.body.time == "string") {
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
                                                    response.response('اطلاعات با موفقیت ثبت شد.', result , (result)=> {
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
        else{
            if (req.body.time !=undefined && typeof req.body.time == "string") {
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
    if(req.body.preLesson){
        req.body.preLesson = JSON.parse(req.body.preLesson)
    }
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
        if (req.body.time  &&typeof req.body.time == "string") {
            req.body.time = parseInt(req.body.time)
        }
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
                response.response('ویرایش با موفقیت انجام شد', result , (result)=> {
                    res.json(result)

                })
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
    database.getAllExams((exam)=> {
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

router.get('/:lvlId', (req, res)=> {
    database.getLevelById(req.params.lvlId, (level)=> {
        if (level == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (level == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('سطح مورد نظر یافت شد.', level, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    database.getLevels((getREsult)=> {
        if (getREsult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getREsult == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('سطح مورد نظر یافت شد.', getREsult, (result)=> {
                res.json(result)

            })
        }
    })
    // res.json({"status":"success"})
});




module.exports = router