import http from 'node:http'
import { exec } from './lisp.mjs'
import _debug from './debug.mjs'
import Debug from 'debug'
import schema from './schema.mjs'

const debug = _debug.extend('server')

function tryCatch (tryFn, catchFn) {
  try {
    return tryFn()
  } catch (error) {
    return catchFn(error)
  }
}

const serverSymbol = Symbol('server')

export const withRequest = method => function (...args) {
  console.log(method, args)
  const request = this[serverSymbol]

  return method.call(this, request, ...args)
}

async function FurverServer (api) {
  const frozenDeep = deepFreeze(api)

  debug('API', Object.keys(api))

  const server = http.createServer((request, response) => {
    if (request.url === '/schema') {
      debug('Schema')
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.write(JSON.stringify(schema(api)))
      response.end()
      return
    }

    const chunks = []
    request.on('data', (chunk) => {
      chunks.push(chunk)
    })

    request.on('end', async () => {
      try {
        debug('Parse')
        const data = (request.method === 'GET')
          ? (new URL(request.url, 'http://a').searchParams.get('body'))
          : Buffer.concat(chunks).toString()

        const parsedData = tryCatch(
          () => JSON.parse(data),
          error => {
            debug(error)
            debug(data)
            error.status = 400
            throw error
          })

        debug('Evaluate', parsedData)

        const requestEnv = Object.create(frozenDeep)
        requestEnv[serverSymbol] = request

        const result = await exec(requestEnv, parsedData)

        debug('Result', result)

        const serialized = JSON.stringify(result)

        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(serialized)
        response.end()

        debug('Response', serialized)
      } catch (error) {
        debug(error)
        error.status = error.status || 500
        response.writeHead(error.status, { 'Content-Type': 'text/plain' })
        response.write(`Status: ${error.status}`)
        response.end()
      }
    })
  })

  const port = process.env.PORT

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      const namespaces = Debug.disable()
      Debug.enable('furver:server')
      debug(`Listening on port ${port}`)
      Debug.enable(namespaces)
      resolve()
    })
  })
}

function deepFreeze (object, name = '') {
  if (isPrimitive(object)) return object

  try {
    Object.freeze(object)
    debug('Froze', name)
  } catch (error) {
    debug('Cannot freeze', object)
  }

  for (const name in object) {
    deepFreeze(object[name], name)
  }

  return object
}

function isPrimitive (value) {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

export default FurverServer
