function isPromise (obj) {
  return obj && typeof obj.then === 'function'
}

// return a rejected promise when error occurs
function reject (err) {
  return Promise.reject(new Error('promise-waterfall: ' + err))
}

function waterfall (list, arg) {
  // malformed argument
  list = Array.prototype.slice.call(list)
  if (!Array.isArray(list)                    // not an array
      || typeof list.reduce !== 'function'    // update your javascript engine
     ) {
    return reject('Array with reduce function is needed.')
  }

  if (list.length <= 0) {
    return Promise.resolve(arg)
  }

  if (list.length == 1) {
    if (typeof list[0] != 'function')
      return reject('First element of the array should be a function, got ' + typeof list[0])
    return Promise.resolve(list[0](arg))
  }

  return list.reduce(function (l, r) {
    // first round
    // execute function and return promise
    var isFirst = (l == list[0])
    if (isFirst) {
      if (typeof l != 'function')
        // return reject('List elements should be function to call.')
        return Promise.resolve(l)

      var lret = l(arg)
      if (!isPromise(lret))
        // return reject('Function return value should be a promise.')
        return Promise.resolve(lret)
      else
        return lret.then(r)
    }

    // other rounds
    // l is a promise now
    // priviousPromiseList.then(nextFunction)
    else {
      if (!isPromise(l))
        return Promise.resolve(l)
      else
        return l.then(r)
    }
  })
}

module.exports = waterfall
