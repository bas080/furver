# Furver

Furver is a tool that allows you to convert any JavaScript module into a JSON
web API in seconds, without requiring you to set up complex routing and
response handling. With Furver, you can simply add an HTTP server and route
requests to your module's functions, or use a pre-built client to access the
API from within your Node.js or browser code. Furver also includes a simple
Lisp-like language that allows you to perform complex aggregations and
operations in a single request.



## Usage

To use Furver, simply spin up a server.

```bash
npx furver ./example/api.mjs
```

This command will convert the specified JavaScript module into a JSON web API.
Furver includes a client with functions that correspond to those in the module,
and it automatically handles bulk requests, combining sequential calls into
a single POST request.


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
[ 'hello world', 1683392116305, '0.0.10' ]
```


You can also use the furver command-line interface (CLI) to generate the schema
for the API.

```bash bash | head -c 80 && echo
furver --schema ./example/api.mjs
```
```
[["F",0],["T",0],["__",null],["add",2],["addIndex",1],["addIndexRight",1],["adju
```

This command generates the schema and outputs it to the console. You can also
pass the schema as an object to the client to avoid fetching it from the
server.

Here's a list of available options for the furver CLI:

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

If your use-case is more complex, it might be better to write it as a function
in the JavaScript module rather than using the Lisp-like language. This
decision should be based on your application's needs.

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
