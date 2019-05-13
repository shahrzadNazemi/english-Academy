var express = require('express');
const helmet = require('helmet')
const rateLimit = require("express-rate-limit");
var cookieParser = require('cookie-parser')
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors')
var logger = require('./util/customMorgan');
var app = express();
const fileupload = require('express-fileupload');
let jwt = require('./util/jwtHelper')
let trimmer = require('express-trimmer')
var debug = require('debug')('gokibitz');
let user = require('./routes/users');
let level = require('./routes/level');
let lesson = require('./routes/lesson');
let question = require('./routes/question');
let exam = require('./routes/exam');
let view = require('./routes/view');
let notification = require('./routes/notification');
let trick = require('./routes/trick');
let statistic = require('./routes/statistic')
let dictionary = require('./routes/dictionary')
let certificate = require('./routes/certificate')
let ticket = require('./routes/ticket')
var io = require('./routes/socket')
var chatroom = require('./routes/chatRoom')
var package = require('./routes/package')
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(logger);
app.use(helmet())
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended: false , limit:'50mb'}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(fileupload());
app.use(trimmer)
app.use(limiter);

app.use(function (req, res, next) {
    if (req.path.includes('/login') || req.path.includes('/register') || req.path.includes('/refreshToken') || req.path.includes('/verification') || req.path.includes('/resendVerify')) {
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
    if (!verify || verify == 1)  {

        return res.status(401).json({error: "authorization failed"});
    }
    console.log("verification", verify);
    next();
});

// app.use(cookieParser)

app.use('/api/users', user);
app.use('/api/level', level);
app.use('/api/lesson', lesson);
app.use('/api/question', question);
app.use('/api/exam', exam);
app.use('/api/view', view);
app.use('/api/notification', notification);
app.use('/api/trick', trick);
app.use('/api/statistic', statistic);
app.use('/api/dictionary', dictionary);
app.use('/api/certificate', certificate);
app.use('/api/ticket', ticket);
app.use('/api/chatroom', chatroom);
app.use('/api/package', package);









// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
});


app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
    console.log("server listen on port 8080");
});



io.attach(server , { pingInterval: 10,
    pingTimeout: 4000})

module.exports = app;
