var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let response = require('../util/responseHelper');
let config = require('../util/config')
let lesson = require('./lesson')
let jwt = require('../util/jwtHelper')
let fs = require('fs')


router.post('/', (req, res)=> {
    console.log("here")
    req.body.time = new Date().getTime()
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    if (username != "userAdmin") {
        database.getStudentByUsername(username, (student)=> {
            if (student == 0) {
                response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                req.body.usrId = student[0]._id
                if (req.files) {
                    if (req.files.IDCard != null) {
                        database.addCertificate(req.body, (addResult)=> {
                                if (addResult == -1) {
                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                        res.json(result)
                                    })
                                }
                                else {
                                    console.log("addResult", addResult)
                                    req.body._id = addResult
                                    // res.json(req.body)
                                    var extension = req.files.IDCard.name.substring(req.files.IDCard.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.IDCard.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathIDCard}/${req.body._id}/`;
                                    console.log("dir", dir)
                                    lesson.addDir(dir, function (newPath) {
                                        var path = dir + newFile;
                                        req.files.IDCard.mv(path, function (err) {
                                            if (err) {
                                                console.error(err);
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                req.body.IDCard = path.replace(`${config.uploadPathIDCard}`, `${config.downloadPathPathIDCard}`)
                                                // req.body._id = (req.body._id.replace(/"/g, ''));
                                                console.log("body", req.body)
                                                req.body._id = addResult
                                                // res.json(req.body)
                                                var extension = req.files.personalImg.name.substring(req.files.personalImg.name.lastIndexOf('.') + 1).toLowerCase();
                                                var file = req.files.personalImg.name.replace(`.${extension}`, '');
                                                var newFile = new Date().getTime() + '.' + extension;
                                                // path is Upload Directory
                                                var dir = `${config.uploadPathPersonalImg}/${req.body._id}/`;
                                                console.log("dir", dir)
                                                lesson.addDir(dir, function (newPath) {
                                                    var path = dir + newFile;
                                                    req.files.personalImg.mv(path, function (err) {
                                                        if (err) {
                                                            console.error(err);
                                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                res.json(result)
                                                            })
                                                        }
                                                        else {
                                                            req.body.personalImg = path.replace(`${config.uploadPathPersonalImg}`, `${config.downloadPathPersonalImg}`)
                                                            // req.body._id = (req.body._id.replace(/"/g, ''));
                                                            console.log("body", req.body)
                                                            database.updateCertificate(req.body, req.body._id, (result)=> {
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

                                        })
                                    });
                                }
                            }
                        )
                    }
                }
                else {
                    database.addCertificate(req.body, (addResult)=> {
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
        })
    }


});

router.put('/:certId', (req, res)=> {
    if (req.files) {
        database.getCertificateById(req.params.certId, (certification)=> {
            if (certification == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (certification == 0) {
                response.respondNotFound('گواهی مورد نظر یافت نشد', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                console.log(certification)
                if (req.files.IDCard != null) {
                    var unlinkPath = certification.IDCard.replace(`${config.downloadPathPathIDCard}`, `${config.uploadPathIDCard}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            if (req.files.IDCard != null) {
                                req.body._id = certification._id
                                var extension = req.files.IDCard.name.substring(req.files.IDCard.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.IDCard.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathIDCard}/${req.body._id}/`;
                                console.log("dir", dir)
                                lesson.addDir(dir, function (newPath) {
                                    var path = dir + newFile;
                                    req.files.IDCard.mv(path, function (err) {
                                        if (err) {
                                            console.error(err);
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            req.body.IDCard = path.replace(`${config.uploadPathIDCard}`, `${config.downloadPathPathIDCard}`)
                                            if (req.files.personalImg != null) {
                                                var unlinkPath = certification.personalImg.replace(`${config.downloadPathPathIDCard}`, `${config.uploadPathIDCard}`);
                                                fs.unlink(unlinkPath, function (err) {
                                                    try {
                                                        if (req.files.personalImg != null) {
                                                            req.body._id = certification._id
                                                            var extension = req.files.personalImg.name.substring(req.files.personalImg.name.lastIndexOf('.') + 1).toLowerCase();
                                                            var file = req.files.personalImg.name.replace(`.${extension}`, '');
                                                            var newFile = new Date().getTime() + '.' + extension;
                                                            // path is Upload Directory
                                                            var dir = `${config.uploadPathPersonalImg}/${req.body._id}/`;
                                                            console.log("dir", dir)
                                                            lesson.addDir(dir, function (newPath) {
                                                                var path = dir + newFile;
                                                                req.files.personalImg.mv(path, function (err) {
                                                                    if (err) {
                                                                        console.error(err);
                                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                                            res.json(result)
                                                                        })
                                                                    }
                                                                    else {
                                                                        req.body.personalImg = path.replace(`${config.uploadPathPersonalImg}`, `${config.downloadPathPersonalImg}`)
                                                                        database.updateCertificate(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                            }
                                            else {
                                                database.updateCertificate(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                                        response.response('ویرایش با موفقیت انجام شد', result, (result)=> {
                                                            res.json(result)

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
                else if (req.files.personalImg != null) {
                    var unlinkPath = certification.personalImg.replace(`${config.downloadPathPathIDCard}`, `${config.uploadPathIDCard}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            if (req.files.personalImg != null) {
                                req.body._id = certification._id
                                var extension = req.files.personalImg.name.substring(req.files.personalImg.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.personalImg.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathPersonalImg}/${req.body._id}/`;
                                console.log("dir", dir)
                                lesson.addDir(dir, function (newPath) {
                                    var path = dir + newFile;
                                    req.files.personalImg.mv(path, function (err) {
                                        if (err) {
                                            console.error(err);
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            req.body.personalImg = path.replace(`${config.uploadPathPersonalImg}`, `${config.downloadPathPersonalImg}`)
                                            database.updateCertificate(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                }
                else {
                    response.validation('فایلی برای آپلود وجود ندارد.', {file: ["فایلی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                        res.json(result)
                    })

                }

            }
        })
    }
    else {
        database.updateCertificate(req.body, req.params.certId, (updated)=> {
            if (updated == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (updated == 0) {
                response.respondNotFound('گواهی مورد نظر یافت نشد', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                response.response('ویرایش با موفقیت انجام شد', updated, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.get('/student', (req, res)=> {
    req.body.time = new Date().getTime()
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    if (username != "userAdmin") {
        database.getStudentByUsername(username, (student)=> {
            if (student == 0) {
                response.respondNotFound('درس مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                let usrId = student[0]._id
                database.getCertificateByUsr(usrId, (addResult)=> {
                    if (addResult == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                  else   if (addResult == 0) {
                        response.respondNotFound('گواهی مورد نظر یافت نشد.', [], (result)=> {
                            res.json(result)
                        })
                    }

                    else {
                        response.responseCreated('اطلاعات گواهی دانشجو.', addResult[0], (result)=> {
                            res.json(result)

                        })
                    }
                })

            }
        })
    }
});

router.get('/:certId', (req, res)=> {
    database.getCertificateById(req.params.certId, (exam)=> {
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
            response.response('گواهی مورد نظر یافت شد.', exam, (result)=> {
                res.json(result)

            })
        }
    })
});



router.get('/', (req, res)=> {
        database.getAllCertifications((exam)=> {
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
                        response.response('اطلاعات همه ی گوای ها', result1, (result)=> {
                            res.json(result)
                        })
                    })

                }
                else {
                    response.response('اطلاعات همه ی گواهی ها', exam, (result)=> {
                        res.json(result)
                    })

                }

            }
        })
})

module.exports = router
