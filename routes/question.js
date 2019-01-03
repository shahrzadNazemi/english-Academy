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

const question = {
    type: "object",
    properties: {
        content: {type: "string"},
        score: {type: "string"},
        type: {type: "string"},
        answers: {type: "array"},
        lesson: {type: "object"},
        exam: {type: "object"},
        trueIndex: {type: "string"}
    },
    required: [],
    additionalProperties: false
};

router.post('/', (req, res)=> {

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
                response.responseCreated('اطلاعات با موفقیت ثبت شد.', addResult, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.put('/:QId', (req, res)=> {
    let valid = ajv.validate(question, req.body);
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

    }
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