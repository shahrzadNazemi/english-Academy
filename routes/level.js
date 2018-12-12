var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let response = require('../util/responseHelper');
const ajv = require("ajv")({
    removeAdditional: true
});


const level = {
    type: "object",
    properties: {
        lvl_title: {type: "string", minLength: 3, maxLength: 20},
        lvl_description: {type: "string", minLength: 21}
    },
    required: ["lvl_title", "lvl_description"],
    additionalProperties: false
};
router.post('/', (req, res)=> {
    let valid = ajv.validate(level, req.body);
    if (!valid) {
        console.log(ajv.errors)
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            if (Data == "lvl_title ") {
                errorData = {"lvl_title": ["وارد کردن عنوان ضروری است."]}
            }
            else {
                errorData = {"lvl_description": ["وارد کردن توضیحات ضروری است."]}
            }
        }
        else if (ajv.errors[0].keyword == 'minLength') {
            if (ajv.errors[0].params.limit == level.properties.lvl_title.minLength) {
                errorData = {"lvl_title": ["عنوان نباید کمتر از 3 حرف باشد."]}

            }
            else {
                errorData = {"lvl_description": ["عنوان نباید کمتر از 20 حرف باشد."]}
            }
        }
        else if (ajv.errors[0].keyword == 'maxLength') {
            errorData = {"lvl_title": ["عنوان نباید بیشتر از 20 حرف باشد."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    } else {
        database.addLevel(req.body, (addResult)=> {
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
})

router.put('/:lvlId', (req, res)=> {
    let valid = ajv.validate(level, req.body);
    if (!valid) {
        console.log(ajv.errors)
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            if (Data == "lvl_title ") {
                errorData = {"lvl_title": ["وارد کردن عنوان ضروری است."]}
            }
            else {
                errorData = {"lvl_description": ["وارد کردن توضیحات ضروری است."]}
            }
        }
        else if (ajv.errors[0].keyword == 'minLength') {
            if (ajv.errors[0].params.limit == level.properties.lvl_title.minLength) {
                errorData = {"lvl_title": ["عنوان نباید کمتر از 20 حرف باشد."]}

            }
            else {
                errorData = {"lvl_description": ["عنوان نباید کمتر از 20 حرف باشد."]}
            }
        }
        else if (ajv.errors[0].keyword == 'maxLength') {
            errorData = {"lvl_title": ["عنوان نباید بیشتر از 30 حرف باشد."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        database.updateLevel(req.body, req.params.lvlId, (updateResult)=> {
            if (updateResult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (updateResult == 0) {
                response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                    res.json(result)
                })
            }
            else {
                response.responseUpdated('اطلاعات با موقیت تغییر یافت', updateResult, (result)=> {
                    res.json(result)

                })
            }
        })

    }
})

router.delete('/:lvlId', (req, res)=> {
    database.delLevel(req.params.lvlId, (delResult)=> {
        if (delResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (delResult == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', delResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/:lvlId', (req, res)=> {
    database.getLevelById(req.params.lvlId, (level)=> {
        if (level == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (level == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('سطح مورد نظر یافت شد.', level, (result)=> {
                res.json(result)

            })
        }
    })
})

router.get('/', (req, res)=> {
    database.getLevels((getREsult)=> {
        if (getREsult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (getREsult == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
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
})


module.exports = router