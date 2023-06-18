// client.test.mjs

import { test } from 'tap'
import { client, bulk, schema /* get, post */ } from './client.mjs'
import { FurverInvalidSchemaError } from './error.mjs'

test('client', async (t) => {
  t.test('registers API endpoints from provided schema', async (t) => {
    const schema = [['foo', 1], ['bar', 2]]
    const fetch = async (url) => {
      return { json: () => schema }
    }
    const api = await client({ fetch, schema })
    t.equal(typeof api.foo, 'function')
    t.equal(typeof api.bar, 'function')
  })

  t.test('registers API endpoints from schema', async (t) => {
    const schema = async () => [['foo', 1], ['bar', 2]]
    const api = await client({ schema })
    t.equal(typeof api.foo, 'function')
    t.equal(typeof api.bar, 'function')
  })

  t.test('invokes API endpoints with correct arguments', async (t) => {
    const schema = [['add', 2]]
    const expectedArgs = [2, 3]
    let actualArgs
    const fetch = async (url, options) => {
      const { body } = (options || {})

      const [op, ...args] = body

      t.equal(op, 'add')

      actualArgs = args
      return { ok: true, json: async () => [5] }
    }

    const api = await client({ schema, fetch })
    await api.add(...expectedArgs)
    t.same(actualArgs, expectedArgs)
  })

  t.test('returns undefined for unknown API endpoints', async (t) => {
    const schema = () => [['foo', 0]]
    const api = await client({ schema })
    t.equal(api.bar, undefined)
  })

  t.test('no errors when fetching schema and schema is provided', async (t) => {
    const fetch = async () => {
      throw new Error('Failed to fetch schema')
    }
    const schema = [['add', 2]]
    const api = await client({ fetch, schema })
    t.equal(typeof api.add, 'function')
  })

  // Could add to improve debugging.
  t.test('rejected schema promise', async (t) => {
    const schema = Promise.reject(new Error())
    await t.rejects(() => client({ schema, fetch }))
  })

  t.test('resolves to an object with `call` method', async (t) => {
    const schema = [['add', 2]]
    const fetch = async () => ({ ok: true, json: async () => schema })
    const api = await client({ schema, fetch })
    t.type(api.call, 'function')
  })

  t.test('invokes API endpoints with correct arguments', async (t) => {
    const schema = [['add', 2]]
    const expr = ['add', 2, 3]
    const fetch = async (url, options) => {
      t.match(options.body, expr)
      t.end()

      return { ok: true, json: async () => [5] }
    }

    const api = await client({ schema, fetch })
    await api.call(expr)
  })

  t.test('handles invalid response format', async (t) => {
    const schema = { add: 2 }
    const fetch = async () => {
      return { ok: true, json: async () => ({ result: 5 }) }
    }

    try {
      await client({ schema, fetch })
    } catch (error) {
      t.ok(error instanceof FurverInvalidSchemaError)
    }
  })

  t.test('bulk', async (t) => {
    // Fake a response from the server.
    const identity = (a, { body }) => {
      const [, ...result] = JSON.parse(body)

      return result
    }

    const fn = bulk(identity)

    const [a, b, c] = await Promise.all([
      fn('a', { body: 1 }),
      fn('b', { body: 2 }),
      fn('c', { body: 3 })
    ])

    t.same(a, 1)
    t.same(b, 2)
    t.same(c, 3)
  })

  t.test('get api schema', async t => {
    const mySchema = [['foo', 1], ['bar', 2]]
    const config = {
      schema: () => mySchema
    }
    const api = await client(config)

    t.equal(schema(api), mySchema)
    t.end()
  })

  // TODO: test('get', async (t) => { })
  // TODO: test('post', async (t) => { })
})
