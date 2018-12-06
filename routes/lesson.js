var express = require('express');
var router = express.Router();
var database = require('../database/database');
let logger = require('../util/logger');
let config = require('../util/config');
let fse = require('fs-extra');
let fs = require('fs')


router.post('/', (req, res) => {
    database.addLesson(req.body, (result)=> {
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

router.post('/video', (req, res) => {
    if (req.files) {
        if (req.files.file != null) {
            // type file    
            database.getVideoByLsnLvl(req.body.vd_lvlId, req.body.vd_lsnId, (videos)=> {
                if (videos == -1) {
                    res.status(500).end()
                }
                else {
                    let forbidden = false
                    for (var i = 0; i < videos.length; i++) {
                        if (((videos[i].vd_url.substring(videos[i].vd_url.lastIndexOf("_") + 1)).substr(0, (videos[i].vd_url.substring(videos[i].vd_url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.vd_order) {
                            forbidden = true
                            break;
                        }

                    }
                    if (forbidden == true) {
                        res.status(403).end('')
                    }
                    else {
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '_' + req.body.vd_order + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathVideo}/${req.body.vd_lvlId}/${req.body.vd_lsnId}/`;
                        console.log("dir", dir)
                        module.exports.addDir(dir, function (newPath) {
                            var path = dir + newFile;
                            req.files.file.mv(path, function (err) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).send(err);
                                }
                                else {
                                    req.body.vd_url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                    database.addVideo(req.body, (result)=> {
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
                                }

                            })
                        });
                    }


                }
            })
        }
    }
    else {
        res.statusCode = 500;
        res.json({"error": "no file is chosen"})
    }
});

router.post('/sound', (req, res) => {
    if (req.files) {
        if (req.files.file != null) {
            // type file    
            database.getSoundByLsnLvl(req.body.snd_lvlId, req.body.snd_lsnId, (sounds)=> {
                if (sounds == -1) {
                    res.status(500).end()
                }
                else {
                    let forbidden = false
                    for (var i = 0; i < sounds.length; i++) {
                        if (((sounds[i].snd_url.substring(sounds[i].snd_url.lastIndexOf("_") + 1)).substr(0, (sounds[i].snd_url.substring(sounds[i].snd_url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.snd_order) {
                            forbidden = true
                            break;
                        }

                    }
                    if (forbidden == true) {
                        res.status(403).end('')
                    }
                    else {
                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                        var file = req.files.file.name.replace(`.${extension}`, '');
                        var newFile = new Date().getTime() + '_' + req.body.snd_order + '.' + extension;
                        // path is Upload Directory
                        var dir = `${config.uploadPathSound}/${req.body.snd_lvlId}/${req.body.snd_lsnId}/`;
                        console.log("dir", dir)
                        module.exports.addDir(dir, function (newPath) {
                            var path = dir + newFile;
                            req.files.file.mv(path, function (err) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).send(err);
                                }
                                else {
                                    req.body.snd_url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                    database.addSound(req.body, (result)=> {
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
                                }

                            })
                        });
                    }


                }
            })
        }
    }
    else {
        res.statusCode = 500;
        res.json({"error": "no file is chosen"})
    }

});


router.put('/:lsnId', (req, res) => {
    database.updateLesson(req.body, req.params.lsnId, (result)=> {
        if (result == -1) {
            res.status(500).end('')
        }
        else if (result == 0) {
            res.status(404).end('')
        }
        else {
            res.json(result)
        }
    });
});

router.put('/video/:vdId', (req, res) => {
    if (req.files.file) {
        database.getVideoByVDId(req.params.vdId, (video)=> {
            var unlinkPath = video.vd_url.replace(`${config.downloadPathVideo}`, `${config.uploadPathVideo}`);
            fs.unlink(unlinkPath, function (err) {
                if (err) {
                    res.status(500).end('there is no such a file to edit')
                }
                else {
                    if (req.files.file != null) {
                        // type file
                        database.getVideoByLsnLvl(req.body.vd_lvlId, req.body.vd_lsnId, (videos)=> {
                            if (videos == -1) {
                                res.status(500).end()
                            }
                            else {
                                let forbidden = false
                                for (var i = 0; i < videos.length; i++) {
                                    if (((videos[i].vd_url.substring(videos[i].vd_url.lastIndexOf("_") + 1)).substr(0, (videos[i].vd_url.substring(videos[i].vd_url.lastIndexOf("_") + 1)).indexOf('.'))) == req.body.vd_order) {
                                        forbidden = true
                                        break;
                                    }

                                }
                                if (forbidden == true) {
                                    res.status(403).end('')
                                }
                                else {
                                    var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                    var file = req.files.file.name.replace(`.${extension}`, '');
                                    var newFile = new Date().getTime() + '_' + req.body.vd_order + '.' + extension;
                                    // path is Upload Directory
                                    var dir = `${config.uploadPathVideo}/${req.body.vd_lvlId}/${req.body.vd_lsnId}/`;
                                    console.log("dir", dir)
                                    module.exports.addDir(dir, function (newPath) {
                                        var path = dir + newFile;
                                        req.files.file.mv(path, function (err) {
                                            if (err) {
                                                console.error(err);
                                                return res.status(500).send(err);
                                            }
                                            else {
                                                req.body.vd_url = path.replace(`${config.uploadPathVideo}`, `${config.downloadPathVideo}`)
                                                database.updateVideo(req.body, req.params.vdId, (result)=> {
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
                                            }

                                        })
                                    });
                                }


                            }
                        })
                    }
                    else {
                        res.status(400).end('file is not existed')
                    }

                }

            })

        })
    }
    else {
        database.updateVideo(req.body, req.params.vdId, (result)=> {
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
    }
});

router.put('/sound/:sndId', (req, res) => {
    if (req.files.file) {
        database.getSoundBysndId(req.params.sndId, (sound)=> {
            if(sound == 0 || sound == -1){
                res.status(400).end('no sound found by this id')
            }
            else{
                var unlinkPath = sound.snd_url.replace(`${config.downloadPathSound}`, `${config.uploadPathSound}`);
                fs.unlink(unlinkPath, function (err) {
                    if (err) {
                        console.log("err in unlinking" , err)
                        res.status(500).end('there is no such a file to edit')
                    }
                    else {
                        if (req.files.file != null) {
                            // type file
                                        var extension = req.files.file.name.substring(req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
                                        var file = req.files.file.name.replace(`.${extension}`, '');
                                        var newFile = new Date().getTime() + '_' + req.body.snd_order + '.' + extension;
                                        // path is Upload Directory
                                        var dir = `${config.uploadPathSound}/${req.body.snd_lvlId}/${req.body.snd_lsnId}/`;
                                        console.log("dir", dir)
                                        module.exports.addDir(dir, function (newPath) {
                                            var path = dir + newFile;
                                            req.files.file.mv(path, function (err) {
                                                if (err) {
                                                    console.error(err);
                                                    return res.status(500).send(err);
                                                }
                                                else {
                                                    req.body.snd_url = path.replace(`${config.uploadPathSound}`, `${config.downloadPathSound}`)
                                                    database.updateSound(req.body, req.params.sndId, (result)=> {
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
                                                }

                                            })
                                        });




                        }
                        else {
                            res.status(400).end('file is not existed')
                        }

                    }

                })
            }


        })
    }
    else {
        database.updateSound(req.body, req.params.sndId, (result)=> {
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

    }
});


router.get('/level/:lvlId', (req, res) => {
    database.getLessonByLvlId(req.params.lvlId , (result)=> {
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

router.get('/:lsnId/video', (req, res) => {
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

router.get('/:lsnId/sound', (req, res) => {
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

router.get('/:lsnId/video/:lvlId' , (req , res)=>{
    database.getVideoByLsnLvl(req.params.lvlId , req.params.lsnId , (result)=>{
        if(result == -1){
            res.status(500).end('')
        }
        else if(result == 0){
            res.status(404).end('')
        }
        else{
            res.json(result)
        }
    })
})

router.get('/:lsnId/sound/:lvlId' , (req , res)=>{
    database.getSoundByLsnLvl(req.params.lvlId , req.params.lsnId , (result)=>{
        if(result == -1){
            res.status(500).end('')
        }
        else if(result == 0){
            res.status(404).end('')
        }
        else{
            res.json(result)
        }
    })
})



router.delete('/:lsnId', (req, res) => {
    database.delLesson(req.params.lsnId, (result)=> {
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

router.delete('/video/:vdId', (req, res) => {
    database.delVideo(req.params.vdId, (result)=> {
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

router.delete('/sound/:sndId', (req, res) => {
    database.delSound(req.params.sndId, (result)=> {
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


module.exports = router


module.exports.addDir = function (path, cb) {
    // var pathArr = path.split('/');
    // var index = 0;
    // while (pathArr[index] != null) {
    //     var newPath = '';
    //     for (let ind_new = 0; ind_new <= index; ind_new++) {
    //         if (ind_new != 0) {
    //             newPath += '/';
    //         }
    //         newPath += pathArr[ind_new];
    //         if (!fs.existsSync(newPath)) {
    //             fs.mkdirSync(newPath);
    //         }
    //     }
    //     index++;
    //
    // }
    // cb(newPath);
    fse.ensureDir(path)
        .then(() => {
            console.log('success!')
            cb(path)
        })
        .catch(err => {
            console.error(err)
            cb(-1)
        })
};
