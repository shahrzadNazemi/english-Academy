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
