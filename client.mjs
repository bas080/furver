import _debug from './debug.mjs'
import { debounceWithIndex } from './debounce.mjs'
import { FurverInvalidSchemaError } from './error.mjs'

const debug = _debug.extend('client')
const debugError = debug.extend('error')
const debugFetch = debug.extend('fetch')

FurverClient.bulkPost = (config = {
  fetch
}) => debounceWithIndex(async calls => {
  const [[url, options]] = calls
  const body = JSON.stringify([calls.map(([, { body }]) => body)])

  const _options = {
    ...options,
    method: 'post',
    body
  }

  debugFetch(url, _options)

  const res = await fetch(url, _options)

  if (!res.ok) {
    debugError(res)
    throw res
  }

  return await res.json()
}, 0)

// TBD: Should keep support for get requests. Implement a get fetch.
// function furverGet (url, options) {
//   debug('using get option')
//   const { body, ...otherOptions } = options || {}
//   const queryString = new URLSearchParams({ body }).toString()
//   const fullUrl = `${url}?${queryString}`
//
//   return fetch(fullUrl, {
//     method: 'get',
//     ...otherOptions
//   })
// }

FurverClient.schema = async function furverClientSchema (url) {
  debug(`fetching schema from ${url}`)
  const schemaRes = await fetch(url)
  return await schemaRes.json()
}

const isFunction = x => typeof x === 'function'
const castFunction = x => isFunction(x) ? x : () => x

async function FurverClient ({
  endpoint = 'http://localhost:3000',
  fetch = FurverClient.bulkPost(),
  schema = FurverClient.schema
}) {
  const api = {}
  const assignMethods = (schema) => {
    if (!Array.isArray(schema)) {
      throw new FurverInvalidSchemaError('Not a valid schema')
    }

    api.schema = () => schema

    return schema.reduce((api, [name]) => {
      // Ignore the call name.
      if (name === 'call') return api

      api[name] = (...args) => fetch(endpoint, {
        body: [name, ...args],
        method: 'post'
      })

      api[name].toJSON = () => name

      return api
    }, api)
  }

  api.call = body => fetch(endpoint, {
    body,
    method: 'post'
  })

  debug('FurverClient initialized with endpoint', endpoint)

  return assignMethods(await castFunction(schema)(`${endpoint}/schema`))
}

export default FurverClient
