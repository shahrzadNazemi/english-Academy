var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let jwt = require('../util/jwtHelper')


router.post('/admin/login', (req, res) => {
    database.adminLogin(req.body, function (loginResult) {
        if (loginResult == -1) {
            logger.error('login ResultFailed', loginResult)
            res.status(500).end('')
        }
        else if (loginResult == 0) {
            logger.error("user Not FOund", loginResult)
            res.status(404).end('')
        }
        else {
            console.log(loginResult.adm_username)
            res.json({result: loginResult, jwt: jwt.signUser(loginResult.adm_username)})
        }
    })
});

router.put('/admin/:admId', (req, res) => {
    database.updateAdmin(req.body, req.params.admId, (result)=> {
        if (result == -1) {
            res.status(500).end('')
        }
        else if (result == 0) {
            res.status(404).end('')
        }
        else {
            res.json(result)
        }
    })
});

router.get('/admin', (req, res) => {
    database.getAdmins((result)=> {
        if (result == -1) {
            res.status(500).end('')
        }
        else if (result == 0) {
            res.status(404).end('')
        }
        else {
            res.json(result)
        }
    })
});

router.delete('/admin/:admId', (req, res) => {
    database.delAdmin(req.params.admId, (result)=> {
        if (result == -1) {
            res.status(500).end('')
        }
        else if (result == 0) {
            res.status(404).end('')
        }
        else {
            res.json(result)
        }
    })
});

router.post('/admin', (req, res)=> {
    database.addAdmin(req.body, (addedAdmin)=> {
        if (addedAdmin == -1) {
            res.status(500).end('')
        }
        else {
            res.json(addedAdmin)
        }
    })
});


router.post('/student', (req, res)=> {
    database.addStu(req.body , (result)=>{
        if(result == -1){
            res.status(500).end('')
        }
        else{
            res.json(result)
        }
    })
})


module.exports = router