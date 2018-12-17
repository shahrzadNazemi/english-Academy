var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors')
var logger = require('./util/customMorgan');
var app = express();
const fileupload = require('express-fileupload');
let jwt = require('./util/jwtHelper')


let user = require('./routes/users');
let level = require('./routes/level');
let lesson = require('./routes/lesson');

app.use(logger);
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(fileupload());

app.use(function (req, res, next) {
    if (req.path.includes('/login') || req.path.includes('/register')) {
        return next();
    }
    if (!req.headers.authorization) {
        return res.status(401).json({error: "authorization required"});
    }
    var token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({error: "authorization required"});
    }
    var verify = jwt.verify(token);
    // console.log(verify.userID)

    if (!verify || verify == 1)  {

        return res.status(401).json({error: "authorization failed"});
    }
    console.log("verification", verify);
    next();
});

app.use('/api/users', user);
app.use('/api/level', level);
app.use('/api/lesson', lesson)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
});

app.listen(8080, ()=> {
    console.log("English server is listening on 8080 ")
})

module.exports = app;
