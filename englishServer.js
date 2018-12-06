var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors')
var logger = require('./util/customMorgan');
var app = express();
const fileupload = require('express-fileupload');


let user = require('./routes/users');
let level = require('./routes/level');
let lesson = require('./routes/lesson');

app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(fileupload());


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
