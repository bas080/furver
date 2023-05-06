# Furver

Furver is a tool that allows you to convert any JavaScript module into a JSON
web API in seconds, without requiring you to set up complex routing and
response handling. With Furver, you can simply add an HTTP server and route
requests to your module's functions, or use a pre-built client to access the
API from within your Node.js or browser code. Furver also includes a simple
Lisp-like language that allows you to perform complex aggregations and
operations in a single request.



## Usage

```bash
npx furver ./example/api.mjs --port=4040
```

And it comes with a client that has functions that directly map to the
functions in the provided module.

```js cat ./example/client.mjs && node ./example/client.mjs
```
```
import FurverClient from '../client.mjs'

const api = await FurverClient({endpoint: `http://localhost:${process.env.PORT}`})

await Promise.all([
  api.identity('hello world'),
  api.timestamp(),
  api.version()
])
```

It also automatically performs bulk requests for you. These three function
calls result in a single POST request.

```bash bash
furver --help
```
```
Usage: furver [...modules] [options]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -v, --verbose                                                        [boolean]
  -p, --port                                          [number] [default: "8999"]
  -s, --schema   Output the API schema without running the server.     [boolean]
```

## HTTP Frameworks

You might be using a (popular) HTTP framework. Furver should support your
framework. If not, it should be trivial to implement.

> Open for **contributors**.

## Schema

For debugging or other reasons it is possible to get the schema using the
`furver` cli.

```bash bash | head -c 80 && echo
furver --schema ./example/api.mjs
```
```
[["F",0],["T",0],["__",null],["add",2],["addIndex",1],["addIndexRight",1],["adju
```

## Security

Furver provides a "deep freeze" mechanism to prevent the object exported by the
module from being mutated. However, developers should be aware that Furver is
a flexible tool and they must ensure that their code is secure.


## Advanced Usage

Furver's Lisp-like language allows developers to perform complex aggregations
and operations in a single request. For example, to create and get an invoice
in a single request:

```javascript
import Api from 'furver/client.mjs'

const api = Api({endpoint: 'http://localhost:3000'})

const createAndGetInvoice = ['invoiceById', ['createInvoice', {
  amount: 42, customerId: 1
}]]

api(createAndGetInvoice)
  .then(invoice => console.log(invoice))
```

Use-cases can be more complex. It might be better to write complex use-cases in
the js module as a function instead of in the lisp language. This should be
determined based on your application's needs.

## Tests

Run tests with code coverage report.

```bash
npx c8 npm t -- -R classic --no-cov
```

## Contributing

Furver is an open-source project, and contributions are always welcome. If you
would like to contribute, please see the GitHub repository for more
information.

## License

See the [LICENSE](./LICENSE.md) file for details.
