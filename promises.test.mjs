import { promise, promises } from './promises.mjs'
import { test } from 'tap'

// promise()

test('promise resolves with correct value', async t => {
  const p = promise()
  p.resolve('hello')
  const result = await p
  t.equal(result, 'hello')
})

test('promise rejects with correct error', async t => {
  const p = promise()
  const error = new Error()
  p.reject(error)
  try {
    await p
  } catch (err) {
    t.equal(err, error)
  }
})

test('promise has resolve and reject methods', t => {
  const p = promise()
  t.type(p.resolve, 'function')
  t.type(p.reject, 'function')
  t.end()
})

test('promise is an instance of Promise', t => {
  const p = promise()
  t.ok(p instanceof Promise)
  t.end()
})

// promises()

test('promises have promise, resolve, and reject methods', t => {
  const ps = promises()
  t.type(ps.promise, 'function')
  t.type(ps.resolve, 'function')
  t.type(ps.reject, 'function')
  t.end()
})

test('promises resolve with correct value', async t => {
  const ps = promises()

  ps.promises = [
    ps.promise('hello'),
    ps.promise('ignored'),
    ps.promise('values')
  ]

  ps.resolve('hello')
  const results = await Promise.all(ps.promises)
  t.same(results, ['hello', 'hello', 'hello'])
})

test('promises reject with correct error', async t => {
  t.plan(1)
  const ps = promises()
  ps.promises = [ps.promise(), ps.promise()]
  const error = new Error()
  ps.reject(error)
  try {
    await Promise.all(ps.promises)
  } catch (err) {
    t.equal(error, err)
  }
})
