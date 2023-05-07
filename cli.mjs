#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import schema from './schema.mjs'
import serve from './server.mjs'
import path from 'node:path'
import Debug from 'debug'

const name = 'furver'
process.title = name

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [...modules] [options]')
  .scriptName(name)
  .option('verbose', {
    alias: 'v',
    type: 'boolean'
  })
  .option('exec', {
    alias: 'e',
    type: 'string'
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    default: process.env.PORT || 3000
  })
  .option('endpoint', {
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
  Debug.enable(`${name}*`)
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

async function main () {
  const api = await createApi(argv._)

  if (argv.schema) {
    console.log(JSON.stringify(schema(api)))
    process.exit()
  }

  process.env.PORT = argv.port

  if (!argv.endpoint) {
    if (argv.exec) {
      const { exec } = await import('./lisp.mjs')

      console.log(JSON.stringify(await exec(api, JSON.parse(argv.exec))))
      process.exit()
    }

    await serve(api)
  }

  if (argv.endpoint) {
    const repl = await import('./repl.mjs')
    const FurverClient = await import('./client.mjs')

    const api = await FurverClient.default({ endpoint: argv.endpoint })

    if (argv.exec) {
      console.log(JSON.stringify(await api.post(JSON.parse(argv.exec))))
      process.exit()
    }

    repl.default(api.post)
  }

  if (argv.repl && !argv.endpoint) {
    const repl = await import('./repl.mjs')
    const { exec } = await import('./lisp.mjs')

    repl.default(exec(api))
  }
}

main()
