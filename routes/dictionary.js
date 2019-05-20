var express = require('express');
var router = express.Router();
let logger = require('../util/logger');
let response = require('../util/responseHelper');
let fs = require('fs')
let config = require('../util/config')
var es = require('elasticsearch');
var client = new es.Client({
    host: config.elasticHost,
    log: "trace"
});
let database = require('../database/database')


router.post('/', (req, res)=> {
    database.serachDictionary(req.body, (result)=> {
        if (result == -1) {
            response.InternalServer('مشکلی در سرور پیش آمده است.لطفا دوباره تلاش کنید.', '', (result)=> {
                res.json(result)
            })
        }

        else if (result == 0) {
            response.response('موردی یافت نشد ', {}, (resi)=> {
                res.json(resi)
            })
        }
        else {
            response.response('اطلاعات ', result, (resi)=> {
                res.json(resi)
            })

        }

    });
})


module.exports = router

