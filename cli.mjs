#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import schema from './schema.mjs'
import serve from './server.mjs'
import path from 'node:path'

const name = 'furver'
process.title = name

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [...modules] [options]')
  .scriptName(name)
  .option('verbose', {
    alias: 'v',
    type: 'boolean'
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    default: process.env.PORT || 3000
  })
  .option('endpoint', {
    alias: 'e',
    type: 'string'
  })
  .option('repl', {
    alias: 'r',
    type: 'boolean',
    description: 'Enable the repl.'
  })
  .option('schema', {
    alias: 's',
    type: 'boolean',
    description: 'Output the API schema without running the server.'
  })
  .parse()

if (argv.verbose) {
  process.env.DEBUG = '*'
}

async function createApi (modules) {
  const api = await modules.reduce(async (merged, filePath) => {
    merged = await merged
    if (filePath.startsWith('.')) { filePath = path.join(process.cwd(), filePath) }

    const mod = await import(filePath)
    const exported = mod.default || mod

    return { ...merged, ...exported }
  }, {})

  return api
}

(async function () {
  const api = await createApi(argv._)

  if (argv.schema) {
    console.log(JSON.stringify(schema(api)))
    process.exit()
  }

  process.env.PORT = argv.port

  if (!argv.endpoint) {
    await serve(api)
  }

  if (argv.endpoint) {
    const repl = await import('./repl.mjs')
    const FurverClient = await import('./client.mjs')
    const api = await FurverClient.default({ endpoint: argv.endpoint })

    repl.default(api.exec)
  }

  if (argv.repl) {
    const repl = await import('./repl.mjs')
    const { exec } = await import('./lisp.mjs')

    repl.default(exec(api))
  }
})()
