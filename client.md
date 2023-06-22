# ./client.mjs

<!-- toc -->

- [Import client](#import-client)
- [Initialize client](#initialize-client)
- [Client initialization config](#client-initialization-config)
- [Calling server functions](#calling-server-functions)

<!-- tocstop -->

The furver client is a powerful addition to the furver server. It makes it
easy to use the server and bundles requests into a single request when
possible.

> This project contains both a bundled browser friendly version of the client
> and a programmer friendly module. We'll be using the module version in this
> example.

The furver module exports the following functions:

## Import client

```javascript
import {

  // The function which creates a client.
  client,

  // Fetch preset function for fetching the schema from the server.
  schema,

  // A helper to create helpers for bundled requests.
  bulk,

  // Fetch preset functions that can be passed into the client config.
  get,
  post // default

} from './client.mjs'
```

## Initialize client

Here is an example of a client that performs get requests instead of the
default post requests.

```javascript
const furverGet = await client({
  endpoint: `http://localhost:${process.env.PORT}`,
  fetch: get,
})
```

> Using get can enable the use of HTTP caching either in a proxy or a client.
> Caching might cause confusion; it can also enable optimization.

The `get` method should be used when no mutations occur. Using `get` has the
benefits that HTTP GET requests might have in your application/infrastructure.


## Client initialization config

The options object can have the following properties:

|name|type|default|
|---|---|---|
|endpoint|`string`|http://localhost:3000|
|fetch|`(url: string, options: object) => Promise<any>`|client.post|
|schema|`false`\|`(endpoint) => Array<[name, arity]>`|client.schema|

No function will be set on the client if `schema` is set to `false` and you can
only use the `client.call` method that takes a furver lisp program.

Note that the `fetch`, `schema`, and `method` options can be customized by
passing your own functions or values to the client constructor.

Once you have an instance of the client, you can call methods on it as defined
by the Furver API schema.

## Calling server functions

```javascript
await furverGet.push(1)
await furverGet.push(2)
await furverGet.push(3)

console.log(await furverGet.items())
```
```
[ 1, 2, 3 ]
```

You can also perform multiple calls that are bundled into a single request. We
can prove this by enabling the logger and performing multiple function calls.


```javascript
await Promise.all([
    furverGet.push('hello'),
    furverGet.push('silly'),
    furverGet.push('world')
])

console.log(await furverGet.items())
```
```javascript
furver:client client initialized with endpoint http://localhost:8999
furver:client fetching schema from http://localhost:8999/schema
furver:client http://localhost:8999 {
  body: '["array",["push","hello"],["push","silly"],["push","world"]]'
}
furver:client http://localhost:8999 { body: '["array",["items"]]' }
[ 1, 2, 3, 'hello', 'silly', 'world' ]
```

The client also has a `call` method that can be used to call any method on the
API, even if it's not defined in the schema. For example:

```javascript
const result = await furverGet.call(['customMethod', 'arg1', 'arg2', ...rest])
```

This will call the `customMethod` method on the API with the specified arguments.

**What if I want to call the `call` function?** You can:

```javascript
console.log(

  await furverGet.call([
    'call',
    'arg1',
    'arg2'
  ]),

// or

  await furverGet.call([
    ['ref', 'call'], // "ref" has a special meaning in the furver lisp.
    'arg1',
    'arg2'
  ]),

// or

  await furverGet.call([
    furverGet.call, // Which expands to ['ref', 'call'].
    'arg1',
    'arg2'
  ])

)
```
```javascript
Return value of the call method defined in the module. Return value of the call method defined in the module. Return value of the call method defined in the module.
```

The `furverGet.call` method takes any furver lisp program. These can be as
complicated or simple as your use-case requires.

[Read more about the furver lisp.](./lisp.md)
