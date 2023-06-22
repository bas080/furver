import _debug from './debug.mjs'
import { debounceWithIndex } from './debounce.mjs'
import { FurverInvalidSchemaError } from './error.mjs'

const schemaSymbol = Symbol('schema')

const debug = _debug.extend('client')

const bulk = fetchFn => debounceWithIndex(calls => {
  const [[url, options]] = calls
  const payload = ['array', ...calls.map(([, { body }]) => body)]
  const body = JSON.stringify(payload)
  const config = {
    ...options,
    body
  }

  debug(url, config)

  return fetchFn(url, config)
})

const post = bulk(async (url, options) => {
  const res = await fetch(url, {
    ...options,
    method: 'post'
  })

  if (!res.ok) {
    throw res
  }

  const json = await res.json()

  return json
})

const get = bulk(async (url, argOptions) => {
  const { body, ...options } = argOptions || {}
  const search = new URLSearchParams({ body })
  const fullUrl = new URL(url)

  fullUrl.search = search

  const res = await fetch(fullUrl.toString(), options)

  if (!res.ok) {
    throw res
  }

  const json = await res.json()

  return json
})

client.schema = async function furverClientSchema (url) {
  debug(`fetching schema from ${url}`)
  const schemaRes = await fetch(url)
  return await schemaRes.json()
}

const isFunction = x => typeof x === 'function'
const castFunction = x => isFunction(x) ? x : () => x

async function client ({
  endpoint = 'http://localhost:3000',
  fetch = post,
  schema = client.schema
}) {
  const api = {}

  const assignMethods = (schema) => {
    api[schemaSymbol] = schema

    if (!Array.isArray(schema)) {
      throw new FurverInvalidSchemaError('Not a valid schema')
    }

    return schema.reduce((api, [name]) => {
      api[name] = (...args) => fetch(endpoint, {
        body: [name, ...args]
      })

      api[name].toJSON = () => ['ref', name]

      return api
    }, api)
  }

  debug('client initialized with endpoint', endpoint)

  // You can also unset the default schema fetching if you wich not to have the
  // API populated.
  if (schema) {
    assignMethods(await castFunction(schema)(endpoint === '/'
      ? '/schema'
      : `${endpoint}/schema`
    ))
  }

  api.call = body => fetch(endpoint, {
    body
  })

  api.call.toJSON = () => ['ref', 'call']

  return api
}

function schema (api) {
  return api[schemaSymbol]
}

export default client
export {
  client,
  schema,
  bulk,
  get,
  post
}
