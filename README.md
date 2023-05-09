# Furver

Turn any JavaScript module into a JSON web API with a built-in client and
Lisp-like language for complex server-side operations.

[![NPM](https://img.shields.io/npm/v/furver?color=blue&style=flat-square)](https://www.npmjs.com/package/furver)
[![NPM Downloads](https://img.shields.io/npm/dm/furver?style=flat-square)](https://www.npmjs.com/package/furver)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/furver?style=flat-square)](https://snyk.io/vuln/npm:furver)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![License](https://img.shields.io/npm/l/furver?color=brightgreen&style=flat-square)](./LICENSE)

<!-- toc -->

- [Usage](#usage)
  * [Client](#client)
  * [Lisp](#lisp)
  * [CLI](#cli)
    + [REPL](#repl)
    + [Endpoint](#endpoint)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Usage

To use Furver, simply spin up a server.

```bash
npx furver ./example/api.mjs
```

This command will convert the specified JavaScript module into a JSON web API
that also hosts the schema of the module.

Furver includes a client that fetches the schema and creates an API that
corresponds to the functions in the module.

> [Read more about the Furver server.](./docs/server.md)

### Client

- It allows the API to be consumed as if it is defined in the current process.
- The client automatically handles bulk requests, combining sequential calls
  into a single POST request.
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
[ 'hello world', 1684373633954, '0.0.23' ]
```

By default the server hosts a bundled version of the client at `./client.min.js`.
Using this file is optional.

> TBD

```html
<script src="http://localhost:8999/client.js?jsonp=myFunction"></script>
<script>
  function myFunction(api) {
    console.log(await Promise.all([
      api.identity('hello world'),
      api.timestamp(),
      api.version()
    ]))
  }
</script>
```

> [Read more about the client.](./docs/client.md)

### Lisp

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

> [Read more about the bare bones Furver lisp.](./docs/lisp.md)


### CLI

The goal of Furver's cli is to provide you with all the tools to use, test and
debug Furver servers.

```bash bash
furver --help
```
```
Usage: furver [...modules] [options]

Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -v, --verbose                                                        [boolean]
  -e, --exec                                                            [string]
  -p, --port                                          [number] [default: "8999"]
      --endpoint                                                        [string]
  -r, --repl      Enable the repl.                                     [boolean]
  -s, --schema    Output the API schema without running the server.    [boolean]
```

#### REPL

Furver includes a simple REPL (Read-Eval-Print Loop) that allows you to
interact with the API from the command line using Furver's lisp. To start the
REPL, run the following command:

```bash
npx furver ./example/api.mjs --repl
```

Now type a valid lisp expression.

For example, to call the identity function with the argument "hello world", you
would enter the following:

```
> ["identity", "hello world"]
"hello world"
```

The REPL will parse the input as JSON, pass it to the lisp exec function, and
print the response to the console.

You can exit the REPL by typing **Ctrl+C** or **Ctrl+D**.

#### Endpoint

To connect with a remote Furver server, you need to specify the --endpoint
option when starting the Furver server.

```bash bash
npx furver --endpoint http://localhost:$PORT --exec '["identity", "hello remote"]'
```
```
"hello remote"
```

You can also start a REPL with a remote server.

## Changelog

See the [CHANGELOG.md](./CHANGELOG.md) for a list of changes over time.

## Contributing

Want to contribute? The [CONTRIBUTING.md](./CONTRIBUTING.md) might help you get
started quicker.

## License

See the [LICENSE.md](./LICENSE.md) file for details.
