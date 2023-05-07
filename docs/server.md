# Furver Server

## withRequest

The `withRequest` function is used in conjunction with the `FurverServer`
function to create API endpoints that can access the current HTTP request
object. To create an API endpoint that can access the request object, simply
define a method that takes the request object as its first argument and use
`withRequest` to wrap it.

For example, the following code creates an API endpoint that can access the
request object:

```js
const myEndpoint = withRequest(function (request, arg1, arg2) {
  // http request object
  console.log(request.url);

  // rest of the arguments are passed through
  console.log(arg1, arg2);
});
```

This endpoint can then be added to the API object and called by the client:

```js
const api = {
  myEndpoint,
  // other endpoints...
};

const server = await FurverServer(api);
```

Having access to a request allows for request specific features.
