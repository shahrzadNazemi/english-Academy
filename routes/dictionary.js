
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
            for(var i = 0; i < data.length; i++) {
                console.log(data[0])
                if (data[i]['name'].indexOf(str)>-1){
                    result.push(data[i]['name']);
                }
            }
            res.json(result)
        }

    });
});



module.exports = router