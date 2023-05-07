import { test } from 'tap'
import { spawn } from 'child_process'

const bin = './cli.mjs'

const PORT = process.env.PORT || 3000

test('run server with default port', (t) => {
  const child = spawn(bin)

  child.on('error', (err) => t.fail(err))
  child.stderr.on('data', (data) => {
    if (data.toString().includes(`Listening on port ${PORT}`)) {
      t.pass()
      t.end()
    }
  })

  setTimeout(() => {
    child.kill('SIGINT')
  }, 500)
})

test('run server with custom port', (t) => {
  const child = spawn(bin, ['--port', '4000'])

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
  const child = spawn(bin, ['--schema', './example/api.mjs'])

  child.on('error', (err) => t.fail(err))
  child.stdout.on('data', (data) => {
    t.doesNotThrow(() => JSON.parse(data), 'Output is valid JSON')
    t.end()
  })
})

test('run REPL', (t) => {
  t.plan(1)

  const child = spawn(bin, ['--repl', '--verbose'])

  child.on('error', (err) => t.fail(err))
  child.stderr.on('data', (data) => {
    if (data.toString().includes('furver:repl Started REPL')) {
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
