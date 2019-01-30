
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
                    result.push(data[i]['fa']);
                }
            }
            res.json(result)
        }

    });
});



module.exports = router
