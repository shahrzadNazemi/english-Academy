var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let fs = require('fs')
let response = require('../util/responseHelper');
const ajv = require("ajv")({
    removeAdditional: true,
    $data: true,
    verbose: true,
    allErrors: true
});
var normalise = require('ajv-error-messages');
let lesson = require('./lesson');
let config = require('../util/config')

const level = {
    type: "object",
    properties: {
        title: {type: "string", minLength: 3, maxLength: 50},
        description: {type: "string"},
        order: {type: "string"}
    },
    required: ["title", "order"],
    additionalProperties: false
};

router.post('/', (req, res)=> {
    let valid = ajv.validate(level, req.body);
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
        if (req.files) {
            if (req.body.avatarUrl == undefined) {
                req.body.avatarUrl = ""
            }
            if (req.files.file != null) {
                // type file
                database.addLevel(req.body, (level)=> {
                    if (level == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (level == -2) {
                        let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                        response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                            res.json(result)
                        })
                    }
                    else if (level == -3) {
                        let errData = {"order": "ترتیب سطح نمیتواند تکراری باشد"}
                        response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        console.log(level)
                        req.body._id = level.lvlID
                        // res.json(req.body)
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathLevelImage}/${req.body._id}/`;
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
                                    req.body.avatarUrl = path.replace(`${config.uploadPathLevelImage}`, `${config.downloadPathLevelImage}`)
                                    // req.body._id = (req.body._id.replace(/"/g, ''));
                                    console.log("body", req.body)

                                    database.updateLevel(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                        else if (result == -2) {
                                            let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (result == -3) {
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
            database.addLevel(req.body, (addResult)=> {
                if (addResult == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
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

    }
});

router.put('/:lvlId', (req, res)=> {
    let valid = ajv.validate(level, req.body);
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
                if (req.files) {
                    var newLevel = Object.assign({}, level, req.body)
                    database.updateLevel(newLevel, level._id, (result)=> {
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
                        else if (result == -2) {
                            let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == -3) {
                            let errData = {"order": "ترتیب سطح نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            if(level.avatarUrl== undefined){
                                level.avatarUrl = ""
                            }
                            var unlinkPath = level.avatarUrl.replace(`${config.downloadPathLevelImage}`, `${config.uploadPathLevelImage}`);
                            fs.unlink(unlinkPath, function (err) {
                                try{
                                    if (req.files.file != null) {
                                        req.body._id = level._id
                                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                        var file = req.files.file.name.replace(`.${extension}`, '');
                                        var newFile = new Date().getTime() + '.' + extension;
                                        // path is Upload Directory
                                        var dir = `${config.uploadPathLevelImage}/${req.body._id}/`;
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
                                                    req.body.avatarUrl = path.replace(`${config.uploadPathLevelImage}`, `${config.downloadPathLevelImage}`)
                                                    // var newLevel = Object.assign(req.body, level)
                                                    var newLevel = Object.assign({}, level, req.body)
                                                    database.updateLevel(newLevel, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                                        else if (result == -2) {
                                                            let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                                                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (result == -3) {
                                                            let errData = {"order": "ترتیب سطح نمیتواند تکراری باشد"}
                                                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
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
                                catch(e){
                                    console.log(e)
                                }
                                   
                                
                            })
                        }
                    })

                } else {
                    if (req.body.order != undefined && typeof req.body.order == "string") {
                        req.body.order = parseInt(req.body.order)
                    }
                    var newLevel = Object.assign({}, level, req.body)
                    database.updateLevel(newLevel, level._id, (result)=> {
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
                        else if (result == -2) {
                            let errData = {"title": "نام سطح نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == -3) {
                            let errData = {"order": "ترتیب سطح نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
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
            }
        })
    }
});

router.delete('/:lvlId', (req, res)=> {
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
            if (level.avatarUrl != undefined || level.avatarUrl != null) {
                var unlinkPath = level.avatarUrl.replace(`${config.downloadPathLevelImage}`, `${config.uploadPathLevelImage}`);
                fs.unlink(unlinkPath, function (err) {
                    try{
                        database.delLevel(req.params.lvlId, (delResult)=> {
                            if (delResult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (delResult == 0) {
                                response.respondNotFound('سطح مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (delResult == -3) {
                                response.validation('سطح قابل حذف شدن نیست.', {}, 'hasLesson', (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                response.respondDeleted('اطلاعات با موفقیت حذف شد.', delResult, (result)=> {
                                    res.json(result)

                                })
                            }
                        })
                    }
                    catch(e){
                        console.log(e)
                    }
                    
                })
            }
            else {
                database.delLevel(req.params.lvlId, (delResult)=> {
                    if (delResult == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (delResult == 0) {
                        response.respondNotFound('سطح مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (delResult == -3) {
                        response.validation('سطح قابل حذف شدن نیست.', {}, 'hasLesson', (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        response.respondDeleted('اطلاعات با موفقیت حذف شد.', delResult, (result)=> {
                            res.json(result)

                        })
                    }
                })
            }
        }
    })
});

router.get('/selective', (req, res)=> {
    database.getLevels((level)=> {
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
            let temp = []

            for (var i = 0; i < level.length; i++) {
                temp[i] = {}
                temp[i].label = level[i].title;
                temp[i].value = level[i]._id
            }
            response.response('اطلاعات همه ی سطحها', temp, (result)=> {
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