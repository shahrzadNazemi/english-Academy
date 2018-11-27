var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('./util/customMorgan');

var app = express();

let user = require('./routes/users');
let level = require('./routes/level');

app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.Access-Control-Allow-Origin:*);

// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');
//
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', false);
//
//     // Pass to next layer of middleware
//     next();
// });

app.use('/api/users' , user);
app.use('/api/level' , level);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
});

app.listen(8080,()=>{
    console.log("English server is listening on 8080 ")
})

module.exports = app;
