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
// const ThumbnailGenerator = require('video-thumbnail-generator').default;


const lesson = {
    type: "object",
    properties: {
        lvlId: {type: "string"},
        title: {type: "string"}
    },
    required: ["lvlId", "title"],
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


router.post('/', (req, res) => {
    let valid = ajv.validate(lesson, req.body);
    if (!valid) {
        let errorData
        if (ajv.errors[0].keyword == 'required') {
            Data = ajv.errors[0].params.missingProperty
            console.log(Data)
            if (Data == lvlId) {
                errorData = {"lvlId": ["وارد کردن شناسه ی سطح ضروری است."]}
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
            else {
                response.responseCreated('اطلاعات مورد نظر ثبت شد.', lesson, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.post('/video', (req, res) => {
    if (req.files) {
        if (req.files.file != null) {
            database.getLessonById(req.body.lsnId, (lvlId)=> {
                if (lvlId == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                        res.json(result)
                    })

                }
                else if (lvlId == 0) {
                    response.respondNotFound('ویدیویی با این شناسه ی درس یافت نشد.', '', (result)=> {
                        res.json(result)
                    })

                }
                else {
                    database.getVideoByLsnLvl(lvlId, req.body.lsnId, (videos)=> {
                        if (videos == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
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
                                response.validation('اولویت فایل وجود دارد', {vd_order: ["اولویت فایل وجود دارد"]}, 'fileOrder', (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathVideo}/${lvlId}/${req.body.lsnId}/`;
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
                                            const tg = new ThumbnailGenerator({
                                                sourcePath: `${path}`,
                                                thumbnailPath: '/tmp/',
                                            });
                                            tg.generateOneByPercentCb(90, (err, result) => {
                                                console.log(result);
                                                if (err) {
                                                    console.log(err)
                                                }
                                                else {
                                                    req.body.thumbUrl = thumbPath.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                    req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
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

                                            });
                                            req.body.url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
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
});

router.post('/sound', (req, res) => {
    if (req.files) {
        if (req.files.file != null) {
            // type file    
            database.getSoundByLsnLvl(req.body.lvlId, req.body.lsnId, (sounds)=> {
                if (sounds == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
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
})


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
        database.updateLesson(req.body, req.params.lsnId, (lesson)=> {

            if (lesson == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (lesson == 0) {
                response.respondNotFound('درس مورد نظر یافت نشد.', '', (result)=> {
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
});

router.put('/video/:vdId', (req, res) => {
    if (req.files.file) {
        database.getVideoByVDId(req.params.vdId, (video)=> {
            var unlinkPath = video.url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
            fs.unlink(unlinkPath, function (err) {
                if (err) {
                    response.respondNotFound('فایلی یافت نشد', '', (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.files.file != null) {
                        // type file
                        database.getVideoByLsnLvl(req.body.lvlId, req.body.lsnId, (videos)=> {
                            if (videos == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
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
                                                database.updateVideo(req.body, req.params.vdId, (result)=> {
                                                    if (result == -1) {
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result1)=> {
                                                            res.json(result1)
                                                        })
                                                    }
                                                    else if (result == 0) {
                                                        response.respondNotFound('فایلی یافت نشد', '', (result1)=> {
                                                            res.json(result1)
                                                        })
                                                    }
                                                    else {
                                                        response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', '', (result1)=> {
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
                    else {
                        response.validation('فایلی برای آپلود وجود ندارد.', '', (result)=> {
                            res.json(result)
                        })
                    }

                }

            })

        })
    }
    else {
        database.updateVideo(req.body, req.params.vdId, (result)=> {
            if (result == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (result == 0) {
                response.respondNotFound('فایلی یافت نشد', '', (result)=> {
                    res.json(result)
                })
            }
            else {
                res.json(result)
            }
        })
    }
});

router.put('/sound/:sndId', (req, res) => {
    if (req.files.file) {
        database.getSoundBysndId(req.params.sndId, (sound)=> {
            if (sound == 0 || sound == -1) {
                response.respondNotFound('صدای مورد نظر یافت نشد.', '', (result)=> {
                    res.json(result)
                })
            }
            else {
                var unlinkPath = sound.url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                fs.unlink(unlinkPath, function (err) {
                    if (err) {
                        console.log("err in unlinking", err)
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        if (req.files.file != null) {
                            // type file
                            database.getSoundByLsnLvl(req.body.lvlId, req.body.lsnId, (sounds)=> {
                                if (sounds == -1) {
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
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
                                                    database.updateSound(req.body, req.params.sndId, (updateSound)=> {
                                                        if (updateSound == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else if (updateSound == 0) {
                                                            response.respondNotFound('صدای مورد نظر یافت نشد.', '', (result)=> {
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
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (updateSound == 0) {
                response.respondNotFound('صدای مورد نظر یافت نشد.', '', (result)=> {
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
});


router.get('/level/:lvlId', (req, res) => {
    database.getLessonByLvlId(req.params.lvlId, (lesson)=> {
        if (req.query.cli == 1) {
            if (lesson == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (lesson == 0) {
                response.respondNotFound('درس مورد نظر یافت نشد.', '', (result)=> {
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
                res.status(500).end('')
            }
            else if (lesson == 0) {
                res.status(404).end('')
            }
            else {
                if (req.query.offset && req.query.limit) {
                    response.pagination(req.query.offset, req.query.limit, lesson, (resp)=> {
                        res.json(resp)
                    })
                }
                else {
                    res.json(lesson)

                }
            }
        }

    })
});

router.get('/:lsnId/video', (req, res) => {
    database.getVDbyLesson((video)=> {
        if (video == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', '', (result)=> {
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
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (lesson == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', '', (result)=> {
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
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (type == 0) {
            response.respondNotFound('نوع مورد نظر یافت نشد.', '', (result)=> {
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


router.get('/:lsnId', (req, res) => {
    database.getLessonById(req.params.lsnId, (lesson)=> {
        if (lesson == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (lesson == 0) {
            response.respondNotFound('درس مورد نظر یافت نشد.', '', (result)=> {
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
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('وویس مورد نظر یافت نشد.', '', (result)=> {
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
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (video == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('ویدیو مورد نظر یافت شد.', video, (result)=> {
                res.json(result)

            })
        }
    })
})

router.get('/:lsnId/sound/:lvlId', (req, res)=> {
    database.getSoundByLsnLvl(req.params.lvlId, req.params.lsnId, (sound)=> {
        if (sound == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (sound == 0) {
            response.respondNotFound('وویس مورد نظر یافت نشد.', '', (result)=> {
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
            response.respondNotFound('درس مورد نظر یافت نشد.', '', (result)=> {
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
    database.delLesson(req.params.lsnId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('ویدیو مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('ویدیو مورد نظر یافت شد.', result, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/video/:vdId', (req, res) => {
    database.getVideoByVDId(req.params.vdId, (video)=> {
        var unlinkPath = video.url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
        fs.unlink(unlinkPath, function (err) {
            if (err) {
                response.respondNotFound('فایلی یافت نشد', '', (result)=> {
                    res.json(result)
                })
            }
            else {
                database.delVideo(req.params.vdId, (result)=> {
                    if (video == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                            res.json(result)
                        })
                    }
                    else if (video == 0) {
                        response.respondNotFound('ویدیو مورد نظر یافت نشد.', '', (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        response.response('ویدیو مورد نظر یافت شد.', video, (result)=> {
                            res.json(result)

                        })
                    }
                })
            }

        })

    })

});

router.delete('/sound/:sndId', (req, res) => {
    database.getSoundBysndId(req.params.sndId, (sound)=> {
        if (sound == 0 || sound == -1) {
            response.respondNotFound('صدای مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            var unlinkPath = sound.url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
            fs.unlink(unlinkPath, function (err) {
                if (err) {
                    console.log("err in unlinking", err)
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                        res.json(result)
                    })
                }
                else {
                    database.delSound(req.params.sndId, (result)=> {
                        if (result == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == 0) {
                            response.respondNotFound('ویدیو مورد نظر یافت نشد.', '', (result)=> {
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
