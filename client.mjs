import _debug from './debug.mjs'

const debug = _debug.extend('client')

FurverClient.fetch = function furverClientPost (url, options) {
  debug(`fetching ${url}`)

  if (options.method === 'get') { return furverClientGet(url, options) }

  return fetch(url, {
    method: 'post',
    ...options
  })
}

function furverClientGet (url, options) {
  debug('using get option')
  const { body, ...otherOptions } = options || {}
  const queryString = new URLSearchParams({ body }).toString()
  const fullUrl = `${url}?${queryString}`

  return fetch(fullUrl, {
    method: 'get',
    ...otherOptions
  })
}

FurverClient.schema = async function furverClientSchema (url) {
  debug(`fetching schema from ${url}`)
  const schemaRes = await fetch(url)
  return await schemaRes.json()
}

const isFunction = x => typeof x === 'function'

const castFunction = x => isFunction(x) ? x : () => x

async function FurverClient ({
  endpoint = 'http://localhost:3000',
  fetch = FurverClient.fetch,
  schema = FurverClient.schema,
  method = 'post'
}) {
  const api = {}
  let promise
  let reqs = []

  const bulkFetch = method => (expr) => {
    const index = reqs.length
    reqs.push(expr)

    promise = promise || new Promise((resolve, reject) => {
      setTimeout(() => {
        fetch(endpoint, {
          body: JSON.stringify([reqs]),
          method
        })
          .then(async (res) => {
            if (!res.ok) {
              return Promise.reject(res)
            }
            const json = await res.json()
            resolve(json)
          })
          .catch((error) => {
            reject(error)
          })
          .finally(() => {
            promise = undefined
            reqs = []
          })
      }, 0)
    })

    return promise.then((json) => {
      if (!Array.isArray(json)) { throw new Error('Response should be an array') }

      return json[index]
    })
  }

  const assignMethods = (schema) => {
    if (!Array.isArray(schema)) {
      throw new Error('Not a valid schema')
    }

    return schema.reduce((api, [name]) => {
      api[name] = (...args) => bulkFetch(method)([name, ...args])
      return api
    }, api)
  }

  api.post = bulkFetch('post')
  api.get = bulkFetch('get')

  debug('FurverClient initialized with endpoint', endpoint)

  return assignMethods(await castFunction(schema)(`${endpoint}/schema`))
}

export default FurverClient
