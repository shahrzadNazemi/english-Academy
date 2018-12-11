var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let response = require('../util/responseHelper')


router.post('/', (req, res)=> {
    if (req.body.lvl_description == undefined) {
        response.validation('فرستادن توضیحات الزامی است', 'required', (result)=> {
            res.json(result)
        })
    }
    else if (req.body.lvl_title == undefined) {
        response.validation('فرستادن عنوان الزامی است', 'required', (result)=> {
            res.json(result)
        })
    }
    else if (req.body.lvl_description.length < req.body.lvl_title) {
        response.validation('توضیحات نمیتواند کمتر از عنوان باشد', 'length', (result)=> {
            res.json(result)
        })
    }
    else if (req.body.lvl_description.length < 3) {
        response.validation('توضیحات نمیتواند کمتر از 3 باشد', 'length', (result)=> {
            res.json(result)
        })
    }
    else if (req.body.lvl_title.length < 3) {
        response.validation('عنوان نمیتواند کمتر از 3 باشد', 'length', (result)=> {
            res.json(result)
        })
    }
    else {
        database.addLevel(req.body, (addResult)=> {
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
})

router.put('/:lvlId', (req, res)=> {
    database.updateLevel(req.body, req.params.lvlId, (updateResult)=> {
        if (updateResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (updateResult == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.responseUpdated('اطلاعات با موقیت تغییر یافت', updateResult, (result)=> {
                res.json(result)

            })
        }
    })
})

router.delete('/:lvlId', (req, res)=> {
    database.delLevel(req.params.lvlId, (delResult)=> {
        if (delResult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (delResult == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.respondDeleted('اطلاعات با موفقیت حذف شد.', delResult, (result)=> {
                res.json(result)

            })
        }
    })
})

router.get('/:lvlId', (req, res)=> {
    database.getLevelById(req.params.lvlId, (level)=> {
        if (level == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (level == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('سطح مورد نظر یافت شد.', level, (result)=> {
                res.json(result)

            })
        }
    })
})

router.get('/', (req, res)=> {
    database.getLevels((getREsult)=> {
        if (getREsult == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }
        else if (getREsult == 0) {
            response.respondNotFound('سطح مورد نظر یافت نشد.', '', (result)=> {
                res.json(result)
            })
        }
        else {
            response.response('سطح مورد نظر یافت شد.', getREsult, (result)=> {
                res.json(result)

            })
        }
    })
    // res.json({"status":"success"})
})


module.exports = router