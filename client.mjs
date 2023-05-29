// client.mjs

// TBD: re-introduce debug once bundling is solved
// import _debug from './debug.mjs'
import { debounceWithIndex } from './debounce.mjs'
import { FurverInvalidSchemaError } from './error.mjs'

// const debug = _debug.extend('client')
// const debugError = debug.extend('error')
// const debugFetch = debug.extend('fetch')

const bulk = fetchFn => debounceWithIndex(calls => {
  const [[url, options]] = calls
  const body = JSON.stringify([calls.map(([, { body }]) => body)])

  return fetchFn(url, {
    ...options,
    body
  })
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
  const queryString = new URLSearchParams({ body }).toString()
  const fullUrl = `${url}?${queryString}`
  const res = await fetch(fullUrl, options)

  if (!res.ok) {
    throw res
  }

  const json = await res.json()

  return json
})

client.schema = async function furverClientSchema (url) {
  // debug(`fetching schema from ${url}`)
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
    if (!Array.isArray(schema)) {
      throw new FurverInvalidSchemaError('Not a valid schema')
    }

    api.schema = () => schema

    return schema.reduce((api, [name]) => {
      // Ignore the call name.
      if (name === 'call') return api

      api[name] = (...args) => fetch(endpoint, {
        body: [name, ...args]
      })

      api[name].toJSON = () => name

      return api
    }, api)
  }

  api.call = body => fetch(endpoint, {
    body
  })

  // debug('client initialized with endpoint', endpoint)

  return assignMethods(await castFunction(schema)(endpoint === '/'
    ? '/schema'
    : `${endpoint}/schema`
  ))
}

export default client
export {
  client,
  bulk,
  get,
  post
}
