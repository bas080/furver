# Getting Started

Covers the basic use case of defining a module, starting a server and
performing requests with and without the client.

## Installation

```bash
npm install furver -g
```

## Define a module

```javascript
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
```

## Start the server

Port 5000 for the following examples.

```bash
furver server ./example/getting-started.mjs --port 5000
```

We'll use the curl and ping function to check if the server is working.

```bash
sleep 4
curl http://localhost:5000 -d '["ping"]'
```
```
"pong"
```

Now for the http clients.

## Request using curl


```bash
curl http://localhost:5000 -d '["array", ["push", 1], ["push", 2], ["push", 3], ["items"]]'
```
```
[1,2,3,[1,2,3]]
```

## Request using the furver client

Now let's use the furver client module and `api.push` some letters.

```javascript
import client from './client.mjs'

const api = await client({
  endpoint: 'http://localhost:5000'
})

console.log(await Promise.all([

  api.push('a'),
  api.call(['push', 'b']),
  api.call([['ref', 'push'], 'c']),
  api.call([api.push, 'd'])

]))

console.log(await api.items())
```
```
[ 4, 5, 6, 7 ]
[
  1,   2,   3,   'a',
  'b', 'c', 'd'
]
```

These are all equivalent ways of calling the push function in the server
module. Read more about the [client](./client.md) and [lisp](./lisp.md) if you
want to learn more.
