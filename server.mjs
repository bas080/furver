import http from 'node:http'
import { exec } from './lisp.mjs'
import _debug from './debug.mjs'
import schema from './schema.mjs'
import fs from 'node:fs'
import { FurverExpressionError } from './error.mjs'

const debug = _debug.extend('server')
const mustDebug = debug.extend('start')
const debugError = debug.extend('error')

function tryCatch (tryFn, catchFn) {
  try {
    return tryFn()
  } catch (error) {
    return catchFn(error)
  }
}

const serverSymbol = Symbol('server')

export const withRequest = method => function (...args) {
  const request = this[serverSymbol]

  return method.call(this, request, ...args)
}

async function FurverServer (api, port) {
  const frozenDeep = deepFreeze(api)

  debug('API', Object.keys(api))

  const server = http.createServer((request, response) => {
    debug(request.method, request.url)
    if (request.url === '/schema') {
      debug('Schema')
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.write(JSON.stringify(schema(api)))
      response.end()
      return
    }

    if (request.url === '/playground') {
      debug('Serving playground')
      fs.createReadStream('./example/index.html').pipe(response)
      return
    }

    if (request.url === '/client.min.js') {
      debug('Serving client')
      fs.createReadStream('./client.min.js').pipe(response)
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

        const serialized = JSON.stringify(result) + '\n'

        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(serialized)
        response.end()

        debug('Response', serialized)
      } catch (error) {
        if (error instanceof FurverExpressionError) {
          error.status = 404
        }

        debugError(error)
        error.status = error.status || 500
        response.writeHead(error.status, { 'Content-Type': 'text/plain' })
        response.write(`Status: ${error.status}`)
        response.end()
      }
    })
  })

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      mustDebug(`Listening on port ${port}`)
      resolve(server)
    })
  })
}

function deepFreeze (object, name = '', frozen = new Set()) {
  if (isPrimitive(object) || frozen.has(object)) {
    return object
  }

  try {
    Object.freeze(object)
    debug('Froze', name)
  } catch (error) {
    debugError('Cannot freeze', object)
  }

  frozen.add(object)

  for (const key in object) {
    deepFreeze(object[key], key, frozen)
  }

  return object
}

function isPrimitive (value) {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

export default FurverServer
