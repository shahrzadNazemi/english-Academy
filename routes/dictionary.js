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
    let str = req.body.search
    fs.readFile('./util/tbl_content.json', 'utf8', (err, data)=> {
        if (err) {
            console.log(err)
        }
        else {
            var result = [];
            data = JSON.parse(data)
            for (var i = 0; i < data.length; i++) {
                if (data[i].en == str) {
                    result.push(data[i]);
                }
            }
            if (data.length == 0) {
                response.response('اطلاعات ', result, (resi)=> {
                    res.json(resi)
                })
            }
            else {
                response.response('اطلاعات ', result[0], (resi)=> {
                    res.json(resi)
                })
            }

        }

    });
});


router.get('/', (req, res)=> {

    client.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 1000
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });
    fs.readFile('./util/tbl_content.json', {encoding: 'utf-8'}, function (err, data) {
        if (err) {
            throw err;
        }
        let line = req.query.search
        // Build up a giant bulk request for elasticsearch.
        let bulk_request = data.split('\n').reduce(function (bulk_request, line) {
            var obj = line
            bulk_request.push({index: {_index: 'dictionary', _type: 'json', _id:obj.id }});
            bulk_request.push(obj);
            return bulk_request;
        }, []);

        // A little voodoo to simulate synchronous insert
        var busy = false;
        var callback = function (err, resp) {
            if (err) {
                console.log(err);
            }

            busy = false;
        };

        // Recursively whittle away at bulk_request, 1000 at a time.
        var perhaps_insert = function () {
            if (!busy) {
                busy = true;
                client.bulk({
                    body: bulk_request.slice(0, 1000)
                }, callback);
                bulk_request = bulk_request.slice(1000);
                console.log(bulk_request.length);
            }

            if (bulk_request.length > 0) {
                setTimeout(perhaps_insert, 10);
            } else {
                console.log('Inserted all records.');
            }
        };

        perhaps_insert();
    });
})


module.exports = router

module.exports.addDataToDictionary=()=>{
    // let str = req.body.search
    fs.readFile('./util/tbl_content.json', 'utf8', (err, data)=> {
        if (err) {
            console.log(err)
        }
        else {
            var result = [];
            data = JSON.parse(data)
            database.addDataToDict(data, (result)=> {
                console.log("ok")
            })
        }
})
}

