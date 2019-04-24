const crypto = require('crypto');
const _ = require("underscore")

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
module.exports.arrUnique=(arr)=> {
    var cleaned = [];
    arr.forEach(function(itm) {
        console.log(itm)
        var unique = true;
        cleaned.forEach(function(itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique)  cleaned.push(itm);
    });
    console.log("cleaned" , cleaned)

    return cleaned;
}

