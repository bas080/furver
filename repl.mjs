import readline from 'readline'
import _debug from './debug.mjs'

const debug = _debug.extend('repl')

export default function repl (cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  debug('Started REPL')

  rl.prompt()

  rl.on('line', async (input) => {
    try {
      // eslint-disable-next-line
      const output = eval(input)

      console.log(JSON.stringify(await cb(output), null, 2))
    } catch (err) {
      console.error(err)
    }

    rl.prompt()
  }).on('close', () => {
    debug('Exiting REPL')
    process.exit(0)
  })
}
