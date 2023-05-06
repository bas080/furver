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
[ 'hello world', 1683411641652, '0.0.18' ]
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
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -v, --verbose                                                        [boolean]
  -p, --port                                          [number] [default: "8999"]
  -e, --endpoint                                                        [string]
  -r, --repl      Enable the repl.                                     [boolean]
  -s, --schema    Output the API schema without running the server.    [boolean]
```

## Reference


### `FurverClient(options)`

Creates an instance of the FurverClient API client.

#### Parameters

- `options` (Object): The options for configuring the client.
  - `endpoint` (string): The URL of the server API. Defaults to `'http://localhost:3000'`.
  - `fetch` (function): The function to use for making requests. Defaults to `FurverClient.fetch`.
  - `schema` (function): The function to use for retrieving the server API schema. Defaults to `FurverClient.schema`.

#### Returns

- (Promise<Object>): A promise that resolves to an object representing the API
  client. The object contains methods for making requests to the server API.

#### Example

```javascript
import FurverClient from './FurverClient.js'

const client = await FurverClient({
  endpoint: 'https://example.com/api'
})

const result = await client.exec(['listUsers'])
console.log(result)
```

## Security

Furver provides a "deep freeze" mechanism to prevent the object exported by the
module from being mutated. However, developers should be aware that Furver is
a flexible tool and they must ensure that their code is secure.


## REPL

Furver includes a simple REPL (Read-Eval-Print Loop) that allows you to
interact with the API from the command line. To start the REPL, run the
following command:

```bash
npx furver ./example/api.mjs --repl
```

This will start the API server and a REPL prompt. You can then enter JSON
requests at the prompt and receive the responses.

For example, to call the identity function with the argument "hello world", you
would enter the following:

```json
["identity", "hello world"]
```

The REPL will parse the input as JSON, pass it to the lisp exec function, and
print the response to the console.

## REPL (remote)

To use the REPL with a remote Furver server, you need to specify the --endpoint
option when starting the Furver server.

For example, to connect to a remote Furver server running on http://localhost:3000:

```bash
npx furver --endpoint http://localhost:3000
```

You can exit the REPL by typing **Ctrl+C** or **Ctrl+D**.

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
