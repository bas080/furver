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

```bash bash -eo pipefail
# Run tests and generate a coverage report
npx c8 npm t -- -R classic --no-cov
```
```

> furver@0.0.4 test
> tap *.test.mjs -R classic --no-cov

client.test.mjs ....................................... 4/5
  Skipped: 1
    handles errors when fetching schema

lisp.test.mjs ....................................... 10/10
server.test.mjs ....................................... 0/3
  Returns 400 when receiving malformed JSON data
  not ok fetch failed
    stack: |
      Test.<anonymous> (file://server.test.mjs:23:15)
    at:
      line: 11522
      column: 11
      file: node:internal/deps/undici/undici
      function: Object.fetch
    type: TypeError
    cause:
      !error
      name: Error
      message: connect ECONNREFUSED 127.0.0.1:3000
      stack: |-
        Error: connect ECONNREFUSED 127.0.0.1:3000
            at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1571:16)
      errno: -111
      code: ECONNREFUSED
      syscall: connect
      address: 127.0.0.1
      port: 3000
    tapCaught: returnedPromiseRejection
    test: Returns 400 when receiving malformed JSON data
  
  Returns 500 status
  not ok fetch failed
    origin:
      at:
        line: 11522
        column: 11
        file: node:internal/deps/undici/undici
        function: Object.fetch
      stack: |
        Test.<anonymous> (file://server.test.mjs:37:17)
      type: TypeError
      cause:
        !error
        name: Error
        message: connect ECONNREFUSED 127.0.0.1:3000
        stack: |-
          Error: connect ECONNREFUSED 127.0.0.1:3000
              at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1571:16)
        errno: -111
        code: ECONNREFUSED
        syscall: connect
        address: 127.0.0.1
        port: 3000
    found:
      !error
      name: TypeError
      message: fetch failed
      stack: >-
        TypeError: 
            at Object.fetch (node:internal/deps/undici/undici:11522:11)
            at processTicksAndRejections (node:internal/process/task_queues:95:5)
            at Test.<anonymous> (file:///home/ant/projects/furver/server.test.mjs:37:17)
      cause:
        name: Error
        message: connect ECONNREFUSED 127.0.0.1:3000
        stack: |-
          Error: connect ECONNREFUSED 127.0.0.1:3000
              at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1571:16)
        errno: -111
        code: ECONNREFUSED
        syscall: connect
        address: 127.0.0.1
        port: 3000
    at:
      line: 45
      column: 7
      file: file:///home/ant/projects/furver/server.test.mjs
      type: Test
    stack: |
      Test.<anonymous> (file://server.test.mjs:45:7)
  
  Test 200 status
  not ok fetch failed
    stack: |
      Test.<anonymous> (file://server.test.mjs:54:15)
    at:
      line: 11522
      column: 11
      file: node:internal/deps/undici/undici
      function: Object.fetch
    type: TypeError
    cause:
      !error
      name: Error
      message: connect ECONNREFUSED 127.0.0.1:3000
      stack: |-
        Error: connect ECONNREFUSED 127.0.0.1:3000
            at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1571:16)
      errno: -111
      code: ECONNREFUSED
      syscall: connect
      address: 127.0.0.1
      port: 3000
    tapCaught: returnedPromiseRejection
    test: Test 200 status

total ............................................... 14/18
  

  14 passing (30s)
  1 pending
  3 failing

----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------|---------|----------|---------|---------|-------------------
All files       |   71.86 |    85.45 |    64.7 |   71.86 |                   
 furver         |   71.64 |    85.18 |   84.61 |   71.64 |                   
  cli.mjs       |   85.41 |       40 |     100 |   85.41 | 35-36,39-43       
  client.mjs    |   91.22 |    85.71 |     100 |   91.22 | 18-19,24,49-50    
  lisp.mjs      |   94.44 |       95 |     100 |   94.44 | 49-51             
  schema.mjs    |   14.28 |      100 |       0 |   14.28 | 2-7               
  server.mjs    |   46.07 |    85.71 |      75 |   46.07 | 8-14,30-75,90-91  
 furver/example |   74.07 |      100 |       0 |   74.07 |                   
  api.mjs       |   74.07 |      100 |       0 |   74.07 | 11,14,17-18,22-24 
----------------|---------|----------|---------|---------|-------------------
```
bash -eo pipefail exited with code 1
