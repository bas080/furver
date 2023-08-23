# ./server.mjs

<!-- toc -->

- [Import](#import)
- [Reference](#reference)
  * [server](#server)
  * [withConfig](#withconfig)
    + [option.onResponse](#optiononresponse)
    + [option.onRequest](#optiononrequest)
    + [option.onError](#optiononerror)
  * [withRequest](#withrequest)
  * [withResponse](#withresponse)

<!-- tocstop -->

The server module makes it easier to integrate furver server behaviour in
framework implementations or in your own code.

> This module does not start an HTTP server. The `./http.mjs` module is responsible for
> that and it uses the server module.

## Import

```javascript
import {

  // A function that makes it easier to implement furver in your node server.
  server,

  // Helpers to extend module behaviours.
  withRequest,
  withConfig

} from './server.mjs'
```

## Reference

### server

A function that takes an object which could be the module export or any object.
It then returns a function which is called on request.

```js
// A pseudo express implementation.
route.get(async (request, response) =>
  await server(object)(request, response, req.params.body))
```

### withConfig

The `withConfig` function is completely optional and used to define behavior
that is performed on every request, response or error. Simply wrap the exported
object of the module with this function and provide the methods you would like
to be called.

```js
const option = {
  onResponse(req, res, result) { },
  onRequest(req, res) { },
  onError(req, res, error) { },
}

const api = {
  add(a, b) { return a + b; },
  // ...
}

export default withConfig(option, api)
```

> All methods are `await`ed which allows for async behavior.

#### option.onResponse

When defined, this method will override the response behavior and instead use
the behavior defined in this method.

An example of simple response behavior.

```js
onResponse: (req, res, result) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.write(JSON.stringify(result))
  res.end()
}
```

#### option.onRequest

Does not override any functionality and is simply called. You could set values
on the request object which are later used in other functions.

#### option.onError

When defined, it overides the error response. It behaves similarly to `option.onResponse`.


### withRequest

The `withRequest` function is used to create API endpoints that can access the
current HTTP request object. To create an API endpoint that can access the
request object, simply define a method that takes the request object as its
first argument and use `withRequest` to wrap it.

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
```

The example server has a function for getting the request method.

```bash
curl -X PATCH "http://localhost:$PORT" -d '["method"]'
```
```
"PATCH"
```

Having access to a request object allows for request specific features like
sessions.


### withResponse

If you wish to get access to the response object you can use the `withResponse`
helper in a similar manner as the `withRequest` helper.

> Yes, the withResponse documentation should be improved.


