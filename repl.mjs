import readline from 'readline'

export default function repl (cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.prompt()

  rl.on('line', async (input) => {
    try {
      const output = JSON.parse(input)

      console.log(await cb(output))
    } catch (err) {
      console.error(err)
    }

    rl.prompt()
  }).on('close', () => {
    console.log('Exiting REPL')
    process.exit(0)
  })
}
