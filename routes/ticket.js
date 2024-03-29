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
    logger.info("body", req.body)
    trim.expressTrimmer(req, (req)=> {
        req.body.time = new Date().getTime()
        if (typeof req.body.msg == "string") {
            req.body.msg = JSON.parse(req.body.msg)
        }
        req.body.msg.time = new Date().getTime()
        if (req.body.depId == undefined || req.body.depId == "") {
            let errData = {"depId": "وارد کردن شناسه ی دپارتمان ضروری است."}
            response.validation('اطلاعات وارد شده صحیح نیست.', errData, "required", (result)=> {
                res.json(result)
            })
        }
        if (req.body.usrId == undefined || req.body.usrId == "") {
            let errData = {"usrId": "وارد کردن شناسه ی یورز ضروری است."}
            response.validation('اطلاعات وارد شده صحیح نیست.', errData, "required", (result)=> {
                res.json(result)
            })
        }
        if (req.body.msg == undefined || req.body.msg == "") {
            let errData = {"msg": "وارد کردن   متن ضروری است."}
            response.validation('اطلاعات وارد شده صحیح نیست.', errData, "required", (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.files) {
                if (req.files.img != null) {
                    database.addTicket(req.body, (addResult)=> {
                            if (addResult == -1) {
                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                    res.json(result)
                                })
                            }
                            else {
                                req.body._id = addResult._id
                                // res.json(req.body)
                                var extension = req.files.img.name.substring(req.files.img.name.lastIndexOf('.') + 1).toLowerCase();
                                var file = req.files.img.name.replace(`.${extension}`, '');
                                var newFile = new Date().getTime() + '.' + extension;
                                // path is Upload Directory
                                var dir = `${config.uploadPathTicketImg}/${req.body._id}/`;
                                console.log("dir", dir)
                                lesson.addDir(dir, function (newPath) {
                                    var path = dir + newFile;
                                    req.files.img.mv(path, function (err) {
                                        if (err) {
                                            console.error(err);
                                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                res.json(result)
                                            })
                                        }
                                        else {
                                            req.body.msg._id = addResult.msg._id
                                            req.body.msg.image = path.replace(`${config.uploadPathTicketImg}`, `${config.downloadPathTicketImg}`)
                                            // req.body._id = (req.body._id.replace(/"/g, ''));
                                            database.updateTicket(req.body, req.body._id, (result)=> {
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
                database.addTicket(req.body, (addResult)=> {
                    if (addResult == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else {
                        req.body._id = addResult
                        addResult.msg = [addResult.msg]
                        response.responseCreated('اطلاعات با موفقیت ثبت شد.', addResult, (result)=> {
                            res.json(result)

                        })
                    }
                })
            }
        }
    })

});

router.post('/department', (req, res)=> {

    database.addTypeOfTicket(req.body, (addResult)=> {
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

});

router.put('/department/:depId', (req, res)=> {
    database.updateTypeOfTicket(req.body, req.params.depId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('اطلاعات مورد نظر یافت نشد', {}, (result)=> {
                res.json(result)
            })

        }
        else {
            response.responseCreated('ویرایش با موفقیت انجام شد.', result, (result2)=> {
                res.json(result2)

            })
        }
    })

});

router.delete('/department/:depId', (req, res)=> {
    database.delTypeOfTicket(req.params.depId, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (result == 0) {
            response.respondNotFound('اطلاعات مورد نظر یافت نشد', {}, (result)=> {
                res.json(result)
            })

        }
        else if (result == -3) {
            let errData = {"department": ["دپارتمان قابل حذف شدن نیست."]}
            response.validation('دپارتمان قابل حذف شدن نیست.', errData, "hasTicket", (result)=> {
                res.json(result)
            })

        }
        else {
            response.responseCreated('حذف با موفقیت انجام شد.', result, (result2)=> {
                res.json(result2)

            })
        }
    })

});

router.get('/department', (req, res)=> {

    database.getTypeOfTicket((addResult)=> {
        if (addResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            let temp = []

            for (var i = 0; i < addResult.length; i++) {
                temp[i] = {}
                temp[i].label = addResult[i].title;
                temp[i].value = addResult[i]._id
            }
            response.response('اطلاعات همه ی دپارتمانها', temp, (result)=> {
                res.json(result)
            })
        }
    })

});

router.get('/department/:depId', (req, res)=> {
    database.getTypeOfTicketById(req.params.depId, (addResult)=> {
        if (addResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else {

            response.response('اطلاعات دپارتمان', addResult, (result)=> {
                res.json(result)
            })
        }
    })

});


router.put('/:tktId', (req, res)=> {
    trim.expressTrimmer(req, (req)=> {
        if (req.body.viewed) {
            database.updateTicketView(req.params.tktId, (result)=> {
                if (result == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (result == 0) {
                    response.respondNotFound('تیکت مورد نظر یافت نشد', {}, (result)=> {
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
        else {
            if (typeof req.body.msg == "string") {
                req.body.msg = JSON.parse(req.body.msg)
            }
            if (req.files) {
                if (req.body.msg) {
                    database.getTicketById(req.params.tktId, (result)=> {
                        if (result == -1) {
                            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else if (result == 0) {
                            response.respondNotFound('تیکت مورد نظر یافت نشد', {}, (result)=> {
                                res.json(result)
                            })
                        }
                        else {
                            let update = false

                            for (var i = 0; i < result.msg.length; i++) {
                                if (result.msg[i]._id == req.body.msg._id) {
                                    if (result.msg[i].img != undefined) {
                                        update = i
                                    }
                                }
                            }
                            if (update) {
                                if (result.msg[i].image == undefined) {
                                    result.msg[i].image = ""
                                }
                                var unlinkPath = result.msg[i].image.replace(`${config.downloadPathTicketImg}`, `${config.uploadPathTicketImg}`);
                                fs.unlink(unlinkPath, function (err) {
                                    try {
                                        if (req.files.img != null) {
                                            req.body._id = result._id
                                            var extension = req.files.img.name.substring(req.files.img.name.lastIndexOf('.') + 1).toLowerCase();
                                            var file = req.files.img.name.replace(`.${extension}`, '');
                                            var newFile = new Date().getTime() + '.' + extension;
                                            // path is Upload Directory
                                            var dir = `${config.uploadPathTicketImg}/${req.body._id}/`;
                                            console.log("dir", dir)
                                            lesson.addDir(dir, function (newPath) {
                                                var path = dir + newFile;
                                                req.files.img.mv(path, function (err) {
                                                    if (err) {
                                                        console.error(err);
                                                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                            res.json(result)
                                                        })
                                                    }
                                                    else {
                                                        req.body.msg.image = path.replace(`${config.uploadPathTicketImg}`, `${config.downloadPathTicketImg}`)
                                                        database.updateTicket(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                                if (req.files.img != null) {
                                    req.body._id = result._id
                                    var extension = req.files.img.name.substring(req.files.img.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.img.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathTicketImg}/${req.body._id}/`;
                                    console.log("dir", dir)
                                    lesson.addDir(dir, function (newPath) {
                                        var path = dir + newFile;
                                        req.files.img.mv(path, function (err) {
                                            if (err) {
                                                console.error(err);
                                                response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                                                    res.json(result)
                                                })
                                            }
                                            else {
                                                req.body.msg.image = path.replace(`${config.uploadPathTicketImg}`, `${config.downloadPathTicketImg}`)
                                                database.updateTicket(req.body, JSON.parse(JSON.stringify(req.body._id)), (result)=> {
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
                }
                else {
                    response.validation('مسیجی برای آپلود وجود ندارد.', {file: ["مسیجی برای آپلود وجود ندارد."]}, 'emptyFile', (result)=> {
                        res.json(result)
                    })

                }

            } else {
                database.updateTicket(req.body, req.params.tktId, (result)=> {
                    if (result == -1) {
                        response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                            res.json(result)
                        })
                    }
                    else if (result == 0) {
                        response.respondNotFound('تیکت مورد نظر یافت نشد', {}, (result)=> {
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
        }

    })

});

router.delete('/:tktId', (req, res)=> {
    database.delExam(req.params.exId, (exam)=> {
        if (exam == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (exam == 0) {
            response.respondNotFound('سوال مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', exam, (result)=> {
                res.json(result)

            })


        }
    })
});

router.get('/student/:stdId', (req, res)=> {
    database.getTicketByStuId(req.params.stdId, (ticket)=> {
        if (ticket == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (ticket == 0) {
            response.respondNotFound('تیکت مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            for (var i = 0; i < ticket.length; i++) {
                ticket[i].supporter = ticket[i].supporter[0]
                ticket[i].department = ticket[i].department[0]
                ticket[i].department.value = ticket[i].department._id
                delete ticket[i].department._id
                ticket[i].department.label = ticket[i].department.title
                delete ticket[i].department.title
            }
            response.response('تیکت مورد نظر یافت شد.', ticket, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/supporter/:supId', (req, res)=> {
    database.getTicketBySupId(req.params.supId, (ticket)=> {
        if (ticket == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (ticket == 0) {
            response.respondNotFound('تیکت مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.status) {
                let temp = []
                for (var i = 0; i < ticket.length; i++) {
                    if (ticket[i].supId == req.params.supId) {
                        ticket[i].choosed = true
                    }
                    if (ticket[i].status == req.query.status) {
                        temp.push(ticket[i])

                    }
                }
                ticket = temp

            }
            if (req.query.page) {
                response.paginationClient(req.query.page, req.query.limit, ticket, (result1)=> {
                    let countPages = Math.ceil(ticket.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی تیکتها', result1, (result)=> {
                        res.json(result)
                    })
                })
            }
            else {
                response.response('تیکت مورد نظر یافت شد.', ticket, (result)=> {
                    res.json(result)

                })
            }

        }
    })

});

router.get('/:tktId', (req, res)=> {
    database.getTicketById(req.params.tktId, (ticket)=> {
        if (ticket == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (ticket == 0) {
            response.respondNotFound('تیکت مورد نظر یافت نشد.', {}, (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('تیکت مورد نظر یافت شد.', ticket, (result)=> {
                res.json(result)

            })
        }
    })
});

router.get('/', (req, res)=> {
    database.getAllTickets(req.query.supId, (ticket)=> {
        if (ticket == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (ticket == 0) {
            response.respondNotFound('تیکت مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            if (req.query.status) {
                let temp = []
                for (var i = 0; i < ticket.length; i++) {
                    if (ticket[i].supId == req.query.supId) {
                        ticket[i].choosed = true
                    }
                    if (ticket[i].status == req.query.status) {
                        temp.push(ticket[i])

                    }
                }
                ticket = temp

            }
            else {
                for (var i = 0; i < ticket.length; i++) {
                    if (ticket[i].supId == req.query.supId) {
                        ticket[i].choosed = true
                    }
                }
            }

            if (req.query.page) {
                response.paginationClient(req.query.page, req.query.limit, ticket, (result1)=> {
                    let countPages = Math.ceil(ticket.length / req.query.limit)
                    result1.totalPage = countPages
                    response.response('اطلاعات همه ی تیکتها', result1, (result)=> {
                        res.json(result)
                    })
                })
            }
            else {
                response.response('تیکت مورد نظر یافت شد.', ticket, (result)=> {
                    res.json(result)

                })
            }
        }
    })

});

module.exports = router
