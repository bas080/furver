# Furver

Furver is a minimal RPC solution that uses JSON and Node.js. Turn any
JavaScript module into a simple to use client API that is easy to learn
while also expressive enough for advanced use-cases.

[![NPM](https://img.shields.io/npm/v/furver?color=blue&style=flat-square)](https://www.npmjs.com/package/furver)
[![NPM Downloads](https://img.shields.io/npm/dm/furver?style=flat-square)](https://www.npmjs.com/package/furver)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/furver?style=flat-square)](https://snyk.io/vuln/npm:furver)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![License](https://img.shields.io/npm/l/furver?color=brightgreen&style=flat-square)](./LICENSE)

<details><summary>Table of Contents</summary>

<!-- toc -->

- [Features](#features)
- [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Define a module](#define-a-module)
  * [Start the server](#start-the-server)
  * [Request using curl](#request-using-curl)
  * [Request using the furver client](#request-using-the-furver-client)
- [Server](#server)
- [Client](#client)
  * [Use in your code](#use-in-your-code)
  * [Client REPL](#client-repl)
  * [Browser](#browser)
- [Lisp](#lisp)
- [CLI](#cli)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

</details>

## Features

- Low code.
- Makes it easy to quickly iterate.
- Supports bulk requests with an intuitive client js API.
- Parallel operations out of the box.
- Covers both simple and complicated use-cases.

## Getting Started

Covers the basic use case of defining a module, starting a server and
performing requests with and without the client.

### Installation

```bash
npm install furver -g
```

### Define a module

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

### Start the server

Port 5000 for the following examples.

```bash
furver server ./example/getting-started.mjs --port 5000
```

Now for the http clients.

### Request using curl

```bash
curl http://localhost:5000 -d '["ping"]'
```
```
"pong"
```

Let's add some numbers to our `items` array.

```bash
curl http://localhost:5000 -d '["array", ["push", 1], ["push", 2], ["push", 3], ["items"]]'
```
```
[1,2,3,[1,2,3]]
```

### Request using the furver client

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

## Server

You can start a server by pointing to a module. This can be a npm package or
another file on the filesystem.

```bash
npm install ramda # A utility library.
npx furver server --port 3000 ramda ./example/api.mjs
```

Defining multiple modules will result in the modules being merged into a single
API. The function of the most right module will take precedence when the
modules have conflicting function names.

You can now perform requests using a furver client.

[Read more about the Furver server.](./server.md)

## Client

Now that we have a server running we can use the client to perform requests
using either the client functions or a simple JSON Lisp.

Here an working example of the JavaScript client.

### Use in your code

```javascript
(async function() {
  const { default: FurverClient } = await import('./client.mjs')

  // Fetches the schema and installs the schema methods on the api.
  const api = await FurverClient({endpoint: `http://localhost:${process.env.PORT}`})

  // These function calls result in a single request that is run in parallel on
  // the server.
  console.log(await Promise.all([
    api.identity('hello world'),
    api.timestamp(),
    api.version()
  ]))

  // We can write the same query using the JSON Lisp
  console.log(await api.call(['array', ['identity', 'hello world'], ['timestamp'], ['version']]))

  // Those are many quotes, we can reduce it by using the function reference.
  const { identity, timestamp, version, array } = api
  console.log(await api.call([array, [identity, 'hello world'], [timestamp], [version]]))
})()
```
```javascript
[ 'hello world', 1687512872227, '1.1.0' ]
[ 'hello world', 1687512872232, '1.1.0' ]
[ 'hello world', 1687512872236, '1.1.0' ]
```

All three ways are equivalent and valid ways of writing a furver Lisp program
that is run server-side.

This client is compatible with the browser and Node.js.

### Client REPL

You can also start talking with a Furver server using the cli.

```bash
furver client --port 3000
```

This will start a prompt that takes valid JavaScript or a Lisp expression.

```bash
> identity('hello')
"hello"
> ['identity', 'world']
"world"
> [identity, 'goodbye']
"goodbye"
```

### Browser

By default the server hosts a browser friendly bundled version of the client at
`/client.min.js`. This script registers the `furver` global variable.

You can try this client in the playground by starting a furver server and
opening `http://localhost:3000/playground` in your browser.

[Read more about the client.](./client.md)

## Lisp

Furver's Lisp-like language allows developers to perform complex aggregations
and operations in a single request. It builds ontop of JSON by using arrays for
its s-expressions.

[Read more about the furver lisp.](./lisp.md)

## CLI

The goal of Furver's cli is to provide you with all the tools to use, test and
debug Furver servers.

```bash
furver --help
```
```
Usage: furver [command] [options..]

Commands:
  furver server <modules..>                 start server
  furver repl <modules..>                   start a repl without server
  furver client [port|url]                  start client repl
  furver schema                             print schema of api
  [modules..]|[--port]|[--url]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
      --url                                                             [string]
      --modules  Name or path to modules                                 [array]
  -v, --verbose                                                        [boolean]
  -p, --port                                          [number] [default: "8999"]
```

[Read more about the Furver CLI.](./cli.md)

## Changelog

See the [CHANGELOG.md](./CHANGELOG.md) for a list of changes over time.

## Contributing

Want to contribute? The [CONTRIBUTING.md](./CONTRIBUTING.md) might help you get
started quicker.

## License

See the [LICENSE.txt](./LICENSE.txt) file for details.
