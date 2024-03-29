var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let jwt = require('../util/jwtHelper');
let response = require('../util/responseHelper');
let hashHelper = require('../util/hashHelper');
let config = require('../util/config');
let lesson = require('./lesson')
let fs = require('fs')
let statistic = require('./statistic')
const trim = require('../util/trimmer')
// let csurf = require('../util/csurfHelper')
let chatRoom = require('./chatRoom')
let moment = require('moment-jalaali')


router.post('/admin/login', (req, res) => {
    req.body.password = hashHelper.hash(req.body.password)
    database.adminLogin(req.body, function (loginResult) {
        if (loginResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (loginResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete loginResult.password
            let data = loginResult
            data.jwt = jwt.signUser(loginResult.username)
            // data.csrfToken= req.csrfToken()
            response.response('ورود با موفقیت انجام شد.', data, (result)=> {
                res.json(result)

            })
        }
    })
});

router.put('/admin/:admId', (req, res) => {
    if (req.body.password) {
        req.body.password = hashHelper.hash(req.body.password)

    }
    database.updateAdmin(req.body, req.params.admId, (Putresult)=> {
        if (Putresult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (Putresult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete  Putresult.password
            response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', Putresult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/admin', (req, res) => {
    database.getAdmins((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات همه ی ادمین ها', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/admin/:admId', (req, res)=> {
    database.getAdminById(req.params.admId, (admin)=> {

        if (admin == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (admin == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete  admin.password
            response.responseUpdated('اطلاعات کاربر مورد نظر', admin, (result)=> {
                res.json(result)

            })
        }
    })
});

router.post('/admin', (req, res)=> {
    req.body.password = hashHelper.hash(req.body.password)

    database.addAdmin(req.body, (addedAdmin)=> {
        if (addedAdmin == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (addedAdmin == -2) {
            response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                res.json(result)
            })
        }


        else {
            delete  addedAdmin.password

            response.responseCreated('اطلاعات با موفقیت ثبت شد.', addedAdmin, (result)=> {
                res.json(result)

            })
        }
    })
});


router.put('/supporter/:supId', (req, res) => {
    logger.info("body in update supporter", req.body)
    logger.info("file in update supporter", req.files)

    if (req.body.password) {
        req.body.password = hashHelper.hash(req.body.password)

    }
    if (req.files || req.files == "") {

        database.getSupporterById(req.params.supId, (student)=> {
            if (student == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (student == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (student.avatarUrl) {
                    if (student.avatarUrl == undefined) {
                        student.avatarUrl = ""
                    }
                    var unlinkPath = student.avatarUrl.replace(`${config.downloadPathSupporterImage}`, `${config.uploadPathSupporterImage}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            if (req.files.file != null) {
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathSupporterImage}/${req.params.supId}/`;
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
                                            req.body.avatarUrl = path.replace(`${config.uploadPathSupporterImage}`, `${config.downloadPathSupporterImage}`)
                                            database.updateSupporter(req.body, req.params.supId, (Putresult)=> {
                                                if (Putresult == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == 0) {
                                                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == -2) {
                                                    errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                                    response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    delete Putresult.password
                                                    response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
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
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathSupporterImage}/${req.params.supId}/`;
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
                                    req.body.avatarUrl = path.replace(`${config.uploadPathSupporterImage}`, `${config.downloadPathSupporterImage}`)
                                    database.updateSupporter(req.body, req.params.supId, (Putresult)=> {
                                        if (Putresult == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (Putresult == 0) {
                                            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (Putresult == -2) {
                                            errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                            response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                res.json(result)
                                            })
                                        }

                                        else {
                                            delete Putresult.password
                                            response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
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
        })

    }
    else {
        database.updateSupporter(req.body, req.params.supId, (Putresult)=> {
            if (Putresult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == -2) {
                response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete  Putresult.password
                response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', Putresult, (result)=> {
                    res.json(result)

                })
            }
        })
    }

});

router.put('/changePass/:id', (req, res) => {
    if (req.body.oldPassword == undefined) {
        let errData = {"OldPassword": "پسورد را وارد کنید"}
        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
            res.json(result)
        })
    }
    else {
        req.body.oldPassword = hashHelper.hash(req.body.oldPassword)
        req.body.password = hashHelper.hash(req.body.newPassword)
        if (req.body.role == "admin") {
            database.getAdminById(req.params.id, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (student == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.body.oldPassword == student.password) {
                        let newStudent = Object.assign({}, student, req.body)
                        database.updateAdmin(newStudent, req.params.id, (Putresult)=> {
                            if (Putresult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (Putresult == 0) {
                                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                delete Putresult.password
                                response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                                    res.json(result)

                                })
                            }
                        })
                    }
                    else {
                        let errData = {"OldPassword": "پسورد اشتباه است"}
                        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
                            res.json(result)
                        })
                    }
                }
            })

        }
        else if (req.body.role == "chatAdmin") {
            database.getChatAdminById(req.params.id, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (student == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.body.oldPassword == student.password) {
                        let newStudent = Object.assign({}, student, req.body)
                        database.updateChatAdmin(newStudent, req.params.id, (Putresult)=> {
                            if (Putresult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (Putresult == 0) {
                                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                delete Putresult.password
                                response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                                    res.json(result)

                                })
                            }
                        })
                    }
                    else {
                        let errData = {"OldPassword": "پسورد اشتباه است"}
                        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
                            res.json(result)
                        })
                    }
                }
            })

        }
        else if (req.body.role == "supporter") {
            database.getSupporterById(req.params.id, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (student == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.body.oldPassword == student.password) {
                        let newStudent = Object.assign({}, student, req.body)
                        database.updateSupporter(newStudent, req.params.id, (Putresult)=> {
                            if (Putresult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (Putresult == 0) {
                                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                delete Putresult.password
                                response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                                    res.json(result)

                                })
                            }
                        })
                    }
                    else {
                        let errData = {"OldPassword": "پسورد اشتباه است"}
                        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
                            res.json(result)
                        })
                    }
                }
            })

        }
        else if (req.body.role == "tutor") {
            database.getTutorById(req.params.id, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (student == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.body.oldPassword == student.password) {
                        let newStudent = Object.assign({}, student, req.body)
                        database.updateTutor(newStudent, req.params.id, (Putresult)=> {
                            if (Putresult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (Putresult == 0) {
                                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                delete Putresult.password
                                response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                                    res.json(result)

                                })
                            }
                        })
                    }
                    else {
                        let errData = {"OldPassword": "پسورد اشتباه است"}
                        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
                            res.json(result)
                        })
                    }
                }
            })

        }
    }

});


router.get('/supporter', (req, res) => {
    database.getSupporters((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            for (var i = 0; i < getResult.length; i++) {
                delete getResult[i].password
                getResult[i].department = getResult[i].department[0]
            }
            response.response('اطلاعات همه ی پشتیبان ها', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/supporter/:supId', (req, res)=> {
    database.getSupporterById(req.params.supId, (sup)=> {

        if (sup == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sup == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete  sup.password
            response.responseUpdated('اطلاعات کاربر مورد نظر', sup, (result)=> {
                res.json(result)

            })
        }
    })
});

router.post('/supporter', (req, res)=> {
    logger.info("postSupporter body", req.body)
    req.body.password = hashHelper.hash(req.body.password)
    if (req.files) {
        if (req.files.file != null) {
            // type file
            database.addSupporer(req.body, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                        res.json(result)
                    })
                }
                else if (student == -2) {
                    let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
                    response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                        res.json(result)
                    })
                }
                else {

                    delete student.password
                    req.body._id = student
                    // res.json(req.body)
                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                    var file = req.files.file.name.replace(`.${extension}`, '');
                    var newFile = new Date().getTime() + '.' + extension;
                    // path is Upload Directory
                    var dir = `${config.uploadPathSupporterImage}/${req.body._id}/`;
                    console.log("dir", dir)
                    lesson.addDir(dir, function (newPath) {
                        var path = dir + newFile;
                        req.files.file.mv(path, function (err) {
                            if (err) {
                                console.error(err);
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                req.body.avatarUrl = path.replace(`${config.uploadPathSupporterImage}`, `${config.downloadPathSupporterImage}`)
                                req.body._id = (req.body._id.replace(/"/g, ''));
                                req.body.setAvatar = true
                                database.updateSupporter(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                    else {
                                        delete  req.body.setAvatar
                                        delete req.body.password
                                        response.response('اطلاعات با موفقیت ثبت شد', result, (result1)=> {
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
    else {
        database.addSupporer(req.body, (addedAdmin)=> {
            if (addedAdmin == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (addedAdmin == -2) {
                response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete  addedAdmin.password

                response.responseCreated('اطلاعات با موفقیت ثبت شد.', addedAdmin, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});


router.post('/chatAdmin', (req, res)=> {
    if (req.body.chatrooms) {
        if (typeof req.body.chatrooms == "string") {
            req.body.chatrooms = JSON.parse(req.body.chatrooms)
        }
    }
    else {
        req.body.chatrooms = []
    }

    req.body.password = hashHelper.hash(req.body.password)
    logger.info("chatAdminBody", req.body)
    if (req.files) {
        if (req.files.file != null) {
            // type file
            database.addChatAdmin(req.body, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                        res.json(result)
                    })
                }
                else if (student == -2) {
                    let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
                    response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                        res.json(result)
                    })
                }
                else {

                    delete student.password
                    req.body._id = student
                    // res.json(req.body)
                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                    var file = req.files.file.name.replace(`.${extension}`, '');
                    var newFile = new Date().getTime() + '.' + extension;
                    // path is Upload Directory
                    var dir = `${config.uploadPathChatAdminImage}/${req.body._id}/`;
                    console.log("dir", dir)
                    lesson.addDir(dir, function (newPath) {
                        var path = dir + newFile;
                        req.files.file.mv(path, function (err) {
                            if (err) {
                                console.error(err);
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                req.body.avatarUrl = path.replace(`${config.uploadPathChatAdminImage}`, `${config.downloadPathChatAdminImage}`)
                                req.body._id = (req.body._id.replace(/"/g, ''));
                                req.body.setAvatar = true
                                database.updateChatAdmin(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                    else {
                                        delete  req.body.setAvatar
                                        delete req.body.password
                                        response.response('اطلاعات با موفقیت ثبت شد', result, (result1)=> {
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
    else {
        database.addChatAdmin(req.body, (addedAdmin)=> {
            if (addedAdmin == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (addedAdmin == -2) {
                response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete  addedAdmin.password

                response.responseCreated('اطلاعات با موفقیت ثبت شد.', addedAdmin, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.put('/chatAdmin/:caId', (req, res) => {
    logger.info("body in update chatAdmin", req.body)
    logger.info("file in update chatAdmin", req.files)
    if (req.body.password) {
        req.body.password = hashHelper.hash(req.body.password)

    }
    if (req.files || req.files == "") {
        database.getChatAdminById(req.params.caId, (student)=> {
            if (student == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (student == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (student.avatarUrl) {
                    if (student.avatarUrl == undefined) {
                        student.avatarUrl = ""
                    }
                    var unlinkPath = student.avatarUrl.replace(`${config.downloadPathChatAdminImage}`, `${config.uploadPathChatAdminImage}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            if (req.files.file != null) {
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathChatAdminImage}/${req.params.caId}/`;
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
                                            req.body.avatarUrl = path.replace(`${config.uploadPathChatAdminImage}`, `${config.downloadPathChatAdminImage}`)
                                            database.updateChatAdmin(req.body, req.params.caId, (Putresult)=> {
                                                if (Putresult == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == 0) {
                                                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == -2) {
                                                    errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                                    response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    delete Putresult.password
                                                    response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
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
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathChatAdminImage}/${req.params.caId}/`;
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
                                    req.body.avatarUrl = path.replace(`${config.uploadPathChatAdminImage}`, `${config.downloadPathChatAdminImage}`)
                                    database.updateChatAdmin(req.body, req.params.caId, (Putresult)=> {
                                        if (Putresult == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (Putresult == 0) {
                                            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (Putresult == -2) {
                                            errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                            response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                res.json(result)
                                            })
                                        }

                                        else {
                                            delete Putresult.password
                                            response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
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
        })

    }
    else {
        database.updateChatAdmin(req.body, req.params.caId, (Putresult)=> {
            if (Putresult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == -2) {
                response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete  Putresult.password
                response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', Putresult, (result)=> {
                    res.json(result)

                })
            }
        })
    }

});

router.get('/chatAdmin', (req, res) => {
    database.getChatAdmins((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            for (var i = 0; i < getResult.length; i++) {
                delete getResult[i].password
            }
            response.response('اطلاعات همه ی ادمین های چت', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/chatAdmin/:caId', (req, res)=> {
    database.getChatAdminById(req.params.caId, (sup)=> {
        if (sup == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sup == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete  sup.password
            response.responseUpdated('اطلاعات کاربر مورد نظر', sup, (result)=> {
                res.json(result)

            })
        }
    })
});


router.post('/tutor', (req, res)=> {
    req.body.answered = 0;
    req.body.passed = 0
    if (req.body.users) {
        if (typeof req.body.users == "string") {
            req.body.users = JSON.parse(req.body.users)
        }
    }
    else {
        req.body.users = []
    }
    if (req.body.levels) {
        if (typeof req.body.levels == "string") {
            req.body.levels = JSON.parse(req.body.levels)
        }
    }
    else {
        req.body.levels = []
    }


    req.body.password = hashHelper.hash(req.body.password)
    logger.info("tutorBody", req.body)
    if (req.files) {
        if (req.files.file != null) {
            // type file
            database.addTutor(req.body, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                        res.json(result)
                    })
                }
                else if (student == -2) {
                    let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
                    response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                        res.json(result)
                    })
                }
                else {
                    delete student.password
                    req.body._id = student
                    // res.json(req.body)
                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                    var file = req.files.file.name.replace(`.${extension}`, '');
                    var newFile = new Date().getTime() + '.' + extension;
                    // path is Upload Directorpathy
                    var dir = `${config.uploadPathTutorImage}/${req.body._id}/`;
                    console.log("dir", dir)
                    lesson.addDir(dir, function (newPath) {
                        var path = dir + newFile;
                        req.files.file.mv(path, function (err) {
                            if (err) {
                                console.error(err);
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                req.body.avatarUrl = path.replace(`${config.uploadPathTutorImage}`, `${config.downloadPathTutorImage}`)
                                req.body._id = (req.body._id.replace(/"/g, ''));
                                req.body.setAvatar = true
                                database.updateTutor(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                    else {
                                        delete  req.body.setAvatar
                                        delete req.body.password
                                        response.response('اطلاعات با موفقیت ثبت شد', result, (result1)=> {
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
    else {
        database.addTutor(req.body, (addedTutor)=> {
            if (addedTutor == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                    res.json(result)
                })
            }
            else if (addedTutor == -2) {
                response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete  addedTutor.password

                response.responseCreated('اطلاعات با موفقیت ثبت شد.', addedTutor, (result)=> {
                    res.json(result)

                })
            }
        })
    }
});

router.put('/tutor/:tId', (req, res) => {
    if (req.body.password) {
        req.body.password = hashHelper.hash(req.body.password)

    }
    if (req.files || req.files == "") {
        database.getTutorById(req.params.tId, (student)=> {
            if (student == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (student == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (student.avatarUrl) {
                    if (student.avatarUrl == undefined) {
                        student.avatarUrl = ""
                    }
                    var unlinkPath = student.avatarUrl.replace(`${config.downloadPathTutorImage}`, `${config.uploadPathTutorImage}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            if (req.files.file != null) {
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathTutorImage}/${req.params.tId}/`;
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
                                            req.body.avatarUrl = path.replace(`${config.uploadPathTutorImage}`, `${config.downloadPathTutorImage}`)
                                            database.updateTutor(req.body, req.params.tId, (Putresult)=> {
                                                if (Putresult == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == 0) {
                                                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == -2) {
                                                    errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                                    response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    delete Putresult.password
                                                    response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
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
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathChatAdminImage}/${req.params.caId}/`;
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
                                    req.body.avatarUrl = path.replace(`${config.uploadPathChatAdminImage}`, `${config.downloadPathChatAdminImage}`)
                                    database.updateChatAdmin(req.body, req.params.caId, (Putresult)=> {
                                        if (Putresult == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (Putresult == 0) {
                                            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (Putresult == -2) {
                                            errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                            response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                res.json(result)
                                            })
                                        }

                                        else {
                                            delete Putresult.password
                                            response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
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
        })

    }
    else {
        database.updateTutor(req.body, req.params.tId, (Putresult)=> {
            if (Putresult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == -2) {
                response.validation('نام کاربری نمیتواند تکراری باشد', {}, 422, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete  Putresult.password
                response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', Putresult, (result)=> {
                    res.json(result)

                })
            }
        })
    }

});

router.get('/tutor', (req, res) => {
    database.getTutors((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            for (var i = 0; i < getResult.length; i++) {
                delete getResult[i].password
            }
            response.response('اطلاعات همه ی معلم های خصوصی', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/tutor/:tId', (req, res)=> {
    database.getTutorById(req.params.tId, (sup)=> {
        if (sup == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sup == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete  sup.password
            response.responseUpdated('اطلاعات کاربر مورد نظر', sup, (result)=> {
                res.json(result)

            })
        }
    })
});


router.post('/cp', (req, res)=> {
    req.body.password = hashHelper.hash(req.body.password)

    database.addCp(req.body, (addedAdmin)=> {
        if (addedAdmin == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (addedAdmin == -2) {
            let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                res.json(result)
            })
        }

        else {
            delete  addedAdmin.password

            response.responseCreated('اطلاعات با موفقیت ثبت شد.', addedAdmin, (result)=> {
                res.json(result)

            })
        }
    })
});

router.put('/cp/:cpId', (req, res) => {
    if (req.body.password) {
        req.body.password = hashHelper.hash(req.body.password)

    }
    database.updateCp(req.body, req.params.cpId, (Putresult)=> {
        if (Putresult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (Putresult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (Putresult == -2) {
            let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                res.json(result)
            })
        }

        else {
            delete  Putresult.password
            response.responseUpdated('اطلاعات با موفقیت تغییر یافت.', Putresult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/cp', (req, res) => {
    database.getCps((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            for (var i = 0; i < getResult.length; i++) {
                delete getResult[i].password
            }
            response.response('اطلاعات همه ی محتوا گذاران', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/cp/:cpId', (req, res)=> {
    database.getCpById(req.params.cpId, (sup)=> {
        if (sup == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (sup == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete  sup.password
            response.responseUpdated('اطلاعات کاربر مورد نظر', sup, (result)=> {
                res.json(result)

            })
        }
    })
});


router.post('/student/register', (req, res)=> {
    logger.info("resister", req.body)
    trim.expressTrimmer(req, (req)=> {
        if (req.body.password == undefined || req.body.username == undefined || req.body.mobile == undefined) {
            let errData = {"password": "پسورد را وارد کنید"}
            response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.body.fname == undefined) {
                req.body.fname = ""
            }
            if (req.body.lname == undefined) {
                req.body.lname = ""
            }
            if (req.body.mobile == undefined) {
                req.body.mobile = ""
            }
            if (req.body.avatarUrl == undefined) {
                req.body.avatarUrl = ""
            }
            if (req.body.score == undefined) {
                req.body.score = 0
            }
            if (req.body.lastPassedLesson == undefined) {
                req.body.lastPassedLesson = 0
            }
            if (req.body.passedLessonScore == undefined) {
                req.body.passedLessonScore = 0
            }
            req.body.password = hashHelper.ConvertToEnglish(req.body.password)

            req.body.password = hashHelper.hash(req.body.password);
            req.body.mobile = hashHelper.ConvertToEnglish(req.body.mobile)
            if (req.files) {
                if (req.files.file != null) {
                    // type file
                    database.addStu(req.body, (student)=> {
                        if (student == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                res.json(result)
                            })
                        }
                        else if (student == -2) {
                            let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
                            response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            let viewInfo = {}
                            viewInfo.usrId = student
                            viewInfo.lsnId = "0";
                            viewInfo.video = [];
                            viewInfo.sound = [];
                            viewInfo.viewPermission = false
                            database.addView(viewInfo, (addResult)=> {
                                delete student.password
                                req.body._id = student
                                // res.json(req.body)
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathStuImage}/${req.body._id}/`;
                                console.log("dir", dir)
                                lesson.addDir(dir, function (newPath) {
                                    var path = dir + newFile;
                                    req.files.file.mv(path, function (err) {
                                        if (err) {
                                            console.error(err);
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            req.body.avatarUrl = path.replace(`${config.uploadPathStuImage}`, `${config.downloadPathStuImage}`)
                                            req.body._id = (req.body._id.replace(/"/g, ''));
                                            req.body.setAvatar = true
                                            database.updateStudent(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                                else {
                                                    delete  req.body.setAvatar
                                                    delete req.body.password
                                                    // req.body.jwt = jwt.signUser(req.body.username)
                                                    response.response('ورود با موفقیت انجام شد', req.body, (result)=> {
                                                        res.json(result)

                                                    })
                                                }
                                            })
                                        }

                                    })
                                });
                            })

                        }
                    })
                }
            }
            else {
                database.addStu(req.body, (student)=> {
                    if (student == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                            res.json(result)
                        })
                    }
                    else if (student == -2) {
                        let errData = {"username": "نام کاربری نمیتواند تکراری باشد"}
                        response.validation('اطلاعات وارد شده صحیح نمی باشد', errData, "duplicated", (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        delete req.body.password
                        req.body._id = student
                        // req.body.jwt = jwt.signUser(req.body.username)
                        let viewInfo = {}
                        viewInfo.usrId = req.body._id
                        viewInfo.lsnId = "0";
                        viewInfo.video = [];
                        viewInfo.sound = [];
                        viewInfo.viewPermission = false

                        database.addView(viewInfo, (addResult)=> {
                            response.response('ورود با موفقیت انجام شد', req.body, (result)=> {
                                res.json(result)

                            })
                        })
                    }
                })
            }

        }
    })
});

router.post('/student/login', (req, res) => {
    if (req.body == undefined) {
        let errData = {"password": "پسورد را وارد کنید"}
        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
            res.json(result)
        })
    }
    else {
        logger.info("loginInfo firsyt", req.body)
        req.body.password = hashHelper.ConvertToEnglish(req.body.password)
        logger.info("loginInfo convert", req.body)

        req.body.password = hashHelper.hash(req.body.password)
        logger.info("loginInfo hash", req.body)

        database.stuLogin(req.body, function (loginResult) {
            if (loginResult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (loginResult == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                chatRoom.setAvatarUrl(loginResult.chatrooms, (newChatrrom)=> {
                    loginResult.chatrooms = newChatrrom
                    database.getViewUser(loginResult._id, (view)=> {
                        if (view != 0 && view != -1) {
                            database.getLessonById(view[0].lsnId, (lesson)=> {
                                database.getExamPassedCount(loginResult._id, (exam)=> {
                                    if (exam == -1 || exam == 0) {
                                        loginResult.examPassed = 0
                                    }
                                    else {
                                        logger.info("examCount", exam)
                                        loginResult.examPassed = exam.length
                                    }
                                    if (loginResult.score == 0) {
                                        delete loginResult.password
                                        let data = loginResult
                                        data.progress = 0
                                        delete lesson[0].video
                                        delete lesson[0].sound
                                        delete lesson[0].text
                                        delete lesson[0].downloadFile
                                        data.lesson = lesson[0]
                                        data.jwt = jwt.signUser(loginResult.username)
                                        response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                            res.json(result)

                                        })

                                    }
                                    else {
                                        statistic.calculateProgress(lesson[0]._id, (progress)=> {
                                            if (progress != -1) {
                                                delete loginResult.password
                                                let data = loginResult
                                                data.progress = progress
                                                delete lesson[0].video
                                                delete lesson[0].sound
                                                delete lesson[0].text
                                                delete lesson[0].downloadFile

                                                data.lesson = lesson[0]
                                                data.jwt = jwt.signUser(loginResult.username)
                                                response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                                    res.json(result)

                                                })
                                            }
                                            else {
                                                delete loginResult.password
                                                let data = loginResult
                                                delete lesson[0].video
                                                delete lesson[0].sound
                                                delete lesson[0].text
                                                delete lesson[0].downloadFile
                                                logger.info("leson", lesson[0])
                                                data.lesson = lesson[0]
                                                data.jwt = jwt.signUser(loginResult.username)
                                                response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                                    res.json(result)

                                                })
                                            }
                                        })

                                    }
                                })


                            })
                        }
                        else {
                            res.status(300).end('')
                        }
                    })
                })
            }
        })
    }

});

router.post('/student/verification', (req, res) => {

    database.getStudentById(req.body._id, (student)=> {
        if (student == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (student == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            req.body.mobile = student.mobile
            database.verification(req.body, function (verifResult) {
                if (verifResult == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (verifResult == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    let updateStu = {}
                    updateStu.verify = true
                    database.updateStudent(updateStu, req.body._id, (updated)=> {
                        if (updated == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (updated == 0) {
                            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            chatRoom.setAvatarUrl(updated.chatrooms, (newChatrrom)=> {
                                updated.chatrooms = newChatrrom
                                updated.jwt = jwt.signUser(updated.username)
                                response.response('ورود با موفقیت انجام شد', updated, (result)=> {
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

router.post('/student/resendVerify', (req, res) => {
    database.resendVerification(req.body, function (verifResult) {
        if (verifResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (verifResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let updateStu = {}
            updateStu.verify = true
            database.updateStudent(updateStu, req.body._id, (updated)=> {
                if (updated == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (updated == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    chatRoom.setAvatarUrl(updated.chatrooms, (newChatrrom)=> {
                        updated.chatrooms = newChatrrom
                        updated.jwt = jwt.signUser(updated.username)
                        response.response('ورود با موفقیت انجام شد', updated, (result)=> {
                            res.json(result)

                        })
                    })


                }
            })

        }
    })


});

router.post('/student/forgetPass', (req, res) => {
    database.getStuByMobile(req.body.mobile, (student)=> {
        if (student == -1 || student == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            req.body._id = student._id
            database.forgetPass(req.body, function (verifResult) {
                if (verifResult == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (verifResult == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    let updateStu = {}
                    updateStu.verify = false
                    database.updateStudent(updateStu, req.body._id, (updated)=> {
                        if (updated == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (updated == 0) {
                            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            // updated.jwt = jwt.signUser(updated.username)
                            delete updated.password
                            response.response('ارسال با موفقیت انجام شد', updated, (result)=> {
                                res.json(result)

                            })
                        }
                    })

                }
            })
        }
    })
});

router.post('/student/forgetPass/verify', (req, res) => {
    if (typeof req.body.verifyCode == "string") {
        req.body.verifyCode = parseInt(req.body.verifyCode)
    }
    database.forgetPassVerify(req.body, function (verifResult) {
        if (verifResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (verifResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let updateStu = {}
            req.body._id = verifResult.usrId
            updateStu.verify = true
            database.updateStudent(updateStu, req.body._id, (updated)=> {
                if (updated == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (updated == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    // updated.jwt = jwt.signUser(updated.username)
                    delete updated.password
                    response.response('ورود با موفقیت انجام شد', updated, (result)=> {
                        res.json(result)

                    })
                }
            })

        }
    })


});

router.post('/student/forgetPass/send', (req, res) => {
    if (req.body.password == undefined) {
        let errData = {"password": "پسورد را وارد کنید"}
        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
            res.json(result)
        })
    }
    else {
        logger.info("forgetPass", req.body.password)
        req.body.password = hashHelper.ConvertToEnglish(req.body.password)
        req.body.password = hashHelper.hash(req.body.password)
        logger.info("forgetPass hash", req.body.password)

        database.updateStudent(req.body, req.body._id, (updated)=> {
            if (updated == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (updated == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                chatRoom.setAvatarUrl(updated.chatrooms, (newChatrrom)=> {
                    updated.chatrooms = newChatrrom
                    updated.jwt = jwt.signUser(updated.username)
                    delete updated.password

                    response.response('ورود با موفقیت انجام شد', updated, (result)=> {
                        res.json(result)

                    })
                })
            }
        })
    }

});

router.post('/refreshToken', function (req, res) {
    if (!req.headers.authorization) {
        logger.error('there is no token', 0)
        res.status(401).end('')
    }
    else {
        var token = req.headers.authorization.split(" ")[1];
        var verify = jwt.verify(token);
        if (verify == 1) {
            jwt.verifyExpireToken(token, function (newToken) {
                var verify = jwt.verify(newToken);
                let userID = verify.userID
                database.getStudentByUsername(userID, (student)=> {
                    if (student == 0 || student == -1) {
                        res.json({access_token: jwt.signUser(userID), expires_in: 3600, token_type: 'Bearer'});

                    }
                    else {
                        let lsnId = student[0].view.lsnId
                        if (student[0].view.lsnId == 0) {
                            student[0].lastPassedLesson

                        }
                        database.getLessonById(lsnId, (lesson)=> {
                            if (lesson[0].video)
                                delete lesson[0].video
                            if (lesson[0].sound)

                                delete lesson[0].sound
                            if (lesson[0].text)

                                delete lesson[0].text

                            if (lesson[0].downloadFile)

                                delete lesson[0].downloadFile
                            delete student[0].password
                            let data = student[0]
                            data.lesson = lesson[0]
                            data.jwt = jwt.signUser(userID)
                            chatRoom.setAvatarUrl(student[0].chatrooms, (newChatrrom)=> {
                                student[0].chatrooms = newChatrrom

                                response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                    res.json(result)

                                })
                            })

                        })

                    }
                })
            })
        }
        else if (verify == null) {
            logger.error('token is not valid', verify);
            res.status(401).end('')

        }
        else {
            let userID = verify.userID
            database.getStudentByUsername(userID, (student)=> {
                if (student == 0 || student == -1) {
                    res.json({access_token: jwt.signUser(userID), expires_in: 3600, token_type: 'Bearer'});

                }
                else {
                    let lsnId = student[0].view.lsnId
                    if (student[0].view.lsnId == 0) {
                        lsnId = student[0].lastPassedLesson

                    }

                    database.getLessonById(lsnId, (lesson)=> {
                        delete lesson[0].video
                        delete lesson[0].sound
                        delete lesson[0].text
                        delete lesson[0].downloadFile

                        delete student[0].password
                        let data = student[0]
                        data.lesson = lesson[0]
                        data.jwt = jwt.signUser(userID)
                        chatRoom.setAvatarUrl(student.chatrooms, (newChatrrom)=> {
                            student.chatrooms = newChatrrom

                            response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                res.json(result)

                            })
                        })

                    })

                }
            })
        }
    }

});

router.post('/student/placement', (req, res)=> {

    if (req.body.lsnId == undefined) {
        req.body.lsnId = req.body._id

    }
    if (req.body.usrId == undefined) {
        var token = req.headers.authorization.split(" ")[1];
        var verify = jwt.verify(token);
        req.body.username = verify.userID
        logger.info("placeInfo", req.body)

        if (req.body.lsnId == undefined) {
            let errData = {"_id": "وارد کردن شناسه ی درس ضروری است."}
            response.validation('اطلاعات وارد شده صحیح نیست.', errData, "required", (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.body.lsnId == "0") {
                req.body.lsnId = parseInt(req.body.lsnId)
                database.stuPlacement(req.body, (lesson)=> {
                    if (lesson == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                            res.json(result)
                        })
                    }
                    else if (lesson == 0) {
                        response.respondNotFound('درسی ثبت نشده است.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        response.response('اطلاعات مربوط به درس اول:', lesson, (result)=> {
                            res.json(result)
                        })
                    }

                })
            }
            else {
                database.stuPlacement(req.body, (lesson)=> {
                    if (lesson == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (lesson == 0) {
                        response.respondNotFound('چنین درسی ثبت نشده است.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        response.response('اطلاعات مربوط به درس :', lesson, (result)=> {
                            res.json(result)
                        })
                    }
                })
            }
        }
    }
    else {

        database.getStudentById(req.body.usrId, (stu)=> {
            if (stu == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (stu == 0) {
                response.respondNotFound('چنین کاربری ثبت نشده است.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                req.body.username = stu.username
                logger.info("placeInfo", req.body)

                if (req.body.lsnId == undefined) {
                    let errData = {"_id": "وارد کردن شناسه ی درس ضروری است."}
                    response.validation('اطلاعات وارد شده صحیح نیست.', errData, "required", (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (req.body.lsnId == "0") {
                        req.body.lsnId = parseInt(req.body.lsnId)
                        database.stuPlacement(req.body, (lesson)=> {
                            if (lesson == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (lesson == 0) {
                                response.respondNotFound('درسی ثبت نشده است.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                if (req.body.lsnId != "0") {
                                    database.deleteResultNotLessonUser(req.body.lsnId, req.body.usrId, (deleted)=> {
                                        response.response('اطلاعات مربوط به درس :', lesson, (result)=> {
                                            res.json(result)
                                        })
                                    })

                                }
                                else {
                                    response.response('اطلاعات مربوط به درس :', lesson, (result)=> {
                                        res.json(result)
                                    })
                                }
                            }

                        })
                    }
                    else {
                        database.stuPlacement(req.body, (lesson)=> {
                            if (lesson == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (lesson == 0) {
                                response.respondNotFound('چنین درسی ثبت نشده است.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {

                                if (req.body.lsnId != "0") {
                                    database.deleteResultNotLessonUser(req.body.lsnId, req.body.usrId, (deleted)=> {
                                        response.response('اطلاعات مربوط به درس :', lesson, (result)=> {
                                            res.json(result)
                                        })
                                    })

                                }
                                else {
                                    response.response('اطلاعات مربوط به درس :', lesson, (result)=> {
                                        res.json(result)
                                    })
                                }


                            }
                        })
                    }
                }
            }
        })
    }

});

router.get('/student/placement', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    req.body.lsnId = req.body._id
    req.body.username = verify.userID

    database.getStudentByUsername(req.body.username, (stu)=> {
        if (stu == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            database.getStuPlacement(stu[0]._id, (place)=> {
                if (place == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }

                else {
                    let result = {}
                    if (place == 0) {
                        result.placement = false
                    }
                    else {
                        result.placement = true
                    }
                    response.response('اطلاعات مربوط به درس :', result, (result1)=> {
                        res.json(result1)
                    })
                }
            })
        }

    })
});

router.put('/student/:stdId', (req, res) => {
    if (req.body.password == "")
        delete req.body.password
    if (req.body.password)
        req.body.password = hashHelper.hash(req.body.password)
    if (req.body.fname == "") {
        delete req.body.fname
    }
    if (req.body.lname == "") {
        delete req.body.lname
    }
    if (req.body.mobile == "") {
        delete req.body.mobile
    }
    if (req.body.purchaseStatus == "") {
        delete req.body.purchaseStatus
    }
    if (req.body.avatarUrl == "") {
        delete req.body.avatarUrl
    }
    if (req.body.score == "") {
        delete req.body.score
    }
    if (req.body.lastPassedLesson == "") {
        delete req.body.lastPassedLesson
    }
    if (req.body.passedLessonScore == "") {
        delete req.body.passedLessonScore
    }
    if (req.files || req.files == "") {
        trim.expressTrimmer(req, (req)=> {

            database.getStudentById(req.params.stdId, (student)=> {
                if (student == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (student == 0) {
                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (student.avatarUrl == undefined) {
                        student.avatarUrl = ""
                    }
                    var unlinkPath = student.avatarUrl.replace(`${config.downloadPathStuImage}`, `${config.uploadPathStuImage}`);
                    fs.unlink(unlinkPath, function (err) {
                        try {
                            if (req.files.file != null) {
                                var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.file.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathStuImage}/${req.params.stdId}/`;
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
                                            req.body.avatarUrl = path.replace(`${config.uploadPathStuImage}`, `${config.downloadPathStuImage}`)
                                            database.updateStudent(req.body, req.params.stdId, (Putresult)=> {
                                                if (Putresult == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == 0) {
                                                    response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (Putresult == -2) {
                                                    errData = {"username": ["نام کاربری نمیتواند تکراری باشد"]}
                                                    response.validation('کاربر مورد نظر یافت نشد.', errData, "duplicated", (result)=> {
                                                        res.json(result)
                                                    })
                                                }

                                                else {
                                                    delete Putresult.password
                                                    chatRoom.setAvatarUrl(Putresult.chatrooms, (newChatrrom)=> {
                                                        Putresult.chatrooms = newChatrrom

                                                        response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                                                            res.json(result)

                                                        })
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
            })

        })
    }

    else {
        req.body.password = hashHelper.ConvertToEnglish(req.body.password)
        if (req.body.mobile) {
            req.body.mobile = hashHelper.ConvertToEnglish(req.body.mobile)

        }

        database.updateStudent(req.body, req.params.stdId, (Putresult)=> {
            if (Putresult == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (Putresult == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                delete Putresult.password
                chatRoom.setAvatarUrl(Putresult.chatrooms, (newChatrrom)=> {
                    Putresult.chatrooms = newChatrrom

                    response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                        res.json(result)

                    })
                })

            }
        });
    }

});

router.put('/student/:stdId/purchaseRequest', (req, res)=> {
    database.updateStudent(req.body, req.params.stdId, (Putresult)=> {
        if (Putresult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (Putresult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            delete Putresult.password
            response.response('اطلاعات تغییر یافت', Putresult[0], (result)=> {
                res.json(result)

            })
        }
    });
});

router.put('/student/:stdId/changePass', (req, res) => {
    if (req.body.oldPassword == undefined) {
        let errData = {"OldPassword": "پسورد را وارد کنید"}
        response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
            res.json(result)
        })
    }
    else {
        req.body.oldPassword = hashHelper.hash(req.body.oldPassword)
        req.body.password = hashHelper.ConvertToEnglish(req.body.password)
        req.body.password = hashHelper.hash(req.body.newPassword)
        database.getStudentById(req.params.stdId, (student)=> {
            if (student == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (student == 0) {
                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (req.body.oldPassword == student.password) {
                    let newStudent = Object.assign({}, student, req.body)
                    database.updateStudent(newStudent, req.params.stdId, (Putresult)=> {
                        if (Putresult == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (Putresult == 0) {
                            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            delete Putresult.password
                            response.response('اطلاعات تغییر یافت', Putresult, (result)=> {
                                res.json(result)

                            })
                        }
                    })
                }
                else {
                    let errData = {"OldPassword": "پسورد اشتباه است"}
                    response.validation('اطلاعات وارد شده صحیح نمیباشد', errData, "required", (result)=> {
                        res.json(result)
                    })
                }
            }
        })
    }


});

router.get('/student', (req, res) => {
    database.getAdmins((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('اطلاعات همه ی ادمین ها', getResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/student/best', (req, res) => {
    database.getAllStu((getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let index = []

            for (var i = 0; i < getResult.length; i++) {
                if (getResult[i].lesson[0] == undefined) {
                    index.push(getResult[i]._id)

                }
                else {
                    getResult[i].lesson = getResult[i].lesson[0]

                }
            }
            for (var k = 0; k < getResult.length; k++) {
                for (var p = 0; p < index.length; p++) {
                    if (getResult[k]._id == index[p]) {
                        getResult.splice(k, 1)
                    }
                }
            }

            let temp = []
            let length = getResult.length
            if (length <= 3) {
                database.getAllLessons((lessons)=> {
                    for (var p = 0; p < getResult.length; p++) {
                        let k = 0
                        getResult[p].lesson.level = getResult[p].level[0]
                        delete getResult[p].level
                        if (getResult[p].score == 0) {
                            getResult[p].progress = 0
                        }
                        else {
                            for (var i = 0; i < lessons.length; i++) {
                                if (lessons[i]._id == getResult[p].lesson._id) {
                                    k = i
                                }
                            }
                            let progress = (k + 1) / lessons.length

                            getResult[p].progress = progress
                        }

                    }

                    response.response('اطلاعات بهترین دانش آموزان', getResult, (result)=> {
                        res.json(result)

                    })

                })

            }
            else {

                temp[0] = getResult[length - 1]
                temp[1] = getResult[length - 2]
                temp[2] = getResult[length - 3]
                database.getAllLessons((lessons)=> {
                    for (var p = 0; p < temp.length; p++) {
                        let k = 0
                        temp[p].lesson.level = temp[p].level[0]
                        delete temp[p].level
                        if (temp[p].score == 0) {
                            temp[p].progress = 0
                        }
                        else {
                            for (var i = 0; i < lessons.length; i++) {
                                if (lessons[i]._id == temp[p].lesson._id) {
                                    k = i
                                }
                            }
                            let progress = (k + 1) / lessons.length

                            temp[p].progress = progress
                        }

                    }

                    response.response('اطلاعات بهترین دانش آموزان', temp, (result)=> {
                        res.json(result)

                    })

                })
            }
        }
    })
});

router.get('/student/bestOfLevel', (req, res) => {
    database.getAllStu((allStudents)=> {
        if (allStudents == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (allStudents == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            var token = req.headers.authorization.split(" ")[1];
            var verify = jwt.verify(token);
            let username = verify.userID
            database.getStudentByUsername(username, (student)=> {
                if (student == 0) {
                    response.respondNotFound('دانش آموز مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    let lsnId = student[0].view.lsnId
                    if (student[0].view.lsnId == 0) {
                        lsnId = student[0].lastPassedLesson
                    }
                    database.getLessonById(lsnId, (lesson)=> {
                        if (lesson == 0 || lesson == 0) {
                            response.respondNotFound('دانش آموز مورد نظر یافت نشد.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            let levelStu = []
                            let lvlId = lesson[0].lvlId
                            for (var i = 0; i < allStudents.length; i++) {
                                if (allStudents[i].lesson[0]) {
                                    if (allStudents[i].lesson[0].lvlId == lvlId) {
                                        levelStu.push(allStudents[i])
                                    }
                                }

                            }
                            allStudents = hashHelper.arrUnique(allStudents)
                            levelStu = hashHelper.arrUnique(levelStu)

                            let temp = allStudents

                            let length = levelStu.length
                            if (length <= 3) {
                                logger.info("leveleStu", levelStu)

                                database.getAllLessons((lessons)=> {
                                    for (var p = 0; p < levelStu.length; p++) {
                                        levelStu[p].lesson = lesson[0]
                                        delete levelStu[p].level
                                        let k = 0
                                        if (levelStu[p].score == 0) {
                                            levelStu[p].progress = 0
                                        }
                                        else {
                                            for (var i = 0; i < lessons.length; i++) {
                                                if (lessons[i]._id == temp[p].lesson._id) {
                                                    k = i
                                                }
                                            }
                                            let progress = (k + 1) / lessons.length

                                            levelStu[p].progress = progress
                                        }

                                    }

                                    response.response('اطلاعات بهترین دانش آموزان', levelStu, (result)=> {
                                        res.json(result)

                                    })

                                })


                            }
                            else {
                                delete lesson[0].video
                                delete lesson[0].sound
                                delete lesson[0].text
                                delete lesson[0].downloadFile


                                let i = 0
                                for (var k = 0; k < levelStu.length; k++) {
                                    levelStu[k].lesson = lesson[0]
                                    delete levelStu[k].level
                                    if (levelStu[k]._id == student[0]._id) {
                                        i = k
                                    }
                                }
                                temp[0] = levelStu[length - 1]
                                temp[0].rank = 1
                                if (i != 0 && i != length - 1) {
                                    temp[1] = levelStu[i]
                                    temp[1].rank = i
                                }
                                else {
                                    if (i == 0) {
                                        temp[1] = levelStu[1]
                                        temp[1].rank = levelStu.length - 1
                                    }
                                    else if (i == length - 1) {
                                        temp[1] = levelStu[length - 2]
                                        temp[1].rank = 2
                                    }

                                }

                                temp[2] = levelStu[0]
                                temp[2].rank = levelStu.length


                                temp = hashHelper.arrUnique(temp)

                                database.getAllLessons((lessons)=> {
                                    for (var p = 0; p < temp.length; p++) {
                                        let k = 0
                                        if (temp[p].score == 0) {
                                            temp[p].progress = 0
                                        }
                                        else {
                                            for (var i = 0; i < lessons.length; i++) {
                                                if (lessons[i]._id == temp[p].lesson._id) {
                                                    k = i
                                                }
                                            }
                                            let progress = (k + 1) / lessons.length

                                            temp[p].progress = progress
                                        }

                                    }

                                    response.response('اطلاعات بهترین دانش آموزان', temp, (result)=> {
                                        res.json(result)

                                    })

                                })

                            }
                        }
                    })
                }
            })
        }
    })


});

router.get('/student/prCrNxtLesson', (req, res) => {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == 0) {
            response.respondNotFound('دانش آموز مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            // let lsnId = student[0].lastPassedLesson
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
                                            database.getPrCrNxtLesson(lsnId, (getResult)=> {
                                                if (getResult == -1) {
                                                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else if (getResult == 0) {
                                                    response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                        res.json(result)
                                                    })
                                                }
                                                else {
                                                    for (var i = 0; i < getResult.length; i++) {
                                                        if (getResult[i].position == "current") {
                                                            if (!checkPaid) {
                                                                if (getResult[i]._id == resultOfUser[0].lsnId) {
                                                                    getResult[i].position = "current"
                                                                }
                                                                else {
                                                                    getResult[i].position = "notPaid"
                                                                }

                                                            }
                                                        }
                                                    }
                                                    response.respondDeleted('اطلاعات درسها', getResult, (result)=> {
                                                        res.json(result)

                                                    })
                                                }
                                            })


                                        }
                                    })
                                }
                                else {
                                    database.getPrCrNxtLesson(usrLsnId, (getResult)=> {
                                        if (getResult == -1) {
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else if (getResult == 0) {
                                            response.respondNotFound('درس مورد نظر یافت نشد.', [], (result)=> {
                                                res.json(result)
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
                                                        if (resultInfo.examTimePassed != "0") {
                                                            if (typeof resultInfo.examTimePassed == 'string')
                                                                resultInfo.examTimePassed = parseInt(resultInfo.examTimePassed)
                                                            let passExam = moment(resultInfo.examTimePassed).add(24, 'h').format('x')
                                                            let currentTimeExam = new Date().getTime()
                                                            examPermissionPassLessonNO = (currentTimeExam < passExam)
                                                        }
                                                        if (currentTime < pass || examPermissionPassLessonNO) {
                                                            if (checkPaid) {
                                                                for (var i = 0; i < getResult.length; i++) {
                                                                    if (getResult[i].position == "current") {
                                                                        getResult[i].position = "notPaid"
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                for (var i = 0; i < getResult.length; i++) {
                                                                    if (getResult[i].position == "current") {
                                                                        getResult[i].position = "notPaid"
                                                                        if (getResult[i]._id == resultOfUser[0].lsnId) {
                                                                            getResult[i].position = "current"
                                                                        }
                                                                    }

                                                                }

                                                            }
                                                            response.respondDeleted('اطلاعات درسها', getResult, (result)=> {
                                                                res.json(result)

                                                            })
                                                        }
                                                        else {
                                                            if (!checkPaid) {
                                                                for (var i = 0; i < getResult.length; i++) {
                                                                    if (getResult[i].position == "current") {
                                                                        getResult[i].position = "notPaid"
                                                                        if (getResult[i]._id == resultOfUser[0].lsnId) {
                                                                            getResult[i].position = "current"
                                                                        }
                                                                    }

                                                                }


                                                            }

                                                            response.respondDeleted('اطلاعات درسها', getResult, (result)=> {
                                                                res.json(result)

                                                            })
                                                        }
                                                    }
                                                    else {
                                                        logger.info("checkPaid", checkPaid)
                                                        if (!checkPaid) {
                                                            for (var i = 0; i < getResult.length; i++) {
                                                                if (getResult[i].position == "current") {
                                                                    getResult[i].position = "notPaid"
                                                                    if (getResult[i]._id == resultOfUser[0].lsnId) {
                                                                        getResult[i].position = "current"
                                                                    }
                                                                }

                                                            }

                                                        }
                                                        response.respondDeleted('اطلاعات درسها', getResult, (result)=> {
                                                            res.json(result)

                                                        })
                                                    }


                                                }
                                            })

                                            // response.respondDeleted('اطلاعات درسها', getResult, (result)=> {
                                            //     res.json(result)
                                            //
                                            // })
                                        }
                                    })

                                }
                            }
                        })

                    }
                })

            })


        }
    })
});

router.get('/student/:stdId', (req, res) => {
    database.getStudentById(req.params.stdId, (getResult)=> {
        if (getResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (getResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let lsnId = getResult.view.lsnId
            if (getResult.view.lsnId == 0) {
                lsnId = getResult.lastPassedLesson

            }
            database.getLessonById(lsnId, (lesson)=> {
                database.getExamPassedCount(getResult._id, (exam)=> {
                    chatRoom.setAvatarUrl(getResult.chatrooms, (newChatrrom)=> {
                        getResult.chatrooms = newChatrrom
                        getResult.examPassed = exam.length
                        if (getResult.score == 0) {
                            delete getResult.password
                            let data = getResult
                            data.progress = 0
                            delete lesson[0].video
                            delete lesson[0].sound
                            delete lesson[0].text
                            delete lesson[0].downloadFile
                            data.lesson = lesson[0]
                            response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                res.json(result)

                            })

                        }
                        else {
                            statistic.calculateProgress(lesson[0]._id, (progress)=> {
                                if (progress != -1) {
                                    let data = getResult
                                    data.progress = progress
                                    delete getResult.password
                                    delete lesson[0].video
                                    delete lesson[0].sound
                                    delete lesson[0].text
                                    delete lesson[0].downloadFile

                                    data.lesson = lesson[0]
                                    response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                        res.json(result)

                                    })
                                }
                                else {
                                    delete getResult.password
                                    let data = getResult
                                    delete lesson[0].video
                                    delete lesson[0].sound
                                    delete lesson[0].text
                                    delete lesson[0].downloadFile

                                    data.lesson = lesson[0]
                                    response.response('ورود با موفقیت انجام شد', data, (result)=> {
                                        res.json(result)

                                    })
                                }
                            })
                        }

                    })

                })
            })
        }
    })
});


router.delete('/admin/:admId', (req, res) => {
    database.delAdmin(req.params.admId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == -4) {
            response.validation('آخرین ادمین قابل حذف شدن نیست.', {}, 'lastAdmin', (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات همه ی ادمین ها', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/supporter/:supId', (req, res) => {
    database.delSupporter(req.params.supId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات مورد نظر حذف شد', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/chatAdmin/:caId', (req, res) => {
    database.delChatAdmin(req.params.caId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات مورد نظر حذف شد', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/tutor/:tId', (req, res) => {
    database.delTutor(req.params.tId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات مورد نظر حذف شد', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/cp/:cpId', (req, res) => {
    database.delCp(req.params.cpId, (deleteResult)=> {
        if (deleteResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (deleteResult == 0) {
            response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات مورد نظر حذف شد', deleteResult, (result)=> {
                res.json(result)

            })
        }
    })
});

router.delete('/student/:stdId', (req, res) => {
    database.getStudentById(req, params.stdId, (getResult)=> {
        if (getResult == -1) {
            res.status(500).end('')
        }
        else if (getResult == 0) {
            res.status(404).end('')
        }
        else {
            if (getResult.avatarUrl) {
                var unlinkPath = getResult.url.replace(`${config.downloadPathStuImage}`, `${config.uploadPathStuImage}`);
                fs.unlink(unlinkPath, function (err) {
                    if (err) {
                        res.status(500).end('')
                    }
                    else {
                        database.delStudent(req.params.stdId, (deleteResult)=> {
                            if (deleteResult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (deleteResult == 0) {
                                response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                response.respondDeleted('اطلاعات مورد نظر حذف شد.', deleteResult, (result)=> {
                                    res.json(result)

                                })
                            }
                        });
                    }
                })
            }
            else {
                database.delStudent(req.params.stdId, (deleteResult)=> {
                    if (deleteResult == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (deleteResult == 0) {
                        response.respondNotFound('کاربر مورد نظر یافت نشد.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        response.respondDeleted('اطلاعات مورد نظر حذف شد.', deleteResult, (result)=> {
                            res.json(result)

                        })
                    }
                })
            }
        }
    })
});


module.exports = router




