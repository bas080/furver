// ./example/getting-started.mjs

const items = []

export default {
  push (x) {
    return items.push(x)
  },
  items () {
    return items
  },
  ping () {
    return 'pong'
  }
}
