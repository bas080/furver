import FurverClient from '../client.mjs'

// Add an example where exec a lisp expression on the client that was sent by
// the server.
// import { exec } from '../lisp.mjs'

// const bob = await FurverClient({
//   endpoint: `http://localhost:${process.env.PORT}`
// })

const alice = await FurverClient({
  endpoint: `http://localhost:${process.env.PORT}`
})

// async function poll (cb) {
//   const config = {
//     iteration: 0,
//     error: {
//       count: 0
//     }
//   }
//
//   while (true) {
//     try {
//       return await cb(config)
//     } catch (error) {
//       config.iteration += 1
//       await sleep(Math.min(10000, 100 * config.iteration))
//       // backoff sleep
//       config.error.count += 1
//       config.error.last = error
//       console.error(error)
//     }
//   }
// }

// Will prevent flooding the server and handles errors in a sensible manner.
// const message = await poll(bob.onNotification)
// console.log(message)

await alice.notify('Hi Bob!')
setTimeout(async () => {
  await alice.notify('Bye Bob!')
}, 1000)
