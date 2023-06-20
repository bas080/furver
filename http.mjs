import server from './server.mjs'
import http from 'node:http'
import _debug from './debug.mjs'
import schema from './schema.mjs'
import fs from 'node:fs'
import { URL } from 'node:url'

const debug = _debug.extend('server')
const mustDebug = debug.extend('start')

async function httpServer (api, port) {
  const onRequest = server(api)

  const httpServer = http.createServer(async (request, response) => {
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
      const fileUrl = new URL('playground.html', import.meta.url)
      fs.createReadStream(fileUrl).pipe(response)
      return
    }

    if (request.url === '/client.min.js') {
      debug('Serving client')
      const fileUrl = new URL('client.min.js', import.meta.url)
      fs.createReadStream(fileUrl).pipe(response)
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

        let program
        try {
          program = JSON.parse(data)
        } catch (error) {
          debug(error)
          debug(data)
          error.status = 400
          throw error
        }

        debug('Evaluate', program)

        const result = await onRequest(request, response, program)

        debug('Result', result)

        if (response.headersSent) return

        const serialized = JSON.stringify(result) + '\n'
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(serialized)
        response.end()
        debug('Response', serialized)
      } catch (error) {
        debug('Error', error)

        if (response.headersSent) return

        error.status = error.status || 500
        response.writeHead(error.status, { 'Content-Type': 'text/plain' })
        response.write(`Status: ${error.status}`)
        response.end()
      }
    })
  })

  return new Promise((resolve, reject) => {
    httpServer.listen(port, () => {
      mustDebug(`Listening on port ${port}`)
      resolve(httpServer)
    })
  })
}

export default httpServer
export { httpServer as server }
