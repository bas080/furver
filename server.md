# ./server.mjs

The furver server module has the following features:

- A `FurverServer` function which starts a http server with furver lisp support
  - Knows how to parse a furver request and execute the Furver lisp.
  - Supports both get with query params and post/put/patch requests with
    a body.
- A helper (`withRequest`) for defining api methods that have access to the
  request object.

## Request examples

For these examples we assume a server is running with the `ramda` utility
library selected as a module.

Let's look at a simple curl example. We'll use the `inc` function to
confirm that the lisp is evaluated.

```bash bash
curl -X POST "http://localhost:$PORT" \
  -d '["inc", 41]'
```
```
42
```

> PUT, PATCH and DELETE are also valid methods. Furver server only cares about
> the existance of the body or the `body` query param.

And now for a get request example.

```bash bash
curl -G "http://localhost:$PORT" --data-urlencode body='["inc", 42]'
```
```
43
```

> We use the `-G` and `--data-urlencode` to perform a GET request with properly
> encoded JSON in the body query param.

This demonstrates that the server has a very clear purpose, it is to receive
a request, parse the furver lisp program and evaluate that program before
sending it back to the http client.

## FurverServer


```node node
const port = Number(process.env.PORT) + 1;

async function main() {
  const { default: FurverServer } = await import('./server.mjs')

  const server = await FurverServer({
    hello: () => 'world'
  }, port)

  const res = await fetch(`http://localhost:${port}`, {
    method: 'POST',
    body: JSON.stringify(["hello"])
  })

  console.log(await res.json())

  process.exit()
}
main()
```
```
world
```

## withRequest

`import { withRequest } from 'furver/server.mjs'`

The `withRequest` function is used in conjunction with the `FurverServer`
function to create API endpoints that can access the current HTTP request
object. To create an API endpoint that can access the request object, simply
define a method that takes the request object as its first argument and use
`withRequest` to wrap it.

For example, the following code creates an API endpoint that can access the
request object:

```js
const method = withRequest(function (request, arg1, arg2) {
  // http request object
  console.log(request.url);

  // rest of the arguments are passed through
  console.log(arg1, arg2);
});
```

This endpoint can then be added to the API object and called by the client:

```js
const api = {
  method,
  // other endpoints...
};

const server = await FurverServer(api);
```

The example server has a function for getting the request method.

```bash bash
curl -X PATCH "http://localhost:$PORT" -d '["method"]'
```
```
"PATCH"
```

Having access to a request allows for request specific features like sessions.
