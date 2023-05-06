import http from 'node:http'
import { exec } from './lisp.mjs'
import Debug from 'debug'
import schema from './schema.mjs'

const debug = Debug('furver')

function tryCatch (tryFn, catchFn) {
  try {
    return tryFn()
  } catch (error) {
    return catchFn(error)
  }
}

export default async function serve(filePaths) {
  const api = await filePaths.reduce(async (merged, filePath) => {
    merged = await merged
    const mod = await import(filePath)
    const api = mod.default || mod;

    return Object.assign(merged, api)
  }, {})

  const apiEval = exec(deepFreeze(api))

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
        const data = Buffer.concat(chunks)
        const parsedData = tryCatch(
          () => JSON.parse(data.toString()),
          error => {
            debug(error)
            error.status = 400
            throw error
          })

        debug('Evaluate', parsedData)

        const result = await apiEval(parsedData)

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

  server.listen(port)
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
