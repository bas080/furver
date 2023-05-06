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
  await serve(api)
})()
