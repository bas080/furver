import FurverClient from '../client.mjs'

const api = await FurverClient({endpoint: `http://localhost:${process.env.PORT}`})

console.log(await Promise.all([
  api.identity('hello world'),
  api.timestamp(),
  api.version()
]))
