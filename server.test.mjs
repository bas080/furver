import tap from 'tap'
import { spawn } from 'node:child_process'
import { server, withConfig } from './server.mjs'

const { test } = tap

let serverProcess

const port = Number(process.env.PORT || 3000) + 1
const apiUri = `http://localhost:${port}`

tap.before(async () => {
  // Start the server in a child process
  serverProcess = spawn('node', ['./cli.mjs', 'server', './example/api.mjs', '--port', port])

  // Wait for the server to start listening on the port
  await new Promise((resolve) => serverProcess.stderr.once('data', resolve))
})

tap.teardown(() => serverProcess.kill())

test('Returns 400 when receiving malformed JSON data', async (t) => {
  // Send a POST request with malformed JSON data
  const res = await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid-json}'
  })

  // Verify the response status code
  t.equal(res.status, 400)
  t.end()
})

test('Returns 404 status', async (t) => {
  try {
    const res = await fetch(apiUri, {
      method: 'POST',
      body: JSON.stringify([]),
      headers: { 'Content-Type': 'application/json' }
    })
    t.equal(res.status, 404, 'Status should be 404')
    t.end()
  } catch (error) {
    t.error(error)
  }
})

test('Test 200 status', async (t) => {
  const requestData = [[['add', 1, 2]]]
  const expectedResponse = [3]

  // Send a POST request with valid JSON data
  const res = await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  })

  // Verify the response status code
  t.equal(res.status, 200)

  // Verify the response body
  const responseBody = await res.json()
  t.same(responseBody, expectedResponse)
  t.end()
})

test('withConfig helper', async (t) => {
  t.plan(6)

  const tPort = port + 1
  const apiUri = `http://localhost:${tPort}`

  const api = {
    add: (a, b) => a + b
  }

  const config = {
    onRequest (request) {
      t.pass('Called onRequest')
    },
    onError (request, response, error) {
      t.pass('Called onError')
      response.writeHead(500)
      response.end()
    },
    onResponse (request, response, result) {
      t.pass('Called onResponse')
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.write(JSON.stringify(result))
      response.end()
    }
  }

  // Create a new API with the custom configuration
  const apiWithConfig = withConfig(config, api)

  // Start the server with the new API
  const instance = await server(apiWithConfig, tPort)

  // Send a request to the server
  const requestData = [[['add', 1, 2]]]
  const expectedResponse = [3]

  await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not a valid JSON string'
  })

  const res = await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  })

  // Verify the response status code and body
  t.equal(res.status, 200)
  const responseBody = await res.json()
  t.same(responseBody, expectedResponse)

  // Stop the server
  instance.close()
})
