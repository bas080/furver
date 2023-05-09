import readline from 'readline'
import _debug from './debug.mjs'

const debug = _debug.extend('repl')
const debugError = _debug.extend('repl').extend('error')

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

      await Promise.race([
        sleep(200),
        cb(output)
          .then(json => {
            console.log(input, '=>', JSON.stringify(json, null, 2))
          })
          .catch(debugError)
      ])

      // console.log(JSON.stringify(await cb(output), null, 2))
    } catch (err) {
      debugError(err)
    }

    rl.prompt()
  }).on('close', () => {
    debug('Exiting REPL')
    process.exit(0)
  })
}
