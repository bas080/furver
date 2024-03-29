import { test } from 'tap'
import { spawn } from 'child_process'

const bin = './cli.mjs'

process.env.DEBUG = '*'

test('run server with default port', (t) => {
  const timeout = 5000
  t.plan(1)
  t.setTimeout(timeout)

  const child = spawn(bin, ['server', './example/api.mjs'])

  child.on('error', (err) => t.fail(err))
  child.stderr.on('data', (data) => {
    if (data.toString().includes('Listening on port ')) {
      t.pass('Server is listening')
    }
  })

  setTimeout(() => {
    child.kill('SIGINT')
    t.end()
  }, timeout - 500)
})

test('run server with custom port', (t) => {
  const child = spawn(bin, ['server', '--port', '4000', './example/api.mjs'])

  child.on('error', (err) => t.fail(err))
  child.stderr.on('data', (data) => {
    if (data.toString().includes('Listening on port 4000')) {
      t.pass()
      t.end()
    }
  })

  setTimeout(() => {
    child.kill('SIGINT')
  }, 500)
})

test('output schema', (t) => {
  const child = spawn(bin, ['schema', './example/api.mjs'])

  child.on('error', (err) => t.fail(err))
  child.stdout.on('data', (data) => {
    t.doesNotThrow(() => JSON.parse(data), 'Output is valid JSON')
    t.end()
  })
})

test('run REPL', (t) => {
  t.plan(1)

  const child = spawn(bin, ['repl', './example/api.mjs', '--verbose'])

  child.on('error', (err) => t.fail(err))
  child.stderr.on('data', (data) => {
    if (data.toString().includes('furver:repl Starting REPL')) {
      t.pass('REPL started')
    }
  })

  setTimeout(() => {
    child.kill('SIGINT')
  }, 500)
})

// test.skip('execute command with API endpoint', (t) => {
//   const child = spawn(bin, ['--exec', '["identity", 42]', '--endpoint', 'http://localhost:3000'])
//
//   child.on('error', (err) => t.fail(err))
//   child.stderr.on('data', (data) => t.fail(data))
//   child.stdout.on('data', (data) => {
//     t.ok(data.toString().includes('3'), 'Command executed')
//     t.end()
//   })
// })
