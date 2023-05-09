function promise () {
  let _resolve
  let _reject

  const promise = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  promise.resolve = _resolve
  promise.reject = _reject
  return promise
}

function promises () {
  let promises = []

  return {
    promise () {
      const p = promise()
      promises.push(p)
      return p
    },
    resolve (x) {
      promises.forEach(p => p.resolve(x))
      promises = []
      return x
    },
    reject (x) {
      promises.forEach(p => p.reject(x))
      promises = []
      return x
    }
  }
}

export {
  promises,
  promise
}
