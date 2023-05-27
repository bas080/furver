# Furver

Furver is a minimal RPC solution that uses JSON and Node.js. Turn any
JavaScript module into into a simple to use client API that is easy to learn
while also expressive enough for advanced use-cases.

[![NPM](https://img.shields.io/npm/v/furver?color=blue&style=flat-square)](https://www.npmjs.com/package/furver)
[![NPM Downloads](https://img.shields.io/npm/dm/furver?style=flat-square)](https://www.npmjs.com/package/furver)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/furver?style=flat-square)](https://snyk.io/vuln/npm:furver)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![License](https://img.shields.io/npm/l/furver?color=brightgreen&style=flat-square)](./LICENSE)

<details><summary>Table of Contents</summary>

<!-- toc -->

- [Features](#features)
- [Server](#server)
- [Client](#client)
  * [JavaScript](#javascript)
  * [REPL](#repl)
  * [Browser](#browser)
- [Lisp](#lisp)
- [CLI](#cli)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

</details>

## Features

- No boilerplate.
- Makes it easy to quickly iterate.
- Supports bulk requests with an intuitive client js API.
- Parallel operations out of the box.
- Covers both simple and complicated use-cases.

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

### JavaScript

```js node
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
  console.log(await api.call([[['identity', 'hello world'], ['timestamp'], ['version']]]))

  // Those are many quotes, we can reduce it by using the function reference.
  const { identity, timestamp, version } = api
  console.log(await api.call([[[identity, 'hello world'], [timestamp], [version]]]))
})()
```
```
[ 'hello world', 1685200096174, '0.1.1' ]
[ 'hello world', 1685200096179, '0.1.1' ]
[ 'hello world', 1685200096183, '0.1.1' ]
```

All three ways are equivalent and valid ways of writing a furver Lisp program
that is run server-side.

This client is compatible with the browser and Node.js.

### REPL

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
`/client.min.js`.

You can try this client in the playground by starting a furver server and
opening `http://localhost:3000/playground` in your browser.

[Read more about the client.](./client.md)

## Lisp

Furver's Lisp-like language allows developers to perform complex aggregations
and operations in a single request. For example, to create and get an invoice
in a single request:

```javascript node
(async function() {
  const { default: FurverClient } = await import('./client.mjs')

  const api = await FurverClient({endpoint: `http://localhost:${process.env.PORT}`})

  const { invoiceById, createInvoice } = api

  // You could do this which results in two http requests:

  console.log(await invoiceById(await createInvoice({
    amount: 42, customerId: 1
  })))

  // or you can perform the same action within a single request:

  const createAndGetInvoice = [invoiceById, [createInvoice, {
    amount: 42, customerId: 1
  }]]

  console.log(await api.call(createAndGetInvoice))
})()
```
```
{ amount: 42, customerId: 1 }
{ amount: 42, customerId: 1 }
```

The client waits a very short while and checks if multiple api methods have
been called. When that is the case it will combine those calls into a single
http request. That is not the case when using `await` before calling the next
function that depends on the return value of the previous function.

[Read more about the bare bones Furver lisp.](./lisp.md)


## CLI

The goal of Furver's cli is to provide you with all the tools to use, test and
debug Furver servers.

```bash bash
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

See the [LICENSE.md](./LICENSE.md) file for details.
