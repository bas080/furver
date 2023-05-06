# Furver

Convert any module into a JSON web api in *seconds*.

## Reasoning

Developing and designing a JSON api can take more time then one might have.
What if the js module itself is the API? This is what Furver does.

## Server

`PORT=3000 furver-server ./example/api.mjs`

Yes it is that simple. With great convenience comes great joy.

You can now perform requests to `http://localhost:3000`.

```js
fetch('http://localhost:3000', {
  method: 'post',
  body: JSON.stringify([['version']])
})
  .then(res => res.json())
  .then(console.log)
```

See the [client](#Client) section for a nicer way to consume this API.

## HTTP Frameworks

You might be using a (popular) HTTP framework. Furver should support your
framework. If not, it should be trivial to implement.

> Open for **contributors**.

## Schema

```bash bash
# Using head to reduce the amount printed.
furver-schema ./example/api.mjs | head -c 80
echo -e '\n'
```
```
[["F",0],["T",0],["__",null],["add",2],["addIndex",1],["addIndexRight",1],["adju

```

## Client

Furver comes with a totally optional javascript client that needs to be pointed
to a running furver server. This will fetch the schema and create the available
functions.

```javascript
import FurverClient from 'furver/client.mjs'

const myApi = await FurverClient({endpoint: 'http://localhost:3000'})

const [timestamp, version] = await Promise.all([
  myApi.timestamp()
  myApi.version()
])
```

These separate calls will be done in **a single POST request**. Make sure you
understand your promises in order to get these benefits. The following will not
perform these operations in a single request.

```js
await api.version()
await api.timestamp()
```

The client also offers the `.exec()` method. This can be overwritten in the
module. It takes valid Furver lisp.

```js
await api.exec(['version']) // Responds with the package.json version.
```

## Security

Furver, just like any other tool, is not secure as is. It is a flexible tool
that allows you to do what you want to do and therefore also allows you to
shoot yourself in the foot.

It does try to completely "deep freeze" the object the module exports. This is
to prevent outsiders from mutating the api in whatever manner. This is not
a guarantee that outsiders can't mutate the environment.

If you wish to enforce certain permissions, you would need to write or wrap the
functions in that module to do so.

## Advanced (optional)

Furver comes with a bare-bones lisp like language built on top of JSON. This
makes for an easy to serialize and parse programming language that supports
more complicated use-cases. The language has the builtin operators `let` and
`fn` and loads in the provided module as the environment.

This allows one to perform complete aggregations server side with a single
request.

Imagine we have a use-case where a user can create an invoice. On success the
user is shown the details page of that invoice. A normal JSON api requires
a POST and then a GET to be performed. Furver's lisp allows you to do this in
a single POST request.

```javascript
import Api from 'furver/client.mjs'

const api = Api({endpoint: 'http://localhost:3000'})

const createAndGetInvoice = ['invoiceById', ['createInvoice', {
  amount: 42, customerId: 1
}]]

api(createAndGetInvoice)
  .then(invoice => console.log(invoice))
```

The newly created invoice id is only known on the server. By telling the server
you want that value to be passed to the `invoiceById` function, we can now
cover our use-case with a single request.

Use-cases can be more complex. It might be better to write complex use-cases in
the js module as a function instead of in the lisp language. This should be
determined based on your application's needs.

### I want a better lisp

Furver offers a very simple lisp. It does not intend to expand the lisp (much
further). Instead, it can play nice with existing js lisp implementations. You
can simply add your desired lisp exec function to the module and delegate the
lisp code to it. See the ./example/api.mjs that adds `lips` as a method.

```node
> await a.lips('(+ 1 2) (- 2 1)')
[ '3', '1' ]
```

## Tests

```bash bash -eo pipefail
# Clean install dependencies.
npm ci &> /dev/null

# Run tests and generate a coverage report
npx c8 npm t -- -R classic --no-cov
```
```

> furver@0.0.2 test
> tap *.test.mjs -R classic --no-cov

client.test.mjs ....................................... 4/5
  Skipped: 1
    handles errors when fetching schema

lisp.test.mjs ....................................... 10/10
server.test.mjs ....................................... 4/4
total ............................................... 18/19

  18 passing (552.824ms)
  1 pending
----------------|---------|----------|---------|---------|-------------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s       
----------------|---------|----------|---------|---------|-------------------------
All files       |   68.16 |    91.48 |    62.5 |   68.16 |                         
 furver         |   67.43 |     91.3 |   83.33 |   67.43 |                         
  client.mjs    |   91.22 |    85.71 |     100 |   91.22 | 18-19,24,49-50          
  lisp.mjs      |   94.44 |       95 |     100 |   94.44 | 49-51                   
  schema.mjs    |   14.28 |      100 |       0 |   14.28 | 2-7                     
  server.mjs    |      43 |     90.9 |   66.66 |      43 | 18-24,27-72,77-78,88-89 
 furver/example |   74.07 |      100 |       0 |   74.07 |                         
  api.mjs       |   74.07 |      100 |       0 |   74.07 | 11,14,17-18,22-24       
----------------|---------|----------|---------|---------|-------------------------
```
