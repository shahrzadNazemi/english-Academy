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
            res.json({result:loginResult , jwt:jwt.signUser(loginResult.adm_username)})
        }
    })
})


module.exports = router