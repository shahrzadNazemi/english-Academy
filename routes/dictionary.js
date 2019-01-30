
var express = require('express');
var router = express.Router();
let logger = require('../util/logger');
let response = require('../util/responseHelper');
let fs = require('fs')



router.post('/', (req, res)=> {
    let str = req.body.search
    fs.readFile('./util/tbl_content.json', 'utf8',   (err, data)=> {
        if(err){
            console.log(err)
        }
        else{
            var result=[];
            data = JSON.parse(data)
            for(var i = 0; i < data.length; i++) {
                if(data[i].en == str){
                    result.push(data[i]);
                }
            }
            if(data.length == 0){
                response.response('اطلاعات ', result, (resi)=> {
                    res.json(resi)
                })
            }
            response.response('اطلاعات ', result[0], (resi)=> {
                res.json(resi)
            })
        }

    });
});



module.exports = router
