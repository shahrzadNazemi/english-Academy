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
let lesson = require('../routes/lesson')
let fs = require('fs');
let jwt = require('../util/jwtHelper')
const trim = require('../util/trimmer')


router.post('/', (req, res)=> {
    trim.expressTrimmer(req, (req)=> {
        logger.info("req.body", req.body)
        if (req.body.lesson && typeof req.body.lesson == "string") {
            req.body.lesson = JSON.parse(req.body.lesson)
            req.body.level = {}
        }
        else if (req.body.level) {
            req.body.level = JSON.parse(req.body.level)
            req.body.lesson = {}
        }
        if (req.files) {
            if (req.files.file != null) {
                database.addChatroom(req.body, (addResult)=> {
                        if (addResult == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (addResult == -2) {
                            let errData = {"duplicated": "این چت روم برای این درس یا لول وجود دارد"}
                            response.validation('این چت روم برای این درس یا لول وجود دارد', errData, "duplicated", (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            req.body._id = addResult
                            // res.json(req.body)
                            var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                            var file = req.files.file.name.replace(`.${extension}`, '');
                            var newFile = new Date().getTime() + '.' + extension;
                            // path is Upload Directory
                            var dir = `${config.uploadPathChatroomImage}/${req.body._id}/`;
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
                                        req.body.avatarUrl = path.replace(`${config.uploadPathChatroomImage}`, `${config.downloadPathChatroomImage}`)
                                        // req.body._id = (req.body._id.replace(/"/g, ''));
                                        database.updateChatroom(req.body, req.body._id, (result)=> {
                                            if (result == -1) {
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else if (result == 0) {
                                                response.respondNotFound(' مورد نظر یافت نشد', {}, (result)=> {
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
                    }
                )
            }
            else {
                let errData = {"file": "فایلی به این نام فرستاده نشده است"}
                response.validation('فایلی به این نام فرستاده نشده است', errData, "required", (result)=> {
                    res.json(result)
                })
            }
        }
        else {
            req.body.avatarUrl = ""
            database.addChatroom(req.body, (addResult)=> {
                if (addResult == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (addResult == -2) {
                    let errData = {"duplicated": "این چت روم برای این درس یا لول وجود دارد"}
                    response.validation('این چت روم برای این درس یا لول وجود دارد', errData, "duplicated", (result)=> {
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
});

router.put('/:chId', (req, res)=> {
    trim.expressTrimmer(req, (req)=> {
        if (req.body.lesson) {
            req.body.lesson = JSON.parse(req.body.lesson)
            req.body.level = {}
        }
        else if (req.body.level) {
            req.body.level = JSON.parse(req.body.level)
            req.body.lesson = {}
        }
        if (req.files) {
            database.getChatroomById(req.params.chId, (result)=> {
                if (result == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (result == 0) {
                    response.respondNotFound('چتروم مورد نظر یافت نشد', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    if (result.avatarUrl != undefined) {
                        var unlinkPath = result.avatarUrl.replace(`${config.downloadPathChatroomImage}`, `${config.uploadPathChatroomImage}`);
                        fs.unlink(unlinkPath, function (err) {
                            try {
                                if (req.files.file != null) {
                                    req.body._id = result._id
                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathChatroomImage}/${req.body._id}/`;
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
                                                req.body.avatarUrl = path.replace(`${config.uploadPathChatroomImage}`, `${config.downloadPathChatroomImage}`)
                                                database.updateChatroom(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
                                                    if (result == -1) {
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                            res.json(result)
                                                        })
                                                    }
                                                    else if (result == 0) {
                                                        response.respondNotFound('چت روم مورد نظر یافت نشد', {}, (result)=> {
                                                            res.json(result)
                                                        })
                                                    }
                                                    else {
                                                        response.response('عملیات با موفقیت انجام شد', result, (result1)=> {
                                                            res.json(result1)

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
                            req.body._id = result._id
                            var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                            var file = req.files.file.name.replace(`.${extension}`, '');
                            var newFile = new Date().getTime() + '.' + extension;
                            // path is Upload Directory
                            var dir = `${config.uploadPathChatroomImage}/${req.body._id}/`;
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
                                        req.body.avatarUrl = path.replace(`${config.uploadPathChatroomImage}`, `${config.downloadPathChatroomImage}`)
                                        database.updateChatroom(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
                                            if (result == -1) {
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else if (result == 0) {
                                                response.respondNotFound('چت روم مورد نظر یافت نشد', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                response.response('عملیات با موفقیت انجام شد', result, (result1)=> {
                                                    res.json(result1)

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
            database.updateChatroom(req.body, req.params.chId, (result)=> {
                if (result == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (result == 0) {
                    response.respondNotFound('چت روم مورد نظر یافت نشد', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.response('عملیات با موفقیت انجام شد', result, (result)=> {
                        res.json(result)

                    })
                }
            })
        }
    })
});

router.delete('/:chId', (req, res)=> {
    database.delChatroom(req.params.chId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', chatroom, (result)=> {
                res.json(result)

            })


        }
    })
});

router.get('/:chId/reported', (req, res)=> {
    database.getreportedMsgChatRoom(req.params.chId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/:chId/student/', (req, res)=> {
    database.studentByChId(req.params.chId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/:chId/student/blocked', (req, res)=> {
    database.getBlockedStuOfChatRoom(req.params.chId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/tutor/:trId/closed', (req, res)=> {
    database.getClosedChatsOfTutor(req.params.trId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom[0].closedStudents, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/tutor/:trId/open', (req, res)=> {
    database.getOpenChatsOfTutor(req.params.trId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom[0].openStudents, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/tutor/:trId/student/:usrId', (req, res)=> {
    database.getMsgByTutorStudent(req.params.trId,req.params.usrId , (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })

});


router.get('/chatAdmin/:caId', (req, res)=> {
    database.getChatroomByChatAdmin(req.params.caId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {

            if (req.query.page) {
                response.paginationClient(req.query.page, req.query.limit, chatroom, (result1)=> {
                    let countPages = Math.ceil(chatroom.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی چت روم', result1, (result)=> {
                        res.json(result)
                    })
                })
            }
            else {
                response.response('چت روم مورد نظر یافت شد.', chatroom, (result)=> {
                    res.json(result)

                })
            }

        }
    })

});

router.get('/selective', (req, res)=> {
    database.getAllChatrooms((lesson)=> {
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
            response.response('اطلاعات همه ی چت روم ها', temp, (result)=> {
                res.json(result)
            })

        }
    })
});


router.get('/:chId', (req, res)=> {
    database.getChatroomById(req.params.chId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('چت روم مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    database.getAllChatrooms((chatroom)=> {
        
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('چت روم مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.paginationClient(req.query.page, req.query.limit, chatroom, (result1)=> {
                let countPages = Math.ceil(chatroom.length / req.query.limit)
                result1.totalPage = countPages
                response.response('چت روم مورد نظر یافت شد.', result1, (result)=> {
                    res.json(result)

                })
            })
        }
    })

});


module.exports = router

module.exports.setAvatarUrl = (chatRoom , cb)=>{
    for(var i=0;i<chatRoom.length;i++){
        if(chatRoom[i].position == "lastLesson"){
            chatRoom[i].avatarUrl = config.lastLessonChatrrom
        }
        if(chatRoom[i].position == "currentLesson"){
            chatRoom[i].avatarUrl = config.currentLessonChatrrom
        }
        if(chatRoom[i].position == "currentLevel"){
            chatRoom[i].avatarUrl = config.currentLevelChatrrom
        }
    }
    cb(chatRoom)
}

