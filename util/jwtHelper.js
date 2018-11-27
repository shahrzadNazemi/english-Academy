const jwt = require('jsonwebtoken');
const secret = "N*BISECrEt";
module.exports.signUser = function (userID) {
    return jwt.sign({userID: userID }, secret, {expiresIn:60*60});
};
module.exports.verify = function (token) {
    try {
        var decoded = jwt.verify(token, secret);
        return decoded;
    } catch (err) {
        return null;
    }
};
