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


const trick = {
    type: "object",
    properties: {
        text: {type: "string"},
        title: {type: "string"},
        order: {type: "string"},

    },
    required: [],
    additionalProperties: false
};

router.post('/', (req, res)=> {
    let valid = ajv.validate(trick, req.body);
    if (!valid) {
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
        response.validation(`اطلاعات وارد شده اشتباه است.`, errorData, ajv.errors[0].keyword, (result)=> {
            res.json(result)
        })
    } else {
        if (req.files) {
            if (req.files.file != null) {
                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                var file = req.files.file.name.replace(`.${extension}`, '');
                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                // path is Upload Directory
                var dir = `${config.uploadPathTrick}/`;
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
                            if (req.files.srt) {
                                var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.srt.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                // path is Upload Directory
                                var srtDir = `${config.uploadPathTrick}/srt/`;
                                // console.log("dir", dir)
                                lesson.addDir(srtDir, function (newPath) {
                                    var srtPath = srtDir + newFile;
                                    req.files.srt.mv(srtPath, function (err) {
                                        if (err) {
                                            console.error(err);
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            req.body.url = path.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)
                                            req.body.srtUrl = srtPath.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)

                                            let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                            lesson.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                if (thumbResult == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                        res.json(result1)
                                                    })
                                                }
                                                else {
                                                    let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                    req.body.thumbUrl = `${config.downloadPathTrick}/${thumbFileNew}`
                                                    database.addTrick(req.body, (result)=> {
                                                        if (result == -1) {
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                res.json(result1)
                                                            })
                                                        }
                                                        else {
                                                            response.responseCreated('نکته با موفقیت ثبت شد.', result, (result1)=> {
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
                            else {
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                req.body.url = path.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)
                                let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                lesson.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                    if (thumbResult == -1) {
                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                            res.json(result1)
                                        })
                                    }
                                    else {
                                        let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                        req.body.thumbUrl = `${config.downloadPathTrick}/${thumbFileNew}`
                                        database.addTrick(req.body, (result)=> {
                                            if (result == -1) {
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                    res.json(result1)
                                                })
                                            }
                                            else {
                                                response.responseCreated('نکته با موفقیت ثبت شد.', result, (result1)=> {
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

router.put('/:trckId', (req, res)=> {
    let valid = ajv.validate(trick, req.body);
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
                database.getTrickById(req.params.trckId, (trick)=> {
                    if (trick == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (trick == 0) {
                        response.respondNotFound('نکته مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        var unlinkPath = trick[0].url.replace(`${config.downloadPathTrick}`, `${config.uploadPathTrick}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {
                                let unlinkThumbPath = trick[0].thumbUrl.replace(`${config.downloadPathTrick}`, `${config.uploadPathTrick}`)
                                fs.unlink(unlinkThumbPath, function (err) {
                                    try {
                                        if (req.files.file != null) {
                                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                                    var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                    // path is Upload Directory
                                                    var dir = `${config.uploadPathTrick}`;
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
                                                                req.body.url = path.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)
                                                                if (req.files.srt) {
                                                                    var unlinkPath = trick[0].srtUrl.replace(`${config.downloadPathTrick}`, `${config.uploadPathTrick}`);
                                                                    fs.unlink(unlinkPath, function (err) {
                                                                        try {
                                                                            var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                                                                            var file = req.files.srt.name.replace(`.${extension}`, '');
                                                                            var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                                                                            // path is Upload Directory
                                                                            var srtDir = `${config.uploadPathTrick}/srt/`;
                                                                            // console.log("dir", dir)
                                                                           lesson.addDir(srtDir, function (newPath) {
                                                                                var srtPath = srtDir + newFile;
                                                                                req.files.srt.mv(srtPath, function (err) {
                                                                                    if (err) {
                                                                                        console.error(err);
                                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                                            res.json(result)
                                                                                        })
                                                                                    }
                                                                                    else {
                                                                                        req.body.url = path.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)
                                                                                        req.body.srtUrl = srtPath.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)

                                                                                        let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                                        lesson.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                                            if (thumbResult == -1) {
                                                                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                                    res.json(result1)
                                                                                                })
                                                                                            }
                                                                                            else {
                                                                                                let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                                                req.body.thumbUrl = `${config.downloadPathTrick}/${thumbFileNew}`
                                                                                                database.updateTrick(req.body,req.params.trckId , (result)=> {
                                                                                                    if (result == -1) {
                                                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                                            res.json(result1)
                                                                                                        })
                                                                                                    }
                                                                                                    else {
                                                                                                            response.response('نکته با موفقیت تغییر یافت.', result, (result1)=> {
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
                                                                        catch (e) {
                                                                            console.log(e)
                                                                        }
                                                                    })

                                                                }
                                                                else {
                                                                    let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                                                    lesson.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                                                        if (thumbResult == -1) {
                                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                                                res.json(result1)
                                                                            })
                                                                        }
                                                                        else {
                                                                            let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                                                            req.body.thumbUrl = `${config.downloadPathTrick}/${thumbFileNew}`
                                                                            database.updateTrick(req.body, req.params.trckId, (result)=> {
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
                var unlinkPath = trick[0].srtUrl.replace(`${config.downloadPathTrick}`, `${config.uploadPathTrick}`);
                fs.unlink(unlinkPath, function (err) {
                    try {
                        var extension = req.files.srt.name.substring(req.files.srt.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.srt.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '_' + req.body.order + '.' + extension;
                        // path is Upload Directory
                        var srtDir = `${config.uploadPathTrick}/srt/`;
                        // console.log("dir", dir)
                        lesson.addDir(srtDir, function (newPath) {
                            var srtPath = srtDir + newFile;
                            req.files.srt.mv(srtPath, function (err) {
                                if (err) {
                                    console.error(err);
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    req.body.url = path.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)
                                    req.body.srtUrl = srtPath.replace(`${config.uploadPathTrick}`, `${config.downloadPathTrick}`)

                                    let thumbFile = `${newFile.replace(`.${extension}`, '')}_thumb.jpg`
                                    lesson.createVideoThumbnail(path, dir, thumbFile, (thumbResult)=> {
                                        if (thumbResult == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                res.json(result1)
                                            })
                                        }
                                        else {
                                            let thumbFileNew = `${newFile.replace(`.${extension}`, '')}_thumb_1.jpg`
                                            req.body.thumbUrl = `${config.downloadPathTrick}/${thumbFileNew}`
                                            database.updateTrick(req.body,req.params.trckId , (result)=> {
                                                if (result == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result1)=> {
                                                        res.json(result1)
                                                    })
                                                }
                                                else {
                                                        response.response('اطلاعات با موفقیت تغییر یافت.', result, (result1)=> {
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
                    catch (e) {
                        console.log(e)
                    }
                })

            }
            else {

                        database.updateTrick(req.body, req.params.trckId, (result)=> {
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

            database.updateTrick(req.body, req.params.trckId, (result)=> {
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


    }
});

router.delete('/:trckId', (req, res)=> {
    database.delTrick(req.params.trckId, (trick)=> {
        if (trick == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (trick == 0) {
            response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', trick, (result)=> {
                res.json(result)

            })


        }
    })
});

router.get('/:trckId', (req, res)=> {
    database.getTrickById(req.params.trckId, (trick)=> {
        if (trick == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (trick == 0) {
            response.respondNotFound('نکته مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response(' نکته مورد نظر یافت شد.', trick[0], (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    database.getAllTrickes((trick)=> {
        if (trick == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (trick == 0) {
            response.respondNotFound('نکته مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.page != undefined) {
                response.paginationClient(req.query.page, req.query.limit, trick, (result1)=> {
                    let countPages = Math.ceil(trick.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی نکته ها', result1, (result)=> {
                        res.json(result)
                    })
                })

            }
            else {
                response.response('اطلاعات همه ی سوالات', trick, (result)=> {
                    res.json(result)
                })
            }

        }
    })

});


module.exports = router