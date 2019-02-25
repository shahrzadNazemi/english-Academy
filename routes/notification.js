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
let config = require('../util/config');
let fs = require('fs')
let lesson = require('./lesson')
let jwt = require('../util/jwtHelper')


router.post('/', (req, res)=> {
    req.body.viewedUsers = []
    if (req.files) {
        if (req.body.avatarUrl == undefined) {
            req.body.avatarUrl = ""
        }
        if (req.files.file != null) {
            // type file
            database.addNotif(req.body, (notification)=> {
                if (notification == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    req.body._id = notification
                    // res.json(req.body)
                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                    var file = req.files.file.name.replace(`.${extension}`, '');
                    var newFile = new Date().getTime() + '.' + extension;
                    // path is Upload Directory
                    var dir = `${config.uploadPathNotifImage}/${req.body._id}/`;
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
                                req.body.avatarUrl = path.replace(`${config.uploadPathNotifImage}`, `${config.downloadPathNotifImage}`)
                                // req.body._id = (req.body._id.replace(/"/g, ''));
                                console.log("body", req.body)

                                database.updateNotif(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
        database.addNotif(req.body, (addResult)=> {
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
});

router.put('/:NId', (req, res)=> {
    database.getNotificationById(req.params.NId, (notification)=> {
        if (notification == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (notification == 0) {
            response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.files) {

                database.updateNotif(req.body, req.params.NId, (result)=> {
                    if (result == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == 0) {
                        response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        if(notification.avatarUrl== undefined){
                            notification.avatarUrl = ""
                        }
                        var unlinkPath = notification.avatarUrl.replace(`${config.downloadPathNotifImage}`, `${config.uploadPathNotifImage}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {
                                if (req.files.file != null) {
                                    req.body._id = notification._id
                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathNotifImage}/${req.body._id}/`;
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
                                                req.body.avatarUrl = path.replace(`${config.uploadPathNotifImage}`, `${config.downloadPathNotifImage}`)
                                                // var newLevel = Object.assign(req.body, level)
                                                database.updateNotif(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                })

            } else {

                database.updateNotif(req.body, req.params.NId, (result)=> {
                    if (result == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == 0) {
                        response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد', {}, (result)=> {
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


});

router.put('/:NId/view', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    database.getStudentByUsername(username, (student)=> {
        if (student == 0 || student == -1) {
            response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            req.body.viewedUsers = student[0]._id
            console.log("kjkdsajdka" , req.params.NId)
            database.getNotificationById(req.params.NId, (notification)=> {
                if (notification == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (notification == 0) {
                    response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    database.updateNotif(req.body, req.params.NId, (result)=> {
                        if (result == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == 0) {
                            response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            notification.viewed = true
                            response.response('ویرایش با موفقیت انجام شد', notification, (result)=> {
                                res.json(result)

                            })
                        }
                    })
                }
            })
        }
    })


});

router.delete('/:NId', (req, res)=> {
    database.getNotificationById(req.params.NId, (notification)=> {
        if (notification == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (notification == 0) {
            response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            if (notification.avatarUrl) {
                var unlinkPath = notification.avatarUrl.replace(`${config.downloadPathNotifImage}`, `${config.uploadPathNotifImage}`);
                fs.unlink(unlinkPath, function (err) {
                    try {
                        database.delNotification(req.params.NId, (delResult)=> {
                            if (delResult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else if (delResult == 0) {
                                response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
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
                    catch (e) {
                        console.log(e)
                    }
                })
            }
            else {
                database.delNotification(req.params.NId, (delResult)=> {
                    if (delResult == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (delResult == 0) {
                        response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
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

router.get('/:NId', (req, res)=> {
    database.getNotificationById(req.params.NId, (notification)=> {
        if (notification == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (notification == 0) {
            response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('نوتیفیکیشن مورد نظر یافت شد.', notification, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    var token = req.headers.authorization.split(" ")[1];
    var verify = jwt.verify(token);
    let username = verify.userID
    if(username != "userAdmin"){
        database.getStudentByUsername(username, (student)=> {
            if (student == 0 || student == -1) {
                response.respondNotFound(' مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                database.getAllNotifications((notification)=> {
                    if (notification == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (notification == 0) {
                        response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', [], (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        for(var i=0;i<notification.length;i++){
                            notification[i].viewed = false
                            for(var k=0;k<notification[i].viewedUsers.length;k++){
                                if(notification[i].viewedUsers[k] == student[0]._id){
                                    notification[i].viewed = true
                                }
                            }
                        }
                        if (req.query.page != undefined) {
                            response.paginationClient(req.query.page, req.query.limit, notification, (result1)=> {
                                let countPages = Math.ceil(notification.length / req.query.limit)
                                result1.totalPage = countPages
                                response.response('اطلاعات همه ی سوالات', result1, (result)=> {
                                    res.json(result)
                                })
                            })

                        }
                        else {
                            response.response('اطلاعات همه ی سوالات', notification, (result)=> {
                                res.json(result)
                            })
                        }

                    }
                })
            }
        })
    }
    else{
        database.getAllNotifications((notification)=> {
            if (notification == -1) {
                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                    res.json(result)
                })
            }
            else if (notification == 0) {
                response.respondNotFound('نوتیفیکیشن مورد نظر یافت نشد.', {}, (result)=> {
                    res.json(result)
                })
            }
            else {
                if (req.query.page != undefined) {
                    response.paginationClient(req.query.page, req.query.limit, notification, (result1)=> {
                        let countPages = Math.ceil(notification.length / req.query.limit)
                        result1.totalPage = countPages
                        response.response('اطلاعات همه ی سوالات', result1, (result)=> {
                            res.json(result)
                        })
                    })

                }
                else {
                    response.response('اطلاعات همه ی سوالات', notification, (result)=> {
                        res.json(result)
                    })
                }

            }
        })
        
    }

});


module.exports = router