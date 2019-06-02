var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let config = require('../util/config');
let fse = require('fs-extra');
let fs = require('fs');
let response = require('../util/responseHelper')
var util = require('util')
const circJson = require('circular-json')
let moment = require('moment')
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
let _ = require('underscore')
let hashhelper = require('../util/hashHelper')
let userRoute = require('./users')
// let chatRoom = require('./chatRoom')


const lesson = {
    type: "object",
    properties: {
        lvlId: {type: "string"},
        title: {type: "string"},
        description: {type: "string"},
        commonMistake: {type: "string"},
        deadline: {type: "string"},
        order :{type:"string"}
    },
    required: ["lvlId", "title", "order"],
    additionalProperties: false
};
const type = {
    type: "object",
    properties: {
        title: {type: "string"},
        order: {type: "number"},
        category: {type: ["object", "array"]}
    },
    required: ["title", "order"],
    additionalProperties: false
};
const video = {
    type: "object",
    properties: {
        title: {type: "string"},
        typeId: {type: "string"},
        lsnId: {type: "string"},
        order: {type: "string"},
        text: {type: "string"}
    },
    required: ["typeId", "lsnId", "order"],
    additionalProperties: false
};
const file = {
    type: "object",
    properties: {
        title: {type: "string"},
        typeId: {type: "string"},
        lsnId: {type: "string"},
        description: {type: "string"},
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
        text: {type: "string"}
    },
    required: ["typeId", "lsnId", "order"],
    additionalProperties: false
};
const text = {
    type: "object",
    properties: {
        description: {type: "string"},
        typeId: {type: "string"},
        title: {type: "string"},
        lsnId: {type: "string"}
    },
    required: ["typeId", "lsnId"],
    additionalProperties: false
};
const category = {
    type: "object",
    properties: {
        title: {type: "string"},


    },
    required: ["title"],
    additionalProperties: false
};


router.post('/', (req, res) => {

    let valid = ajv.validate(lesson, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
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
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
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
                        req.body._id = lesson
                        // res.json(req.body)
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathLessonImage}/${req.body._id}/`;
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
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
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
                        lesson = lesson[0]
                        req.body.lvlId = lesson.lvlId
                        database.getVideoByLsnLvl(req.body.lvlId, req.body.lsnId, (videos)=> {
                            if (videos == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                if (videos == 0) {
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
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                if (req.files.srt) {
                                                    var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                                                    var file = req.files.srt.name.replace(`.${extension}`, '');
                                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                    // path is Upload Directory
                                                    var srtDir = `${config.uploadPathVideo}/srt/${req.body.lvlId}/${req.body.lsnId}/`;
                                                    // console.log("dir", dir)
                                                    module.exports.addDir(srtDir, function (newPath) {
                                                        var srtPath = srtDir + newFile;
                                                        req.files.srt.mv(srtPath, function (err) {
                                                            if (err) {
                                                                console.error(err);
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {
                                                                req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                                req.body.srtUrl = srtPath.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)

                                                                let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                    if (thumbResult == -1) {
                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                            res.json(result1)
                                                                        })
                                                                    }
                                                                    else {
                                                                        let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                        req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                                        database.addVideo(req.body, (result)=> {
                                                                            if (result == -1) {
                                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                    res.json(result1)
                                                                                })
                                                                            }
                                                                            else {
                                                                                let info = {}
                                                                                info.video = {
                                                                                    vdId: result,
                                                                                    viewed: false
                                                                                }
                                                                                database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                                    response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                                                        res.json(result1)

                                                                                    })
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    });
                                                }
                                                else {
                                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                    req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                    let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                    module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                        if (thumbResult == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                res.json(result1)
                                                            })
                                                        }
                                                        else {
                                                            let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                            req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                            database.addVideo(req.body, (result)=> {
                                                                if (result == -1) {
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                        res.json(result1)
                                                                    })
                                                                }
                                                                else {
                                                                    let info = {}
                                                                    info.video = {
                                                                        vdId: result,
                                                                        viewed: false
                                                                    }
                                                                    database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                        response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                                            res.json(result1)

                                                                        })
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }


                                            }

                                        })
                                    });


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
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    if (req.files.srt) {
                                                        var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                                                        var file = req.files.srt.name.replace(`.${extension}`, '');
                                                        var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                        // path is Upload Directory
                                                        var srtDir = `${config.uploadPathVideo}/srt/${req.body.lvlId}/${req.body.lsnId}/`;
                                                        // console.log("dir", dir)
                                                        module.exports.addDir(srtDir, function (newPath) {
                                                            var srtPath = srtDir + newFile;
                                                            req.files.srt.mv(srtPath, function (err) {
                                                                if (err) {
                                                                    console.error(err);
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {
                                                                    req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                                    req.body.srtUrl = srtPath.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)

                                                                    let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                    module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                        if (thumbResult == -1) {
                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                res.json(result1)
                                                                            })
                                                                        }
                                                                        else {
                                                                            let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                            req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                                            database.addVideo(req.body, (result)=> {
                                                                                if (result == -1) {
                                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                        res.json(result1)
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    let info = {}
                                                                                    info.video = {
                                                                                        vdId: result,
                                                                                        viewed: false
                                                                                    }
                                                                                    database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                                        response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                                                            res.json(result1)

                                                                                        })
                                                                                    })
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        });
                                                    }
                                                    else {
                                                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                                        var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                        req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                        let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                        module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                            if (thumbResult == -1) {
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                    res.json(result1)
                                                                })
                                                            }
                                                            else {
                                                                let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                                database.addVideo(req.body, (result)=> {
                                                                    if (result == -1) {
                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                            res.json(result1)
                                                                        })
                                                                    }
                                                                    else {
                                                                        let info = {}
                                                                        info.video = {
                                                                            vdId: result,
                                                                            viewed: false
                                                                        }
                                                                        database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                            response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                                                res.json(result1)

                                                                            })
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }


                                                }

                                            })
                                        });
                                    }
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

router.post('/file', (req, res)=> {
    let valid = ajv.validate(file, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
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
                        lesson = lesson[0]
                        req.body.lvlId = lesson.lvlId
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathVipFile}/${req.body.lvlId}/${req.body.lsnId}/`;
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
                                    req.body.url = path.replace(`${config.uploadPathVipFile}`, `${config.downloadPathVipFile}`)

                                    database.addFile(req.body, (result)=> {
                                        if (result == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                res.json(result1)
                                            })
                                        }
                                        else {
                                            response.responseCreated('فایل با موفقیت ثبت شد.', result, (result1)=> {
                                                res.json(result1)

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
                        lesson = lesson[0]
                        req.body.lvlId = lesson.lvlId
                        database.getSoundByLsnLvl(req.body.lvlId, req.body.lsnId, (sounds)=> {
                            if (sounds == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                if (sounds == 0) {
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
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                if (req.files.pic) {
                                                    var extension = req.files.pic.name.substring(req.files.pic.name.lastIndexOf('.') + 1).toLowerCase();
                                                    var file = req.files.pic.name.replace(`.${extension}`, '');
                                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                    // path is Upload Directory
                                                    var CoverDir = `${config.uploadPathSound}/cover/${req.body.lvlId}/${req.body.lsnId}/`;
                                                    console.log("dir", dir)
                                                    module.exports.addDir(CoverDir, function (newPath) {
                                                        var Coverpath = CoverDir + newFile;
                                                        req.files.pic.mv(Coverpath, function (err) {
                                                            if (err) {
                                                                console.error(err);
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {
                                                                req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                req.body.coverUrl = Coverpath.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                database.addSound(req.body, (result)=> {
                                                                    if (result == -1) {
                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                            res.json(result1)
                                                                        })
                                                                    }
                                                                    else {
                                                                        let info = {}
                                                                        info.sound = {
                                                                            sndId: result,
                                                                            viewed: false
                                                                        }
                                                                        database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                            response.responseCreated('صدا با موفقیت ثبت شد.', result, (result1)=> {
                                                                                res.json(result1)

                                                                            })
                                                                        })
                                                                    }

                                                                })
                                                            }

                                                        })
                                                    });
                                                }
                                                else {
                                                    req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                    req.body.coverUrl = ""
                                                    database.addSound(req.body, (result)=> {
                                                        if (result == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                res.json(result1)
                                                            })
                                                        }
                                                        else {
                                                            let info = {}
                                                            info.sound = {
                                                                sndId: result,
                                                                viewed: false
                                                            }
                                                            database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                response.responseCreated('صدا با موفقیت ثبت شد.', result, (result1)=> {
                                                                    res.json(result1)

                                                                })
                                                            })
                                                        }

                                                    })
                                                }

                                            }
                                        })
                                    });


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
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    if (req.files.pic) {
                                                        var extension = req.files.pic.name.substring(req.files.pic.name.lastIndexOf('.') + 1).toLowerCase();
                                                        var file = req.files.pic.name.replace(`.${extension}`, '');
                                                        var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                        // path is Upload Directory
                                                        var CoverDir = `${config.uploadPathSound}/cover/${req.body.lvlId}/${req.body.lsnId}/`;
                                                        console.log("dir", dir)
                                                        module.exports.addDir(CoverDir, function (newPath) {
                                                            var Coverpath = CoverDir + newFile;
                                                            req.files.pic.mv(Coverpath, function (err) {
                                                                if (err) {
                                                                    console.error(err);
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {
                                                                    req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                    req.body.coverUrl = Coverpath.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                    database.addSound(req.body, (result)=> {
                                                                        if (result == -1) {
                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                res.json(result1)
                                                                            })
                                                                        }
                                                                        else {
                                                                            let info = {}
                                                                            info.sound = {
                                                                                sndId: result,
                                                                                viewed: false
                                                                            }
                                                                            database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                                response.responseCreated('صدا با موفقیت ثبت شد.', result, (result1)=> {
                                                                                    res.json(result1)

                                                                                })
                                                                            })
                                                                        }

                                                                    })
                                                                }

                                                            })
                                                        });
                                                    }
                                                    else {
                                                        req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                        req.body.coverUrl = ""
                                                        database.addSound(req.body, (result)=> {
                                                            if (result == -1) {
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                    res.json(result1)
                                                                })
                                                            }
                                                            else {
                                                                let info = {}
                                                                info.sound = {
                                                                    sndId: result,
                                                                    viewed: false
                                                                }
                                                                database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                    response.responseCreated('صدا با موفقیت ثبت شد.', result, (result1)=> {
                                                                        res.json(result1)

                                                                    })
                                                                })
                                                            }

                                                        })
                                                    }

                                                }
                                            })
                                        });
                                    }
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
    // req.body.order = 5
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
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (type == -3) {
                let data = {"title": "عنوان نباید تکراری باشد"}
                response.validation('اطلاعات وارد شده اشتباه است.', data, 'duplicated', (result)=> {
                    res.json(result)

                })
            }
            else if (type == -2) {
                let data = {"order": "ترتیب نباید تکراری باشد"}
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

router.post('/category', (req, res)=> {
    let valid = ajv.validate(category, req.body);
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
        database.addCategory(req.body, (type)=> {
            if (type == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
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

router.post('/text', (req, res)=> {
    let valid = ajv.validate(text, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            if (Data == "lsnId")
                errorData = {"lesson": ["وارد کردن درس ضروری است."]}
            else if (Data == "typeId")
                errorData = {"type": ["وارد کردن نوع ضروری است."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        database.addText(req.body, (text)=> {
            if (text == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                response.responseCreated('اطلاعات مورد نظر ثبت شد.', text, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.post('/note', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            req.body.usrId = student[0]._id
            database.addNote(req.body, (text)=> {
                if (text == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    req.body._id = text
                    response.responseCreated('اطلاعات مورد نظر ثبت شد.', req.body, (result)=> {
                        res.json(result)

                    })
                }
            })
        }
    })

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
                lessons = lessons[0]
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
                            if (lessons.avatarUrl != null) {
                                var unlinkPath = lessons.avatarUrl.replace(`${config.downloadPathLessonImage}`, `${config.uploadPathLessonImage}`);
                                fs.unlink(unlinkPath, function (err) {
                                    try {
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
                                    catch (e) {
                                        console.log(e)
                                    }


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
            if (req.files.file != null) {
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
                        video = video[0]
                        if (video.url == undefined) {
                            video.url = ""
                        }
                        var unlinkPath = video.url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {
                                let unlinkThumbPath = video.thumbUrl.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`)
                                fs.unlink(unlinkThumbPath, function (err) {
                                    try {
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
                                                    lesson = lesson[0]

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
                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                                res.json(result)
                                                                            })
                                                                        }
                                                                        else {

                                                                            req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                                            if (req.files.srt) {
                                                                                if (video.srtUrl == undefined) {
                                                                                    video.srtUrl = ""
                                                                                }
                                                                                var unlinkPath = video.srtUrl.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
                                                                                fs.unlink(unlinkPath, function (err) {
                                                                                    try {
                                                                                        var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                                                                                        var file = req.files.srt.name.replace(`.${extension}`, '');
                                                                                        var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                                                        // path is Upload Directory
                                                                                        var srtDir = `${config.uploadPathVideo}/srt/${req.body.lvlId}/${req.body.lsnId}/`;
                                                                                        // console.log("dir", dir)
                                                                                        module.exports.addDir(srtDir, function (newPath) {
                                                                                            var srtPath = srtDir + newFile;
                                                                                            req.files.srt.mv(srtPath, function (err) {
                                                                                                if (err) {
                                                                                                    console.error(err);
                                                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                                                        res.json(result)
                                                                                                    })
                                                                                                }
                                                                                                else {
                                                                                                    req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                                                                    req.body.srtUrl = srtPath.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)

                                                                                                    let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                                                    module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                                                        if (thumbResult == -1) {
                                                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                                                res.json(result1)
                                                                                                            })
                                                                                                        }
                                                                                                        else {
                                                                                                            let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                                                            req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                                                                                            var newVideo = Object.assign({}, video, req.body)

                                                                                                            database.updateVideo(newVideo, req.params.vdId, (result)=> {
                                                                                                                if (result == -1) {
                                                                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                                                        res.json(result1)
                                                                                                                    })
                                                                                                                }
                                                                                                                else {
                                                                                                                    let info = {}

                                                                                                                    info.video = {
                                                                                                                        vdId: result,
                                                                                                                        viewed: false
                                                                                                                    }
                                                                                                                    database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                                                                                        response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                                                                                            res.json(result1)

                                                                                                                        })
                                                                                                                    })
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })
                                                                                        });
                                                                                    }
                                                                                    catch (e) {
                                                                                        console.log(e)
                                                                                    }
                                                                                })

                                                                            }
                                                                            else {
                                                                                let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                                module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                                    if (thumbResult == -1) {
                                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                            res.json(result1)
                                                                                        })
                                                                                    }
                                                                                    else {
                                                                                        let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                                        req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
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
                                                                                                response.response('اطلاعات با موفقیت تغییر یافت', req.body, (result1)=> {
                                                                                                    res.json(result1)

                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
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
                                    catch (e) {
                                        console.log(e)
                                    }
                                })
                            }
                            catch (e) {
                                console.log(e)
                            }
                        })
                    }
                })

            }
            else if (req.files.srt) {
                if (video.srtUrl == undefined) {
                    video.srtUrl = ""
                }
                var unlinkPath = video.srtUrl.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
                fs.unlink(unlinkPath, function (err) {
                    try {
                        var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.srt.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                        // path is Upload Directory
                        var srtDir = `${config.uploadPathVideo}/srt/${req.body.lvlId}/${req.body.lsnId}/`;
                        // console.log("dir", dir)
                        module.exports.addDir(srtDir, function (newPath) {
                            var srtPath = srtDir + newFile;
                            req.files.srt.mv(srtPath, function (err) {
                                if (err) {
                                    console.error(err);
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                    req.body.srtUrl = srtPath.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)

                                    let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                    module.exports.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                        if (thumbResult == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                res.json(result1)
                                            })
                                        }
                                        else {
                                            let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                            req.body.thumbUrl = `${config.downloadPathVideo}/${req.body.lvlId}/${req.body.lsnId}/${thumbFileNew}`
                                            var newVideo = Object.assign({}, video, req.body)
                                            database.updateVideo(newVideo, req.params.vdId, (result)=> {
                                                if (result == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                        res.json(result1)
                                                    })
                                                }
                                                else {
                                                    let info = {}

                                                    info.video = {
                                                        vdId: result,
                                                        viewed: false
                                                    }
                                                    database.updateViewToInsert(info, req.body.lsnId, (UpdateViewResult)=> {
                                                        response.responseCreated('ویدیو با موفقیت ثبت شد.', result, (result1)=> {
                                                            res.json(result1)

                                                        })
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        });
                    }
                    catch (e) {
                        console.log(e)
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
                        lesson = lesson[0]

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
                                response.response('اطلاعات با موفقیت تغییر یافت', req.body, (result1)=> {
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
                console.log(video)
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
                    video = video[0]

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
                            response.response('اطلاعات با موفقیت تغییر یافت', video, (result1)=> {
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
    logger.info("body in updateSound", req.body)
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
            database.getSoundBysndId(req.params.sndId, (sound)=> {
                if (sound == 0 || sound == -1) {
                    response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.files.file) {
                        if (sound[0].url == undefined) {
                            sound[0].url = ""
                        }
                        var unlinkPath = sound[0].url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {
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
                                            lesson = lesson[0]

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
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {
                                                                    if (req.files.pic) {
                                                                        if (sound[0].coverUrl == undefined) {
                                                                            sound[0].coverUrl = ""
                                                                        }
                                                                        var unlinkPath = sound[0].coverUrl.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                                                                        fs.unlink(unlinkPath, function (err) {
                                                                            try {
                                                                                // type file
                                                                                var extension = req.files.pic.name.substring(req.files.pic.name.lastIndexOf('.') + 1).toLowerCase();
                                                                                var file = req.files.pic.name.replace(`.${extension}`, '');
                                                                                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                                                // path is Upload Directory
                                                                                var CoverDir = `${config.uploadPathSound}/cover/${req.body.lvlId}/${req.body.lsnId}/`;
                                                                                module.exports.addDir(CoverDir, function (newPath) {
                                                                                    var Coverpath = CoverDir + newFile;
                                                                                    req.files.pic.mv(Coverpath, function (err) {
                                                                                        if (err) {
                                                                                            console.error(err);
                                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                                                res.json(result)
                                                                                            })
                                                                                        }
                                                                                        else {
                                                                                            req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                                            req.body.coverUrl = Coverpath.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                                            let newSound = Object.assign({}, sound[0], req.body)
                                                                                            database.updateSound(newSound, req.params.sndId, (result)=> {
                                                                                                if (result == -1) {
                                                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
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
                                                                            catch (e) {
                                                                                console.log(e)
                                                                            }

                                                                        })
                                                                    }
                                                                    else {
                                                                        req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                                        database.getSoundBysndId(req.params.sndId, (getSoundResult)=> {
                                                                            if (getSoundResult == -1) {
                                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                                    res.json(result)
                                                                                })
                                                                            }
                                                                            else if (getSoundResult == 0) {
                                                                                response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                                                                                    res.json(result)
                                                                                })
                                                                            }
                                                                            else {
                                                                                let newSound = Object.assign({}, getSoundResult[0], req.body)
                                                                                database.updateSound(newSound, req.params.sndId, (updateSound)=> {
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
                                                                    }

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
                            catch (e) {
                                console.log(e)
                            }

                        })
                    }
                    else if (req.files.pic) {
                        if (sound[0].coverUrl == undefined) {
                            sound[0].coverUrl = ""
                        }
                        var unlinkPath = sound[0].coverUrl.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {
                                // type file
                                var extension = req.files.pic.name.substring(req.files.pic.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.pic.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                // path is Upload Directory
                                var CoverDir = `${config.uploadPathSound}/cover/${req.body.lvlId}/${req.body.lsnId}/`;
                                // console.log("dir", dir)
                                module.exports.addDir(CoverDir, function (newPath) {
                                    var Coverpath = CoverDir + newFile;
                                    req.files.pic.mv(Coverpath, function (err) {
                                        if (err) {
                                            console.error(err);
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            // req.body.url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                            req.body.coverUrl = Coverpath.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                            let newSound = Object.assign({}, sound[0], req.body)
                                            database.updateSound(newSound, req.params.sndId, (result)=> {
                                                if (result == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
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
                            catch (e) {
                                console.log(e)
                            }

                        })
                    }

                }


            })
        }
        else {
            database.getSoundBysndId(req.params.sndId, (getSoundResult)=> {
                if (getSoundResult == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (getSoundResult == 0) {
                    response.respondNotFound('صدای مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    let newSound = Object.assign({}, getSoundResult[0], req.body)
                    database.updateSound(newSound, req.params.sndId, (updateSound)=> {
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

        }
    }
});

router.put('/text/:txtId', (req, res)=> {
    let valid = ajv.validate(text, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            if (Data == "lsnId")
                errorData = {"lesson": ["وارد کردن درس ضروری است."]}
            else if (Data == "typeId")
                errorData = {"type": ["وارد کردن نوع ضروری است."]}
        }
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    }
    else {
        database.updateText(req.body, req.params.txtId, (text)=> {
            if (text == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                response.responseCreated('اطلاعات مورد نظر ویرایش شد.', req.body, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.put('/note/:ntId', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            req.body.usrId = student[0]._id
            database.updateNote(req.body, req.params.ntId, (text)=> {
                if (text == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.responseCreated('اطلاعات مورد نظر ویرایش شد.', text, (result)=> {
                        res.json(result)

                    })
                }
            })
        }
    })

});

router.put('/file/:flId', (req, res)=> {
    let valid = ajv.validate(file, req.body);
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
                database.getFileById(req.params.flId, (video)=> {
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
                        if (video.url == undefined) {
                            video.url = ""
                        }
                        var unlinkPath = video.url.replace(`${config.downloadPathVipFile}`, `${config.uploadPathVipFile}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {

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
                                            lesson = lesson[0]
                                            req.body.lvlId = lesson.lvlId

                                            var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                            var file = req.files.file.name.replace(`.${extension}`, '');
                                            var newFile = new Date().getTime() + '.' + extension;
                                            // path is Upload Directory
                                            var dir = `${config.uploadPathVipFile}/${req.body.lvlId}/${req.body.lsnId}/`;
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
                                                        req.body.url = path.replace(`${config.uploadPathVipFile}`, `${config.downloadPathVipFile}`)
                                                        database.updateFile(req.body, req.params.flId, (result)=> {
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
                                                                response.response('اطلاعات با موفقیت تغییر یافت', req.body, (result1)=> {
                                                                    res.json(result1)

                                                                })
                                                            }
                                                        })

                                                    }

                                                })
                                            });

                                        }
                                    })
                                }

                            }
                            catch (e) {
                                console.log(e)
                            }
                        })
                    }
                })
            }
            else {

                database.updateFile(req.body, req.params.flId, (result)=> {
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
                        response.response('اطلاعات با موفقیت تغییر یافت', req.body, (result1)=> {
                            res.json(result1)
                        })
                    }
                })


            }
        }
        else {
            database.updateFile(req.body, req.params.flId, (result)=> {
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

                }
            )
        }


    }
})
;


router.get('/level/:lvlId', (req, res) => {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == -1) {
            response.respondNotFound(' مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else if (student == 0) {
            database.getLessonByLvlId(req.params.lvlId, (lessons)=> {
                if (lessons == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (lessons == 0) {
                    response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                        res.json(result)
                    })
                }
                else {
                    // if (req.query.offset && req.query.limit) {
                    //     response.pagination(req.query.offset, req.query.limit, lessons, (result)=> {
                    //         res.json(result)
                    //     })
                    // }
                    // else {
                    response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                        res.json(result)
                    })
                    // }

                }
            })

        }
        else {
            let usrId = student[0]._id
            database.checkPaid(usrId, (checkPaid)=> {
                database.getResultUsr(usrId, (resultOfUser)=> {
                    if (resultOfUser == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (resultOfUser == 0) {
                        response.respondNotFound(' مورد نظر یافت نشد.', [], (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        database.getLessonByLvlId(req.params.lvlId, (lessons)=> {
                            if (lessons == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (lessons == 0) {
                                response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                database.getViewUser(usrId, (view)=> {
                                    if (view == 0 || view == -1) {
                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                            res.json(result)
                                        })
                                    }
                                    else {
                                        let usrLsnId = view[0].lsnId
                                        if (usrLsnId == '0') {
                                            database.getFirstLesson((firstLesson)=> {
                                                if (firstLesson == 0 || firstLesson == -1) {
                                                }
                                                else {
                                                    let updateInfo = {}
                                                    updateInfo.lsnId = firstLesson._id
                                                    if (checkPaid) {
                                                        for (var i = 0; i < lessons.length; i++) {
                                                            lessons[i].status = "locked"
                                                            for (var k = 0; k < view.length; k++) {
                                                                if (lessons[i]._id == resultOfUser[k].lsnId) {
                                                                    lessons[i].status = "passed"
                                                                }
                                                                if (lessons[i]._id == resultOfUser[resultOfUser.length - 1].lsnId) {
                                                                    lessons[i].status = "current"

                                                                }
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        for (var i = 0; i < lessons.length; i++) {
                                                            lessons[i].status = "locked"
                                                            if (lessons[i]._id == resultOfUser[0].lsnId) {
                                                                lessons[i].status = "first"
                                                            }
                                                        }

                                                    }
                                                    if (req.query.cli == 1) {
                                                        if (lessons == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (lessons == 0) {
                                                            response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else {
                                                            if (req.query.offset && req.query.limit) {
                                                                response.pagination(req.query.offset, req.query.limit, lessons, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {
                                                                response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }

                                                        }
                                                    }
                                                    else {
                                                        if (lessons == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (lessons == 0) {
                                                            response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else {

                                                            if (req.query.offset && req.query.limit) {
                                                                response.pagination(req.query.offset, req.query.limit, lessons, (resp)=> {
                                                                    response.response('اطلاعات مورد نظر یافت شد', lessons, (resp)=> {
                                                                        res.json(resp)
                                                                    })
                                                                })
                                                            }
                                                            else {
                                                                response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                        }
                                                    }


                                                }
                                            })
                                        }
                                        else {
                                            database.getResultUsrLsn(usrId, usrLsnId, (resultInfo)=> {
                                                if (resultInfo == -1 || resultInfo == 0) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    if (resultInfo.timePassed != "0") {
                                                        if (typeof resultInfo.timePassed == 'string')
                                                            resultInfo.timePassed = parseInt(resultInfo.timePassed)
                                                        let pass = moment(resultInfo.timePassed).add(24, 'h').format('x')
                                                        let currentTime = new Date().getTime()
                                                        var examPermissionPassLessonNO = false
                                                        if(resultInfo.examTimePassed !="0"){
                                                            if (typeof resultInfo.examTimePassed == 'string')
                                                                resultInfo.examTimePassed = parseInt(resultInfo.examTimePassed)
                                                            let passExam = moment(resultInfo.examTimePassed).add(24, 'h').format('x')
                                                            let currentTimeExam = new Date().getTime()
                                                           examPermissionPassLessonNO = (currentTimeExam < passExam)
                                                        }
                                                        if (currentTime < pass || examPermissionPassLessonNO ) {
                                                            if (checkPaid) {
                                                                for (var i = 0; i < lessons.length; i++) {
                                                                    lessons[i].status = "locked"
                                                                    for (var k = 0; k < resultOfUser.length; k++) {
                                                                        if (lessons[i]._id == resultOfUser[k].lsnId) {
                                                                            lessons[i].status = "passed"

                                                                        }
                                                                        if (lessons[i]._id == resultOfUser[resultOfUser.length - 1].lsnId) {
                                                                            lessons[i].status = "locked"

                                                                        }
                                                                    }

                                                                }

                                                            }
                                                            else {
                                                                for (var i = 0; i < lessons.length; i++) {
                                                                    lessons[i].status = "locked"
                                                                    if (lessons[i]._id == resultOfUser[0].lsnId) {
                                                                        lessons[i].status = "first"
                                                                    }

                                                                }

                                                            }
                                                            if (req.query.cli == 1) {
                                                                if (lessons == -1) {
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else if (lessons == 0) {
                                                                    response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {
                                                                    if (req.query.offset && req.query.limit) {
                                                                        response.pagination(req.query.offset, req.query.limit, lessons, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                    else {
                                                                        response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }

                                                                }
                                                            }
                                                            else {
                                                                if (lessons == -1) {
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else if (lessons == 0) {
                                                                    response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {

                                                                    if (req.query.offset && req.query.limit) {
                                                                        response.pagination(req.query.offset, req.query.limit, lessons, (resp)=> {
                                                                            response.response('اطلاعات مورد نظر یافت شد', lessons, (resp)=> {
                                                                                res.json(resp)
                                                                            })
                                                                        })
                                                                    }
                                                                    else {
                                                                        response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            if(checkPaid){
                                                                for (var i = 0; i < lessons.length; i++) {
                                                                    lessons[i].status = "locked"
                                                                    for (var k = 0; k < resultOfUser.length; k++) {
                                                                        if (lessons[i]._id == resultOfUser[resultOfUser.length - 1].lsnId) {
                                                                            lessons[i].status = "current"
                                                                            if (lessons[i]._id == resultOfUser[k].lsnId) {
                                                                                lessons[i].status = "passed"

                                                                            }
                                                                        }
                                                                    }

                                                                }

                                                            }
                                                            else{
                                                                for (var i = 0; i < lessons.length; i++) {
                                                                    lessons[i].status = "locked"
                                                                    for (var k = 0; k < resultOfUser.length; k++) {
                                                                        if (lessons[i]._id == resultOfUser[resultOfUser.length - 1].lsnId) {
                                                                            lessons[i].status = "locked"
                                                                            if (lessons[i]._id == resultOfUser[k].lsnId) {
                                                                                lessons[i].status = "passed"

                                                                            }
                                                                        }
                                                                    }

                                                                }

                                                            }

                                                            if (req.query.cli == 1) {
                                                                if (lessons == -1) {
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else if (lessons == 0) {
                                                                    response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {
                                                                    if (req.query.offset && req.query.limit) {
                                                                        response.pagination(req.query.offset, req.query.limit, lessons, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                    else {
                                                                        response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }

                                                                }
                                                            }
                                                            else {
                                                                if (lessons == -1) {
                                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else if (lessons == 0) {
                                                                    response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {

                                                                    if (req.query.offset && req.query.limit) {
                                                                        response.pagination(req.query.offset, req.query.limit, lessons, (resp)=> {
                                                                            response.response('اطلاعات مورد نظر یافت شد', lessons, (resp)=> {
                                                                                res.json(resp)
                                                                            })
                                                                        })
                                                                    }
                                                                    else {
                                                                        response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        logger.info("checkPaid", checkPaid)
                                                        if (checkPaid) {
                                                            for (var i = 0; i < lessons.length; i++) {
                                                                lessons[i].status = "locked"
                                                                for (var k = 0; k < resultOfUser.length; k++) {
                                                                    if (lessons[i]._id == resultOfUser[k].lsnId) {
                                                                        lessons[i].status = "passed"

                                                                    }
                                                                    if (lessons[i]._id == resultOfUser[resultOfUser.length - 1].lsnId) {
                                                                        lessons[i].status = "current"

                                                                    }
                                                                }

                                                            }

                                                        }
                                                        else {
                                                            for (var i = 0; i < lessons.length; i++) {
                                                                lessons[i].status = "locked"
                                                                if (lessons[i]._id == resultOfUser[0].lsnId) {
                                                                    lessons[i].status = "first"
                                                                }

                                                            }

                                                        }
                                                        if (req.query.cli == 1) {
                                                            if (lessons == -1) {
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else if (lessons == 0) {
                                                                response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {
                                                                if (req.query.offset && req.query.limit) {
                                                                    response.pagination(req.query.offset, req.query.limit, lessons, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                                else {
                                                                    response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }

                                                            }
                                                        }
                                                        else {
                                                            if (lessons == -1) {
                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else if (lessons == 0) {
                                                                response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                                    res.json(result)
                                                                })
                                                            }
                                                            else {

                                                                if (req.query.offset && req.query.limit) {
                                                                    response.pagination(req.query.offset, req.query.limit, lessons, (resp)=> {
                                                                        response.response('اطلاعات مورد نظر یافت شد', lessons, (resp)=> {
                                                                            res.json(resp)
                                                                        })
                                                                    })
                                                                }
                                                                else {
                                                                    response.response('اطلاعات مورد نظر یافت شد', lessons, (result)=> {
                                                                        res.json(result)
                                                                    })
                                                                }
                                                            }
                                                        }
                                                    }


                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }
                })

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
                temp[i].order = type[i].order

            }
            response.response('اطلاعات انواع فایل', temp, (result1)=> {
                res.json(result1)
            })

        }
    })
});

router.get('/category', (req, res)=> {
    database.getAllCategories((type)=> {
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
            }
            response.response('اطلاعات انواع فایل', temp, (result1)=> {
                res.json(result1)
            })

        }
    })
});

router.get('/text/:txtId', (req, res)=> {
    database.getTextBytxtId(req.params.txtId, (text)=> {
        if (text == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (text == 0) {
            response.respondNotFound('متن مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            text[0].lesson = text[0].lesson[0]
            text[0].type = text[0].type[0]

            response.response('اطلاعات مورد نظر یافت شد', text[0], (result1)=> {
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
            if (req.query.lsnId) {
                let temp = []
                let k = 0
                for (var i = 0; i < video.length; i++) {
                    if (video[i].lsnId == req.query.lsnId) {
                        temp[k] = video[i]
                        k++
                    }
                }
                video = temp
            }
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

router.get('/text', (req, res)=> {
    database.getAllText((text)=> {
        if (text == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (text == 0) {
            response.respondNotFound('متن های مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.lsnId) {
                let temp = []
                let k = 0
                for (var i = 0; i < text.length; i++) {
                    if (text[i].lsnId == req.query.lsnId) {
                        temp[k] = text[i]
                        k++
                    }
                }
                text = temp
            }
            if (req.query.page) {
                response.paginationClient(req.query.page, req.query.limit, text, (result1)=> {
                    let countPages = Math.ceil(text.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی متنها', result1, (result)=> {
                        res.json(result)
                    })
                })
            }
            else {
                response.response('اطلاعات همه ی متنها', text, (result)=> {
                    res.json(result)
                })
            }

        }
    })
});

router.get('/sound', (req, res)=> {
    database.getAllSound((sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('صداهای مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.lsnId) {
                let k = 0
                let temp = []
                for (var i = 0; i < sound.length; i++) {
                    if (sound[i].lsnId == req.query.lsnId) {
                        temp[k] = sound[i]
                        k++
                    }
                }
                sound = temp
            }
            response.paginationClient(req.query.page, req.query.limit, sound, (result1)=> {
                let countPages = Math.ceil(sound.length / req.query.limit)
                result1.totalPage = countPages
                response.response('اطلاعات همه ی صداها', result1, (result)=> {
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

router.get('/sound/:sndId', (req, res)=> {
    database.getSoundBysndId(req.params.sndId, (sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('صدا مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات صدا', sound[0], (result)=> {
                res.json(result)
            })

        }
    })
});

router.get('/file/:flId', (req, res)=> {
    database.getFileById(req.params.flId, (sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('فایل مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات فایل', sound, (result)=> {
                res.json(result)
            })

        }
    })
});

router.get('/file', (req, res)=> {
    database.getAllFiles((sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('صداهای مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.lsnId) {
                let k = 0
                let temp = []
                for (var i = 0; i < sound.length; i++) {
                    if (sound[i].lsnId == req.query.lsnId) {
                        temp[k] = sound[i]
                        k++
                    }
                }
                sound = temp
            }
            if (req.query.page) {
                response.paginationClient(req.query.page, req.query.limit, sound, (result1)=> {
                    let countPages = Math.ceil(sound.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی فایلها', result1, (result)=> {
                        res.json(result)
                    })
                })
            }
            else {
                response.response('اطلاعات همه ی فایلها', sound, (result)=> {
                    res.json(result)
                })

            }

        }
    })
});

router.get('/:lsnId', (req, res) => {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == 0) {
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
                    response.response('درس مورد نظر یافت شد.', lesson[0], (result)=> {
                        res.json(result)

                    })
                }
            })

        }
        else {
            let usrId = student[0]._id
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
                    let types = []
                    for (var i = 0; i < lesson[0].video.length; i++) {
                        types.push(lesson[0].video[i].type)
                    }
                    for (var i = 0; i < lesson[0].sound.length; i++) {
                        types.push(lesson[0].sound[i].type)

                    }
                    for (var i = 0; i < lesson[0].text.length; i++) {
                        types.push(lesson[0].text[i].type)

                    }
                    for (var i = 0; i < lesson[0].downloadFile.length; i++) {
                        types.push(lesson[0].downloadFile[i].type)
                    }

                    // let index = []
                    // for (var i = 0; i < types.length; i++) {
                    //     index.push(types[i]._id)
                    // }
                    // index.sort();
                    // logger.info("index" , index)
                    // let tmp = []
                    // for (var i = 0; i < index.length; i++) {
                    //     if (index[i] == index[i + 1]) {
                    //         tmp.push(index[i])
                    //     }
                    // }
                    // for (var i = 0; i < types.length; i++) {
                    //     for (var k = 0; k < tmp.length; k++) {
                    //         if (tmp[k] == types[i]._id) {
                    //             types.splice(i, 1);
                    //         }
                    //     }
                    //
                    // }
                    // for (var i = 0; i < index.length; i++) {
                    //     if (index[i] == index[i + 1]) {
                    //         tmp.push(index[i])
                    //     }
                    // }
                    // logger.info("types" , types)
                    let typesUniquie = []

                    typesUniquie = hashhelper.arrUnique(types)
                    types = typesUniquie
                    let max = [];
                    max.push(lesson[0].video.length)
                    max.push(lesson[0].sound.length)
                    max.push(lesson[0].text.length)
                    max.push(lesson[0].downloadFile.length)
                    for (var k = 0; k < types.length; k++) {
                        types[k].video = []
                        types[k].sound = []
                        types[k].downloadFile = []
                        types[k].text = []
                    }
                    max =  Math.max.apply(null, order)
                    for (var k = 0; k < types.length; k++) {

                        for (var i = 0; i < max[max.length - 1]; i++) {
                            if (lesson[0].video[i] != undefined) {
                                if (lesson[0].video[i].typeId == types[k]._id) {
                                    types[k].video.push(lesson[0].video[i])
                                }
                            }
                            if (lesson[0].sound[i] != undefined) {
                                if (lesson[0].sound[i].typeId == types[k]._id) {
                                    types[k].sound.push(lesson[0].sound[i])
                                }
                            }
                            if (lesson[0].text[i] != undefined) {

                                if (lesson[0].text[i].typeId == types[k]._id) {
                                    types[k].text.push(lesson[0].text[i])
                                }
                            }
                            if (lesson[0].downloadFile[i] != undefined) {
                                logger.info("lesson[0.downloadFile", lesson[0].downloadFile[i].typeId)
                                logger.info("i", i)

                                logger.info("types[k]._id", types[k]._id)
                                logger.info("k", k)
                                logger.info("lesson[0].downloadFile[i].typeId==types[k]._id", lesson[0].downloadFile[i].typeId == types[k]._id)

                                if (lesson[0].downloadFile[i].typeId == types[k]._id) {
                                    types[k].downloadFile.push(lesson[0].downloadFile[i])
                                    logger.info("types[k].downloadFile", types[k].downloadFile)
                                    // logger.info("k" , k )


                                    // delete lesson[0].downloadFile[i].type
                                }
                            }

                        }
                    }
                    lesson[0].type = types
                    delete lesson[0].video
                    delete lesson[0].sound
                    delete lesson[0].text
                    delete lesson[0].downloadFile
                    database.getResultUsrLsn(usrId, req.params.lsnId, (result)=> {

                        if (result == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result != 0) {
                            logger.info("result is here ", result)
                            database.getAllTypes((typeList)=> {
                                if (typeList == -1 || typeList == 0) {
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })

                                }
                                else {
                                    database.getAllNotes(lesson[0]._id, usrId, (notes)=> {
                                        if (notes == 0 || notes == -1) {
                                            notes = []
                                        }
                                        let exam = result.exam
                                        
                                        for (var i = 0; i < typeList.length; i++) {
                                            if (typeList[i].title == "quiz") {
                                                typeList[i].quizData = result.quiz
                                                types.push(typeList[i])
                                            }
                                            // if (typeList[i].title == "exam") {
                                            //     typeList[i].examData = result.exam
                                            //     types.push(typeList[i])
                                            // }
                                            if (typeList[i].title == "note") {
                                                logger.info("here in title = note", typeList[i])
                                                typeList[i].noteData = notes
                                                types.push(typeList[i])
                                            }
                                        }
                                        if (result.timePassed != "0") {
                                            let pass = moment(result.timePassed).add(1, 'h').format('x')
                                            // let timeStamp = new Date(pass).getTime()
                                            logger.info("pass", pass)
                                            let currentTime = new Date().getTime()
                                            logger.info("cure", currentTime)

                                            if (pass > currentTime) {
                                                database.getViewUser(usrId, (view)=> {
                                                    if (view == -1) {
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                            res.json(result)
                                                        })
                                                    }
                                                    else {
                                                        lesson[0].viewPermission = false
                                                        // lesson[0].viewPermission = true
                                                        lesson[0].quizPassedTime = result.timePassed
                                                        lesson[0].examPassedTime = result.examTimePassed

                                                        lesson[0] = circJson.stringify(lesson[0])
                                                        response.response('درس مورد نظر یافت شد.', JSON.parse(lesson[0]), (result)=> {
                                                            res.json(result)

                                                        })
                                                    }
                                                })
                                            }
                                            else {
                                                database.getViewUser(usrId, (view)=> {
                                                    if (view == -1) {
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                            res.json(result)
                                                        })
                                                    }
                                                    else {
                                                        lesson[0].quizPassedTime = result.timePassed
                                                        lesson[0].examPassedTime = result.examTimePassed
                                                        if (view[0].lsnId != req.params.lsnId) {
                                                            lesson[0].viewPermission = false
                                                        }
                                                        else {
                                                            lesson[0].viewPermission = view[0].viewPermission

                                                        }
                                                        lesson[0] = circJson.stringify(lesson[0])
                                                        response.response('درس مورد نظر یافت شد.', JSON.parse(lesson[0]), (result)=> {
                                                            res.json(result)

                                                        })
                                                    }
                                                })
                                            }
                                        }
                                        else {
                                            database.getViewUser(usrId, (view)=> {
                                                if (view == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    lesson[0].quizPassedTime = result.timePassed
                                                    lesson[0].examPassedTime = result.examTimePassed

                                                    lesson[0].viewPermission = view[0].viewPermission
                                                    lesson[0] = circJson.stringify(lesson[0])
                                                    response.response('درس مورد نظر یافت شد.', JSON.parse(lesson[0]), (result)=> {
                                                        res.json(result)

                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        else {
                            database.getViewUser(usrId, (view)=> {
                                if (view == -1) {
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    lesson[0].quizPassedTime = result.timePassed
                                    lesson[0].examPassedTime = result.examTimePassed
                                    if (view[0].lsnId != req.params.lsnId) {
                                        lesson[0].viewPermission = false
                                    }
                                    else {
                                        lesson[0].viewPermission = view[0].viewPermission

                                    }
                                    lesson[0] = circJson.stringify(lesson[0])
                                    response.response('درس مورد نظر یافت شد.', JSON.parse(lesson[0]), (result)=> {
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

router.get('/:lsnId/video', (req, res)=> {
    database.getAllVideo((video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            let k = 0
            let temp = []
            for (var i = 0; i < video.length; i++) {
                if (video[i].lsnId == req.params.lsnId) {
                    temp[k] = video[i]
                }
            }
            video = temp
            response.response('ویدیو مورد نظر یافت شد.', video, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/:lsnId/file', (req, res)=> {
    database.getFileByLessonId(req.params.lsnId, (sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('فایل مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            // let k = 0
            // let temp = []
            // for (var i = 0; i < sound.length; i++) {
            //     if (sound[i].lsnId == req.params.lsnId) {
            //         temp[k] = sound[i]
            //     }
            // }
            // sound = temp
            response.response('فایل مورد نظر یافت شد.', sound, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/:lsnId/sound', (req, res)=> {
    database.getAllSound((sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('وویس مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            let k = 0
            let temp = []
            for (var i = 0; i < sound.length; i++) {
                if (sound[i].lsnId == req.params.lsnId) {
                    temp[k] = sound[i]
                }
            }
            sound = temp
            response.response('وویس مورد نظر یافت شد.', sound, (result)=> {
                res.json(result)

            })
        }
    })

});


router.get('/:lsnId/note', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let usrId = student[0]._id
            database.getAllNotes(req.params.lsnId, usrId, (note)=> {
                if (note == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (note == 0) {
                    response.respondNotFound('وویس مورد نظر یافت نشد.', [], (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.response('اطلاعات مورد نظر یافت شد.', note, (result)=> {
                        res.json(result)

                    })
                }
            })
        }
    })


});

router.get('/', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == -1) {
            response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (student == 0) {
            database.getAllLessons((sound)=> {
                if (sound == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (sound == 0) {
                    response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.query.page) {
                        response.paginationClient(req.query.page, req.query.limit, sound, (result1)=> {
                            let countPages = Math.ceil(sound.length / req.query.limit)
                            result1.totalPage = countPages
                            response.response('اطلاعات همه ی درسها', result1, (result)=> {
                                logger.info("AllLesson", result)
                                res.json(result)
                            })
                        })
                    }
                    else {
                        response.response('اطلاعات همه ی درسها', sound, (result)=> {
                            res.json(result)
                        })

                    }


                }
            })

        }

        else {
            let usrId = student[0]._id
            database.getViewUser(usrId, (view)=> {
                if (view == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (view == 0) {
                    response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    database.getAllLessons((lessons)=> {
                        if (lessons == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (lessons == 0) {
                            response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            for (var i = 0; i < lessons.length; i++) {
                                lessons[i].status = "locked"
                                if (lessons[i]._id == view[0].lsnId) {
                                    lessons[i].status = "current"
                                    if (i != 0) {
                                        lessons[i - 1].status = "passed"

                                    }
                                }
                            }
                            response.paginationClient(req.query.page, req.query.limit, lessons, (result1)=> {
                                let countPages = Math.ceil(lessons.length / req.query.limit)
                                result1.totalPage = countPages
                                response.response('اطلاعات همه ی درسها', result1, (result)=> {
                                    res.json(result)
                                })
                            })

                        }
                    })
                }
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
            lesson = lesson[0]
            if (lesson.avatarUrl != undefined || lesson.avatarUrl != null) {
                var unlinkPath = lesson.avatarUrl.replace(`${config.downloadPathLessonImage}`, `${config.uploadPathLessonImage}`);
                fs.unlink(unlinkPath, function (err) {
                    try {
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
                    catch (e) {
                        console.log(e)
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

router.delete('/type/:typId', (req, res) => {
    database.delType(req.params.typId, (result)=> {
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
        else if (result == -2) {
            let errData = {"video": ["نوع مورد نظر دارای ویدیو است"]}
            response.validation('نوع مورد نظر قابل حذف شدن نیست', errData, "hasVideo", (result)=> {
                res.json(result)
            })
        }
        else if (result == -3) {
            let errData = {"sound": ["نوع مورد نظر دارای صدا است"]}
            response.validation('نوع مورد نظر قابل حذف شدن نیست', errData, "hasSound", (result)=> {
                res.json(result)
            })
        }

        else {
            response.response('نوع مورد نظر حذف شد.', result, (result)=> {
                res.json(result)

            })
        }

    })
});

router.delete('/category/:catId', (req, res) => {
    database.delCategory(req.params.catId, (result)=> {
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
            response.response('نوع مورد نظر حذف شد.', result, (result)=> {
                res.json(result)

            })
        }

    })
});

router.delete('/text/:txtId', (req, res) => {
    database.delText(req.params.txtId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('متن مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }

        else {
            response.response('متن مورد نظر حذف شد.', result, (result)=> {
                res.json(result)

            })
        }

    })
});

router.delete('/note/:ntId', (req, res) => {
    database.delNote(req.params.ntId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('متن مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('متن مورد نظر حذف شد.', result, (result)=> {
                res.json(result)

            })
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
            if (video.url == undefined) {
                video.url = ""
            }
            if (video.thumbUrl == undefined) {
                video.thumbUrl = ""
            }
            var unlinkPath = video.url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
            fs.unlink(unlinkPath, function (err) {
                try {
                    let unlinkThumbPath = video.thumbUrl.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
                    fs.unlink(unlinkThumbPath, function (err) {
                        try {
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
                        catch (e) {
                            console.log(e)
                        }
                    })
                }
                catch (e) {
                    console.log(e)
                }

            })
        }
    })
});

router.delete('/file/:flId', (req, res) => {
    database.getFileById(req.params.flId, (video)=> {
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
            if (video.url == undefined) {
                video.url = ""
            }
            var unlinkPath = video.url.replace(`${config.downloadPathVipFile}`, `${config.uploadPathVipFile}`);
            fs.unlink(unlinkPath, function (err) {
                try {
                    database.delFile(req.params.flId, (result)=> {
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
                            response.response('فایل مورد نظر حذف شد.', result, (result)=> {
                                res.json(result)

                            })
                        }
                    })
                }
                catch (e) {
                    console.log(e)
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
            if (sound[0].url == undefined) {
                sound[0].url = ""
            }
            if (sound[0].coverUrl == undefined) {
                sound[0].coverUrl = ""
            }
            var unlinkPath = sound[0].url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
            fs.unlink(unlinkPath, function (err) {
                try {
                    var unlinkPath = sound[0].coverUrl.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            // type file
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
                        catch (e) {
                            console.log(e)
                        }

                    })
                }
                catch (e) {
                    console.log(e)
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
                frame_rate: 30,
                number: 1,
                start_time: 60,
                duration_time: 1,
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
