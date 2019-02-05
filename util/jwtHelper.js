const jwt = require('jsonwebtoken');
const secret = "N*BISECrEt";
module.exports.signUser = function (userID) {
    return jwt.sign({userID: userID}, secret, {expiresIn: 15 * 60});
};
module.exports.verify = function (token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        if(err.name === 'TokenExpiredError') {
            return 1
        }
        else{
            return null;

        }
    }
};

module.exports.verifyExpireToken = function (token , cb) {
    const payload = jwt.verify(token, secret, {ignoreExpiration: true} );
    cb(module.exports.signUser(payload.userID))

};
