var moment = require('moment-jalaali');
require('colors');
module.exports.info = function (tag, message) {
    var time = moment().format('jYYYY/jMM/jDD HH:mm:ss');
    console.log(time.green + " => " + tag.green + " :", message);
};
module.exports.error = function (tag, message) {
    var time = moment().format('jYYYY/jMM/jDD HH:mm:ss');
    console.log(time.green + " => " + tag.red + " :", message);
};
module.exports.warn = function (tag, message) {
    var time = moment().format('jYYYY/jMM/jDD HH:mm:ss');
    console.log(time.green + " => " + tag.yellow + " :", message);
};

