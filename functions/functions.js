exports.catchAsync = (fn) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn(resolve, reject, ...args).catch((err) => {
                console.log(err)
                reject(err)
            })
        })
    }
}