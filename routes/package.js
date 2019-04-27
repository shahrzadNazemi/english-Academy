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
    logger.info("package" , req.body)
    database.addPackage(req.body, (addResult)=> {
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

router.put('/:pgId', (req, res)=> {
            database.updatePackage(req.body, req.params.pgId, (result)=> {
                if (result == -1) {
                    response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                        res.json(result)
                    })
                }
                else if (result == 0) {
                    response.respondNotFound('پکیج مورد نظر یافت نشد', {}, (result)=> {
                        res.json(result)
                    })
                }
                else {
                    response.response('عملیات با موفقیت انجام شد', result, (result)=> {
                        res.json(result)

                    })
                }
            })
});

router.delete('/:pgId', (req, res)=> {
    database.delPackage(req.params.pgId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('پکیج مورد نظر یافت نشد.', {}, (result)=> {
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

router.get('/:pgId', (req, res)=> {
    database.getPackageById(req.params.pgId, (chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('پکیج مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('پکیج مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })

});

router.get('/', (req, res)=> {
    database.getAllPackages((chatroom)=> {
        if (chatroom == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', {}, (result)=> {
                res.json(result)
            })
        }
        else if (chatroom == 0) {
            response.respondNotFound('پکیج مورد نظر یافت نشد.', [], (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('پکیج مورد نظر یافت شد.', chatroom, (result)=> {
                res.json(result)

            })
        }
    })

});


module.exports = router
