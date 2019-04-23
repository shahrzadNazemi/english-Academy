const crypto = require('crypto');

module.exports.hash = function (payload) {
    return crypto.createHash('sha256')
        .update(payload)
        .digest('hex');
};

module.exports.ConvertToEnglish = (string)=>{
        return string.replace(/[\u0660-\u0669]/g, function (c) {
            return c.charCodeAt(0) - 0x0660;
        }).replace(/[\u06f0-\u06f9]/g, function (c) {
            return c.charCodeAt(0) - 0x06f0;
        });
}
