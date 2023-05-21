# Furver

Turn any JavaScript module into a JSON web API with a built-in client and
Lisp-like language for complex server-side operations.

[![NPM](https://img.shields.io/npm/v/furver?color=blue&style=flat-square)](https://www.npmjs.com/package/furver)
[![NPM Downloads](https://img.shields.io/npm/dm/furver?style=flat-square)](https://www.npmjs.com/package/furver)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/furver?style=flat-square)](https://snyk.io/vuln/npm:furver)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![License](https://img.shields.io/npm/l/furver?color=brightgreen&style=flat-square)](./LICENSE)

<!-- toc -->

- [Server](#server)
- [Client](#client)
- [Lisp](#lisp)
- [CLI](#cli)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Server

To use Furver, simply spin up a server.

```bash bash | head -n 1
npx furver server ./example/api.mjs
```

This command will convert the specified JavaScript module into a JSON web API
that also hosts the schema of the module.

Furver includes a client that fetches the schema and creates an API that
corresponds to the functions in the module.

[Read more about the Furver server.](./server.md)

## Client

- It allows the API to be consumed as if it is defined in the current process.
- The client automatically handles bulk requests, combining sequential calls
  into a single request.
- Works both in the browser and node.
- Supports receiving messages.

```js node
(async function() {

  const { default: FurverClient } = await import('./client.mjs')

  const api = await FurverClient({endpoint: `http://localhost:${process.env.PORT}`})

  console.log(await Promise.all([
    api.identity('hello world'),
    api.timestamp(),
    api.version()
  ]))

})()
```
```
[ 'hello world', 1684641858075, '0.1.0' ]
```

By default the server hosts a bundled version of the client at `/client.min.js`.
Using this file is optional.

You can try this client in the playground by starting a furver server and
opening `/playground` in your browser.

[Read more about the client.](./client.md)

## Lisp

Furver's Lisp-like language allows developers to perform complex aggregations
and operations in a single request. For example, to create and get an invoice
in a single request:

```javascript node
(async function() {

  const { default: FurverClient } = await import('./client.mjs')

  const api = await FurverClient({endpoint: `http://localhost:${process.env.PORT}`})

  const createAndGetInvoice = ['invoiceById', ['createInvoice', {
    amount: 42, customerId: 1
  }]]

  console.log(await api.call(createAndGetInvoice))
})()
```
```
{ amount: 42, customerId: 1 }
```

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
