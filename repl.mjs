import _debug from './debug.mjs'
import repl from 'node:repl'

const debug = _debug.extend('repl')

export default function initRepl (cb) {
  debug('Starting REPL')
  repl.start({
    prompt: '> ',
    eval: cb
  })
}
