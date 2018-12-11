const crypto = require('crypto');

module.exports.hash = function (payload) {
    return crypto.createHash('sha256')
        .update(payload)
        .digest('hex');
};
