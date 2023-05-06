#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import schema from './schema.mjs'
import serve from './server.mjs'

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
    default: process.env.PORT || 3000,
  })
  .option('schema', {
    alias: 's',
    type: 'boolean',
    description: 'Output the API schema without running the server.'
  })
  .parse()

;(async function () {

  // FIX THIS
  if (argv.verbose) {
    process.env.DEBUG = `*`
  }

  if (argv.schema) {
    const { default: api } = await import(process.argv[2])
    console.log(JSON.stringify(schema(api)))
    process.exit()
    return
  }

  process.env.PORT = argv.port

  await serve(argv._)
})()
