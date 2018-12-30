var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let config = require('../util/config');
let fse = require('fs-extra');
let fs = require('fs');
let response = require('../util/responseHelper')
const ajv = require("ajv")({
    removeAdditional: true,
    $data: true,
    verbose: true,
    allErrors: true
});
var normalise = require('ajv-error-messages');
const translate = require('google-translate-api');
var ffmpeg = require('ffmpeg');
let jwt = require('../util/jwtHelper')


const lesson = {
    type: "object",
    properties: {
        lvlId: {type: "string"},
        title: {type: "string"},
        order: {type: "string"},
        description:{type:"string"},
        deadline:{type:"string"}
    },
    required: ["lvlId", "title", "order"],
    additionalProperties: false
};
const type = {
    type: "object",
    properties: {
        title: {type: "string"},
    },
    required: ["title"],
    additionalProperties: false
};
const video = {
    type: "object",
    properties: {
        title: {type: "string"},
        typeId: {type: "string"},
        lsnId: {type: "string"},
        order: {type: "string"},
    },
    required: ["typeId", "lsnId", "order"],
    additionalProperties: false
};
const sound = {
    type: "object",
    properties: {
        title: {type: "string"},
        typeId: {type: "string"},
        lsnId: {type: "string"},
        order: {type: "string"},
    },
    required: ["typeId", "lsnId", "order"],
    additionalProperties: false
};


router.post('/', (req, res) => {
    let valid = ajv.validate(lesson, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == lvlId) {
                errorData = {"lvlId": ["وارد کردن شناسه ی سطح ضروری است."]}
            } else if (Data == "order") {
                errorData = {"order": ["وارد کردن  ترتیب سطح ضروری است."]}
            }
            else {
                errorData = {"title": ["وارد کردن نام درس ضروری است."]}
            }
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        if (req.files) {
            if (req.body.avatarUrl == undefined) {
                req.body.avatarUrl = ""
            }
            if (req.files.file != null) {
                // type file
                database.addLesson(req.body, (lesson)=> {
                    if (lesson == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                            res.json(result)
                        })
                    }
                    else if (lesson == -3) {
                        let data = {"title": "عنوان نمیتواند تکراری باشد."}
                        response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                            res.json(result)
                        })
                    }
                    else if (lesson == -2) {
                        let data = {"order": "ترتیب نمیتواند تکراری باشد."}
                        response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        console.log(lesson)
                        req.body._id = lesson
                        // res.json(req.body)
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathLessonImage}/${req.body._id}/`;
                        console.log("dir", dir)
                        module.exports.addDir(dir, function (newPath) {
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
                                    // req.body._id = (req.body._id.replace(/"/g, ''));
                                    console.log("body", req.body)
                                    // let newLesson = Object.assign({} , lesson, req.body)
                                    database.updateLesson(req.body, req.body._id, (lesson)=> {

                                        if (lesson == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (lesson == 0) {
                                            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (lesson == -3) {
                                            let data = {"title": "عنوان نمیتواند تکراری باشد."}
                                            response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (lesson == -2) {
                                            let data = {"order": "ترتیب نمیتواند تکراری باشد."}
                                            response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            response.response('درس مورد نظر  ثبت شد .', lesson, (result)=> {
                                                res.json(result)

                                            })
                                        }
                                    });
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
            database.addLesson(req.body, (lesson)=> {
                if (lesson == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                        res.json(result)
                    })
                }
                else if (lesson == -3) {
                    let data = {"title": "عنوان نمیتواند تکراری باشد."}
                    response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                        res.json(result)
                    })
                }
                else if (lesson == -2) {
                    let data = {"order": "ترتیب نمیتواند تکراری باشد."}
                    response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.responseCreated('اطلاعات مورد نظر ثبت شد.', lesson, (result)=> {
                        res.json(result)

                    })
                }
            });
        }

    }
});

router.post('/video', (req, res) => {
    let valid = ajv.validate(video, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == "lsnId") {
                errorData = {"lsnId": ["وارد کردن شناسه ی درس ضروری است."]}
            }
            else if (Data == "typeId") {
                errorData = {"typeId": ["وارد کردن شناسه نوع ضروری است."]}
            }
            else {
                errorData = {"order": ["وارد کردن اولویت ضروری است."]}
            }
        }

        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        if (req.files) {
            if (req.files.file != null) {
                database.getLessonById(req.body.lsnId, (lesson)=> {
                    if (lesson == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })

                    }
                    else if (lesson == 0) {
                        response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })

                    }
                    else {
                        req.body.lvlId = lesson.lvlId
                        database.getVideoByLsnLvl(req.body.lvlId, req.body.lsnId, (videos)=> {
                            if (videos == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                let forbidden = false
                                for (var i = 0; i < videos.length; i++) {
                                    if (((videos[i].url.substring(videos[i].url.lastIndexOf("_") + 1)).substr(0, (videos[i].url.substring(videos[i].url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.order) {
                                        forbidden = true
                                        break;
                                    }

                                }
                                if (forbidden == true) {
                                    response.validation('اولویت فایل وجود دارد', {order: ["اولویت فایل وجود دارد"]}, 'fileOrder', (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/`;
                                    console.log("dir", dir)
                                    module.exports.addDir(dir, function (newPath) {
                                        var path = dir + newFile;
                                        req.files.file.mv(path, function (err) {
                                            if (err) {
                                                console.error(err);
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                    if (thumbResult == -1) {
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result1)=> {
                                                            res.json(result1)
                                                        })
                                                    }
                                                    else {
                                                        let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                        req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                        database.addVideo(req.body, (result)=> {
                                                            if (result == -1) {
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result1)=> {
                                                                    res.json(result1)
                                                                })
                                                            }
                                                            else {
                                                                response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                                    res.json(result1)

                                                                })
                                                            }
                                                        })
                                                    }
                                                })


                                            }

                                        })
                                    });
                                }


                            }
                        })
                    }
                })
            }
            else {
                response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                    res.json(result)
                })
            }
        }
        else {
            response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                res.json(result)
            })
        }
    }

});

router.post('/sound', (req, res) => {
    let valid = ajv.validate(sound, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == "lsnId") {
                errorData = {"lsnId": ["وارد کردن شناسه ی درس ضروری است."]}
            }
            else if (Data == "typeId") {
                errorData = {"typeId": ["وارد کردن شناسه نوع ضروری است."]}
            }
            else {
                errorData = {"order": ["وارد کردن اولویت ضروری است."]}
            }
        }

        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        if (req.files) {
            if (req.files.file != null) {
                // type file
                database.getLessonById(req.body.lsnId, (lesson)=> {
                    if (lesson == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })

                    }
                    else if (lesson == 0) {
                        response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })

                    }
                    else {
                        req.body.lvlId = lesson.lvlId
                        database.getSoundByLsnLvl(req.body.lvlId, req.body.lsnId, (sounds)=> {
                            if (sounds == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                let forbidden = false
                                for (var i = 0; i < sounds.length; i++) {
                                    if (((sounds[i].url.substring(sounds[i].url.lastIndexOf("_") + 1)).substr(0, (sounds[i].url.substring(sounds[i].url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.order) {
                                        forbidden = true
                                        break;
                                    }

                                }
                                if (forbidden == true) {
                                    response.validation('اولویت فایل وجود دارد', {order: ["اولویت فایل وجود دارد"]}, 'fileOrder', (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathSound}/${req.body.lvlId}/${req.body.lsnId}/`;
                                    console.log("dir", dir)
                                    module.exports.addDir(dir, function (newPath) {
                                        var path = dir + newFile;
                                        req.files.file.mv(path, function (err) {
                                            if (err) {
                                                console.error(err);
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                database.addSound(req.body, (result)=> {
                                                    if (result == -1) {
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result1)=> {
                                                            res.json(result1)
                                                        })
                                                    }
                                                    else {
                                                        response.responseCreated('اطلاعات با موفقیت ثبت شد.', result, (result1)=> {
                                                            res.json(result1)

                                                        })
                                                    }
                                                })
                                            }

                                        })
                                    });
                                }


                            }
                        })
                    }
                })
            }
            else {
                response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                    res.json(result)
                })
            }
        }
        else {
            response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                res.json(result)
            })
        }
    }
});

router.post('/type', (req, res)=> {
    let valid = ajv.validate(type, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            errorData = {"title": ["وارد کردن عنوان ضروری است."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        database.addType(req.body, (type)=> {
            if (type == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (type == -3) {
                let data = {"title": "عنوان نباید تکراری باشد"}
                response.validation('اطلاعات وارد شده اشتباه است.', data, 'duplicated', (result)=> {
                    res.json(result)

                })
            }
            else {
                response.responseCreated('اطلاعات مورد نظر ثبت شد.', type, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});


router.put('/:lsnId', (req, res) => {
    let valid = ajv.validate(lesson, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            errorData = {"lvlId": ["وارد کردن شناسه ی سطح ضروری است."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        database.getLessonById(req.params.lsnId, (lessons)=> {
            if (lessons == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (lessons == 0) {
                response.respondNotFound('سطح مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (req.files) {
                    let newLesson = Object.assign({}, lessons, req.body)
                    database.updateLesson(newLesson, req.params.lsnId, (lesson)=> {
                        if (lesson == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lesson == 0) {
                            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lesson == -3) {
                            let data = {"order": "ترتیب نمیتواند تکراری باشد."}
                            response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lesson == -2) {
                            let data = {"title": "عنوان نمیتواند تکراری باشد."}
                            response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            var unlinkPath = lessons.avatarUrl.replace(`${config.downloadPathLessonImage}`, `${config.uploadPathLessonImage}`);
                            fs.unlink(unlinkPath, function (err) {
                                if (err) {
                                    response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    if (req.files.file != null) {
                                        req.body._id = lessons._id
                                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                        var file = req.files.file.name.replace(`.${extension}`, '');
                                        var newFile = new Date().getTime() + '.' + extension;
                                        // path is Upload Directory
                                        var dir = `${config.uploadPathLessonImage}/${req.body._id}/`;
                                        console.log("dir", dir)
                                        module.exports.addDir(dir, function (newPath) {
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
                                                    var newLesson = Object.assign({}, lesson, req.body)
                                                    database.updateLesson(newLesson, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
                                                        if (result == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (result == 0) {
                                                            response.respondNotFound('درس مورد نظر یافت نشد', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (result == -2) {
                                                            let errData = {"title": "نام درس نمیتواند تکراری باشد"}
                                                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (result == -3) {
                                                            let errData = {"order": "ترتیب درس نمیتواند تکراری باشد"}
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
                            })
                        }
                    });

                } else {
                    let newLesson = Object.assign({}, lessons, req.body)
                    database.updateLesson(newLesson, req.params.lsnId, (lesson)=> {

                        if (lesson == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lesson == 0) {
                            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lesson == -3) {
                            let data = {"order": "ترتیب نمیتواند تکراری باشد."}
                            response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lesson == -2) {
                            let data = {"title": "عنوان نمیتواند تکراری باشد."}
                            response.validation(`اطلاعات وارد شده اشتباه است.`, data, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            response.response('درس مورد نظر تغییر یافت .', lesson, (result)=> {
                                res.json(result)

                            })
                        }
                    });
                }
            }
        })
    }
});

router.put('/video/:vdId', (req, res) => {
    let valid = ajv.validate(video, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == "lsnId") {
                errorData = {"lsnId": ["وارد کردن شناسه ی درس ضروری است."]}
            }
            else if (Data == "typeId") {
                errorData = {"typeId": ["وارد کردن شناسه نوع ضروری است."]}
            }
            else {
                errorData = {"order": ["وارد کردن اولویت ضروری است."]}
            }
        }

        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        if (req.files) {
            if (req.files.file != null || req.files.file != undefined) {
                database.getVideoByVDId(req.params.vdId, (video)=> {
                    if (video == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (video == 0) {
                        response.respondNotFound('فایل مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        var unlinkPath = video[0].url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
                        fs.unlink(unlinkPath, function (err) {
                            if (err) {
                                response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                let unlinkThumbPath = video[0].thumbUrl.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`)
                                fs.unlink(unlinkThumbPath, function (err) {
                                    if (err) {
                                        response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                            res.json(result)
                                        })
                                    }
                                    else {
                                        if (req.files.file != null) {
                                            database.getLessonById(req.body.lsnId, (lesson)=> {
                                                if (lesson == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })

                                                }
                                                else if (lesson == 0) {
                                                    response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', {}, (result)=> {
                                                        res.json(result)
                                                    })

                                                }
                                                else {
                                                    req.body.lvlId = lesson.lvlId
                                                    database.getVideoByLsnLvl(req.body.lvlId, req.body.lsnId, (videos)=> {
                                                        if (videos == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else {
                                                            let forbidden = false
                                                            for (var i = 0; i < videos.length; i++) {
                                                                if (((videos[i].url.substring(videos[i].url.lastIndexOf("_") + 1)).substr(0, (videos[i].url.substring(videos[i].url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.order) {
                                                                    if (videos[i]._id != req.params.vdId) {
                                                                        forbidden = true
                                                                        break;
                                                                    }
                                                                }

                                                            }
                                                            if (forbidden == true) {
                                                                response.validation('اولویت فایل وجود دارد', {order: ["اولویت فایل وجود دارد"]}, 'fileOrder', (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {
                                                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                                                var file = req.files.file.name.replace(`.${extension}`, '');
                                                                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                                // path is Upload Directory
                                                                var dir = `${config.uploadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/`;
                                                                module.exports.addDir(dir, function (newPath) {
                                                                    var path = dir + newFile;
                                                                    req.files.file.mv(path, function (err) {
                                                                        if (err) {
                                                                            console.error(err);
                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                                                res.json(result)
                                                                            })
                                                                        }
                                                                        else {
                                                                            req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                                            let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                            module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                                if (thumbResult == -1) {
                                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result1)=> {
                                                                                        res.json(result1)
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                                    req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                                                    var newVideo = Object.assign({}, video, req.body)
                                                                                    database.updateVideo(newVideo, req.params.vdId, (result)=> {
                                                                                        if (result == -1) {
                                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                                                                res.json(result)
                                                                                            })
                                                                                        }
                                                                                        else if (result == 0) {
                                                                                            response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                                                                                res.json(result)
                                                                                            })
                                                                                        }
                                                                                        else {
                                                                                            response.response('اطلاعات با موفقیت تغییر یافت', result, (result1)=> {
                                                                                                res.json(result1)

                                                                                            })
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })


                                                                        }

                                                                    })
                                                                });
                                                            }

                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        else {
                                            response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                                                res.json(result)
                                            })
                                        }
                                    }

                                })
                            }

                        })
                    }
                })

            }
            else {
                database.getLessonById(req.body.lsnId, (lesson)=> {
                    if (lesson == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })

                    }
                    else if (lesson == 0) {
                        response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })

                    }
                    else {
                        var newVideo = Object.assign({}, video, req.body)
                        database.updateVideo(newVideo, req.params.vdId, (result)=> {
                            if (result == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (result == 0) {
                                response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                response.response('اطلاعات با موفقیت تغییر یافت', result, (result1)=> {
                                    res.json(result1)
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            database.getVideoByVDId(req.params.vdId, (video)=> {
                if (video == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })

                }
                else if (video == 0) {
                    response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })

                }
                else {
                    var newVideo = Object.assign({}, video, req.body)
                    database.updateVideo(newVideo, req.params.vdId, (result)=> {
                        if (result == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == 0) {
                            response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            response.response('اطلاعات با موفقیت تغییر یافت', result, (result1)=> {
                                res.json(result1)
                            })
                        }
                    })
                }
            })
        }


    }

});

router.put('/sound/:sndId', (req, res) => {
    let valid = ajv.validate(sound, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == "lsnId") {
                errorData = {"lsnId": ["وارد کردن شناسه ی درس ضروری است."]}
            }
            else if (Data == "typeId") {
                errorData = {"typeId": ["وارد کردن شناسه نوع ضروری است."]}
            }
            else {
                errorData = {"order": ["وارد کردن اولویت ضروری است."]}
            }
        }

        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        if (req.files.file) {
            database.getSoundBysndId(req.params.sndId, (sound)=> {
                if (sound == 0 || sound == -1) {
                    response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    var unlinkPath = sound.url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                    fs.unlink(unlinkPath, function (err) {
                        if (err) {
                            console.log("err in unlinking", err)
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            if (req.files.file != null) {
                                // type file
                                database.getLessonById(req.body.lsnId, (lesson)=> {
                                    if (lesson == -1) {
                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                            res.json(result)
                                        })

                                    }
                                    else if (lesson == 0) {
                                        response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', {}, (result)=> {
                                            res.json(result)
                                        })

                                    } else {
                                        req.body.lvlId = lesson.lvlId
                                        database.getSoundByLsnLvl(req.body.lvlId, req.body.lsnId, (sounds)=> {
                                            if (sounds == -1) {
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                let forbidden = false
                                                for (var i = 0; i < sounds.length; i++) {
                                                    if (((sounds[i].url.substring(sounds[i].url.lastIndexOf("_") + 1)).substr(0, (sounds[i].url.substring(sounds[i].url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.order) {
                                                        if (sounds[i]._id != req.params.sndId) {
                                                            forbidden = true
                                                            break;
                                                        }
                                                    }

                                                }
                                                if (forbidden == true) {
                                                    response.validation('اولویت فایل وجود دارد', {order: ["اولویت فایل وجود دارد"]}, 'fileOrder', (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                    // path is Upload Directory
                                                    var dir = `${config.uploadPathSound}/${req.body.lvlId}/${req.body.lsnId}/`;
                                                    console.log("dir", dir)
                                                    module.exports.addDir(dir, function (newPath) {
                                                        var path = dir + newFile;
                                                        req.files.file.mv(path, function (err) {
                                                            if (err) {
                                                                console.error(err);
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {
                                                                req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                database.updateSound(req.body, req.params.sndId, (updateSound)=> {
                                                                    if (updateSound == -1) {
                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                    else if (updateSound == 0) {
                                                                        response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                    else {
                                                                        response.responseUpdated('اطلاعات با موفقیت تغییر یافت', updateSound, (result)=> {
                                                                            res.json(result)

                                                                        })
                                                                    }
                                                                })
                                                            }

                                                        })
                                                    });

                                                }
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                                    res.json(result)
                                })
                            }

                        }

                    })
                }


            })
        }
        else {
            database.updateSound(req.body, req.params.sndId, (updateSound)=> {
                if (updateSound == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (updateSound == 0) {
                    response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.responseUpdated('اطلاعات با موفقیت تغییر یافت', updateSound, (result)=> {
                        res.json(result)

                    })
                }
            })

        }
    }
});


router.get('/level/:lvlId', (req, res) => {

    database.getLessonByLvlId(req.params.lvlId, (lesson)=> {
        if (req.query.cli == 1) {
            if (lesson == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (lesson == 0) {
                response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (req.query.offset && req.query.limit) {
                    response.pagination(req.query.offset, req.query.limit, lesson, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.response('اطلاعات مورد نظر یافت شد', lesson, (result)=> {
                        res.json(result)
                    })
                }

            }
        }
        else {
            if (lesson == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (lesson == 0) {
                response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (req.query.offset && req.query.limit) {
                    response.pagination(req.query.offset, req.query.limit, lesson, (resp)=> {
                        if(lesson.length == 1){
                            lesson = lesson[0]
                        }
                        response.response('اطلاعات مورد نظر یافت شد', lesson, (resp)=> {
                            res.json(resp)
                        })
                    })
                }
                else {
                    response.response('اطلاعات مورد نظر یافت شد', lesson, (result)=> {
                        res.json(result)
                    })
                }
            }
        }

    })
});

router.get('/:lsnId/video', (req, res) => {
    database.getVDbyLesson((video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('ویدیو مورد نظر یافت شد.', video, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/selective', (req, res)=> {
    database.getAllLessons((lesson)=> {
        if (lesson == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (lesson == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let temp = []

            for (var i = 0; i < lesson.length; i++) {
                temp[i] = {}
                temp[i].label = lesson[i].title;
                temp[i].value = lesson[i]._id
                console.log(temp)
            }
            response.response('اطلاعات همه ی درسها', temp, (result)=> {
                res.json(result)
            })

        }
    })
});

router.get('/type', (req, res)=> {
    database.getAllTypes((type)=> {
        if (type == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (type == 0) {
            response.respondNotFound('نوع مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let temp = []

            for (var i = 0; i < type.length; i++) {
                temp[i] = {}
                temp[i].label = type[i].title;
                temp[i].value = type[i]._id
                console.log(temp)
            }
            response.response('اطلاعات انواع فایل', temp, (result1)=> {
                res.json(result1)
            })

        }
    })
});

router.get('/video', (req, res)=> {
    database.getAllVideo((video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیوهای مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.paginationClient(req.query.page, req.query.limit, video, (result1)=> {
                let countPages = Math.ceil(video.length / req.query.limit)
                result1.totalPage = countPages
                response.response('اطلاعات همه ی ویدیوها', result1, (result)=> {
                    res.json(result)
                })
            })
        }
    })
});

router.get('/video/:vdId', (req, res)=> {
    database.getVideoByVDId(req.params.vdId, (video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیوهای مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات ویدیو', video[0], (result)=> {
                res.json(result)
            })

        }
    })
});

router.get('/:lsnId', (req, res) => {
    database.getLessonById(req.params.lsnId, (lesson)=> {
        if (lesson == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (lesson == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('درس مورد نظر یافت شد.', lesson, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/:lsnId/sound', (req, res) => {
    database.getSndByLsn((sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('وویس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('وویس مورد نظر یافت شد.', sound, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/:lsnId/video/:lvlId', (req, res)=> {
    database.getVideoByLsnLvl(req.params.lvlId, req.params.lsnId, (video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('ویدیو مورد نظر یافت شد.', video, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/:lsnId/sound/:lvlId', (req, res)=> {
    database.getSoundByLsnLvl(req.params.lvlId, req.params.lsnId, (sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('وویس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('وویس مورد نظر یافت شد.', sound, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    database.getAllLessons((sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.paginationClient(req.query.page, req.query.limit, sound, (result1)=> {
                let countPages = Math.ceil(sound.length / req.query.limit)
                result1.totalPage = countPages
                response.response('اطلاعات همه ی درسها', result1, (result)=> {
                    res.json(result)
                })
            })

        }
    })
});


router.delete('/:lsnId', (req, res) => {
    database.getLessonById(req.params.lsnId, (lesson)=> {
        if (lesson == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (lesson == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (lesson.avatarUrl != undefined || lesson.avatarUrl != null) {
                var unlinkPath = lesson.avatarUrl.replace(`${config.downloadPathLessonImage}`, `${config.uploadPathLessonImage}`);
                fs.unlink(unlinkPath, function (err) {
                    if (err) {
                        response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        database.delLesson(req.params.lsnId, (result)=> {
                            if (result == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (result == 0) {
                                response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (result == -2) {
                                response.validation('درس قابل حذف شدن نیست', {}, "hasSound", (result)=> {
                                    res.json(result)
                                })
                            } else if (result == -3) {
                                response.validation('درس قابل حذف شدن نیست', {}, "hasVideo", (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                response.response('درس مورد نظر حدف شد.', result, (result)=> {
                                    res.json(result)

                                })
                            }
                        })
                    }
                })
            }
            else {
                database.delLesson(req.params.lsnId, (result)=> {
                    if (result == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == 0) {
                        response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == -2) {
                        response.validation('درس قابل حذف شدن نیست', {}, "hasSound", (result)=> {
                            res.json(result)
                        })
                    } else if (result == -3) {
                        response.validation('درس قابل حذف شدن نیست', {}, "hasVideo", (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        response.response('درس مورد نظر حدف شد.', result, (result)=> {
                            res.json(result)

                        })
                    }
                })
            }
        }
    })
});

router.delete('/video/:vdId', (req, res) => {
    database.getVideoByVDId(req.params.vdId, (video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            var unlinkPath = video.url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
            fs.unlink(unlinkPath, function (err) {
                if (err) {
                    response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    let unlinkThumbPath = video.thumbUrl.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
                    fs.unlink(unlinkThumbPath, function (err) {
                        if (err) {
                            response.respondNotFound('فایلی یافت نشد', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            database.delVideo(req.params.vdId, (result)=> {
                                if (video == -1) {
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else if (video == 0) {
                                    response.respondNotFound('ویدیو مورد نظر یافت نشد.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    response.response('ویدیو مورد نظر حذف شد.', result, (result)=> {
                                        res.json(result)

                                    })
                                }
                            })

                        }
                    })
                }

            })
        }
    })
});

router.delete('/sound/:sndId', (req, res) => {
    database.getSoundBysndId(req.params.sndId, (sound)=> {
        if (sound == 0 || sound == -1) {
            response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            var unlinkPath = sound.url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
            fs.unlink(unlinkPath, function (err) {
                if (err) {
                    console.log("err in unlinking", err)
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    database.delSound(req.params.sndId, (result)=> {
                        if (result == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == 0) {
                            response.respondNotFound('ویدیو مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            response.response('فایل مورد نظر حذف شد.', result, (result)=> {
                                res.json(result)

                            })
                        }
                    })


                }

            })
        }


    })

});


module.exports = router


module.exports.addDir = function (path, cb) {
    // var pathArr = path.split('/');
    // var index = 0;
    // while (pathArr[index] != null) {
    //     var newPath = '';
    //     for (let ind_new = 0; ind_new <= index; ind_new++) {
    //         if (ind_new != 0) {
    //             newPath += '/';
    //         }
    //         newPath += pathArr[ind_new];
    //         if (!fs.existsSync(newPath)) {
    //             fs.mkdirSync(newPath);
    //         }
    //     }
    //     index++;
    //
    // }
    // cb(newPath);
    fse.ensureDir(path)
        .then(() => {
            console.log('success!')
            cb(path)
        })
        .catch(err => {
            console.error(err)
            cb(-1)
        })
};

module.exports.createVideoThumbnail = function (path, destination, fileName, cb) {
    try {
        var process = new ffmpeg(path);
        process.then(function (video) {
            video.fnExtractFrameToJPG(destination, {
                frame_rate: 1,
                number: 1,
                file_name: `${fileName}`
            }, function (error, files) {
                if (!error) {
                    console.log('Frames: ');
                    cb(1)
                }
                else {
                    console.log(error)
                    cb(-1)
                }
            });

        }, function (err) {
            console.log('Error: ' + err);
            cb(-1)
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
        cb(-1)

    }
}
