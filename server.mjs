#!/usr/bin/env node

import http from 'node:http'
import { exec } from './lisp.mjs'
import Debug from 'debug'
import schema from './schema.mjs'

process.title = 'furver-server'

const debug = Debug('furver')

const { default: api } = await import(process.argv[2])

const apiEval = exec(deepFreeze(api))

debug('API', Object.keys(api))

function tryCatch (tryFn, catchFn) {
  try {
    return tryFn()
  } catch (error) {
    return catchFn(error)
  }
}

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

const port = process.env.PORT || 3000
server.listen(port, () => {
  console.error(`Server is running on port ${port}`)
  console.error('Use DEBUG=furver for logging')
})

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
