module.exports.responseCreated = (message, data, cb)=> {
    let info = [{
        status: 'success',
        status_code: 201,
        message: message,
        data: data
    }]
    cb(info)
}

module.exports.responseUpdated = (message , data , cb)=> {
    let info = [{
        status: 'updated',
        status_code: 200,
        message: message,
        data: data
    }]
    cb(info)
}

module.exports.response = (message , data , cb)=> {
    let info = [{
        status: 'success',
        status_code: 200,
        message: message,
        data: data
    }]
    cb(info)
}

module.exports.respondDeleted = (message , data , cb)=> {
    let info = [{
        status: 'deleted',
        status_code: 200,
        message: message,
        data: data
    }]
    cb(info)
}

module.exports.respondNotFound = (message , data , cb)=> {
    let info = [{
        status: 'notFound',
        status_code: 404,
        message: message,
        data: data
    }]
    cb(info)
}

module.exports.InternalServer = (message , data , cb)=> {
    let info = [{
        status: 'internalError',
        status_code: 500,
        message: message,
        data: data
    }]
    cb(info)
}

module.exports.validation = (message , data , cb)=> {
    let info = [{
        status: 'validationError',
        status_code: 400,
        message: message,
        data: data
    }]
    cb(info)
}


