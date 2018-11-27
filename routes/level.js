var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');


router.post('/', (req, res)=> {
    database.addLevel(req.body, (addResult)=> {
        if (addResult == -1) {
            res.status(500).end('')
        }
        else {
            res.json(addResult)
        }
    })
})

router.put('/:lvlId', (req, res)=> {
    database.updateLevel(req.body, req.params.lvlID, (updateResult)=> {
        if (updateResult == -1) {
            res.status(500).end('')
        }
        else {
            res.json({affectedRows: updateResult})
        }
    })
})

router.delete('/:lvlId', (req, res)=> {
    database.delLevel(req.params.lvlID, (delResult)=> {
        if (delResult == -1) {
            res.status(500).end('')
        }
        else {
            res.json({affectedRows: delResult})
        }
    })
})

router.get('/:lvlId', (req, res)=> {
    database.getLevelById(req.params.lvlID, (level)=> {
        if (level == -1) {
            res.status(500).end('')
        }
        else {
            res.json({level: level})
        }
    })
})

router.get('/', (req, res)=> {
    database.getLevels(req.body, (addResult)=> {
        if (addResult == -1) {
            res.status(500).end('')
        }
        else {
            res.json({lvlID: addResult})
        }
    })
    // res.json({"status":"success"})
})


module.exports = router