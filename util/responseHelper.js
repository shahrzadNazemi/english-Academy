module.exports.responseCreated = (message, data, cb)=> {
    let info = {
        status: 'success',
        status_code: 201,
        message: message,
        data: data
    }
    cb(info)
}

module.exports.responseUpdated = (message, data, cb)=> {
    let info = {
        status: 'updated',
        status_code: 200,
        message: message,
        data: data
    }
    cb(info)
}

module.exports.response = (message, data, cb)=> {
    if (data.totalPage == undefined) {
        let info = {
            status: 'success',
            status_code: 200,
            message: message,
            data: data
        }
        cb(info)
    }
    else {
        let totalPage = data.totalPage
        delete data.totalPage
        let info = {
            status: 'success',
            status_code: 200,
            message: message,
            totalPage: totalPage,
            data: data
        }
        cb(info)
    }

}

module.exports.respondDeleted = (message, data, cb)=> {
    let info = {
        status: 'deleted',
        status_code: 200,
        message: message,
        data: data
    }
    cb(info)
}

module.exports.respondNotFound = (message, data, cb)=> {
    let info = {
        status: 'notFound',
        status_code: 404,
        message: message,
        data: data
    }
    cb(info)
}

module.exports.InternalServer = (message, data, cb)=> {
    let info = {
        status: 'internalError',
        status_code: 500,
        message: message,
        data: data
    }
    cb(info)
}

module.exports.validation = (message, data, status, cb)=> {
    let info = {
        status: status,
        status_code: 422,
        message: message,
        errors: data
    }
    cb(info)
};

module.exports.pagination = (offset, limit, data, cb)=> {
    console.log(offset, limit, data)
    let temp = []
    let k = 0
    if (limit > data.length || offset > data.length) {
        cb(data)
    }
    else {
        for (var i = offset; i < limit; i++) {
            temp[k] = data[i]
            k++
        }
        cb(temp)
    }


}

module.exports.paginationClient = (page, limit, data, cb)=> {
    let temp = []
    let k = 0
    if (limit > data.length) {
        cb(data)
    }
    else {
        let offset = limit * (page - 1)
        let limit1 = limit * page
        for (var i = offset; i < limit1; i++) {
            if (data[i] != undefined) {
                temp[k] = data[i]
                k++
            }
        }
        cb(temp)
    }


}


