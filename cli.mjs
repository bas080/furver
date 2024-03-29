#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import serve from './http.mjs'
import path from 'node:path'
import Debug from 'debug'

const debug = Debug('furver:cli')

const noop = () => {}

async function createApi (modules) {
  const api = await modules.reduce(async (merged, filePath) => {
    merged = await merged
    if (filePath.startsWith('.')) { filePath = path.join(process.cwd(), filePath) }

    const mod = await import(filePath)

    const exported = mod.default || mod

    // Assign the default to module name if not already taken
    if (mod.default && !exported[filePath]) {
      exported[filePath] = mod.default
    }

    return Object.assign(Object.create(merged), exported)
  }, {})

  return api
}

function throws (cb) {
  try {
    cb()
    return false
  } catch (error) {
    return true
  }
}

const name = 'furver'
process.title = name

// Debug.enable('*:start,*:error')

const argv = yargs(hideBin(process.argv))
  .scriptName(name)
  .demandCommand(1, 'You must specify a command')
  .env(name.toUpperCase())
  .command('server <modules..>', 'start server', noop, async ({ modules, port }) => {
    serve(modules, port)
  })
  .command('repl [modules..]', 'start a local server or client repl', noop, async ({ url, modules }) => {
    if (url) {
      const { default: repl } = await import('./repl.mjs')
      const { default: FurverClient } = await import('./client.mjs')

      const api = await FurverClient({ endpoint: url })

      Object.keys(api).forEach(key => {
        if (!global[key]) global[key] = api[key]
      })

      repl(async function awaitEval (cmd, context, filename, callback) {
        const value = eval(cmd) // eslint-disable-line

        if (isPromise(value)) { return callback(null, await value) }

        callback(null, await api.call(value))
      })

      return
    }

    if (!modules) {
      throw new Error('No --url or modules.. defined.\nEither define modules or a --url connection string.')
    }

    const { default: repl } = await import('./repl.mjs')
    const { exec } = await import('./lisp.mjs')

    Object.keys(modules).forEach(key => {
      if (!global[key]) {
        const value = modules[key]

        global[key] = value

        if (isFunction(value)) { value.toJSON = () => key }
      }
    })

    repl(async function awaitEval (cmd, context, filename, callback) {
      const value = eval(cmd) // eslint-disable-line

      if (isPromise(value)) { return callback(null, await value) }

      callback(null, await exec(modules, value))
    })
  })

  .command({
    command: 'client',
    describe: 'start client repl. Use repl --url instead',
    deprecated: true,
    hidden: true,
    handler: () => {
      // Handle the deprecated subcommand here
      console.log('Use the "repl" subcommand')
      process.exit(1)
    }
  })

  .command('schema [modules..]', 'print schema of api', noop, async ({ modules, url }) => {
    if (modules) {
      const { default: schema } = await import('./schema.mjs')
      console.log(JSON.stringify(schema(modules)))
      return
    }

    if (!url) {
      throw new Error('No --url or modules.. defined.\nEither define modules or a --url connection string.')
    }

    const { default: FurverClient, schema } = await import('./client.mjs')
    const api = await FurverClient({ endpoint: url })

    return console.log(JSON.stringify(await schema(api)))
  })
  .option('url', {
    type: 'string',
    check (x) {
      return !throws(() => new URL(x))
    }
  })
  .option('modules', {
    description: 'Name or path to modules',
    array: true,
    type: 'string',
    async coerce (x) {
      return x && await createApi(x)
    }
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    coerce (x) {
      if (x) {
        Debug.enable(`${name}*`)
      }
      return x
    }
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    default: process.env.PORT || 3000,
    check (x) {
      return isNaN(Number(x))
    }
  })
  .parse()

debug('Options', await argv)

function isFunction (x) {
  return typeof x === 'function'
}

function isPromise (x) {
  return x && isFunction(x.then)
}
