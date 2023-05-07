# Furver Client

## Usage

To use the FurverClient, first import it into your project:

```javascript
import FurverClient from 'furver/client.mjs'
```

Then, create an instance of the client by calling it with the required options:

```javascript
const client = await FurverClient({
  endpoint: 'http://localhost:3000',
  fetch: customFetchFunction,
  schema: customSchemaFunction,
  method: 'post'
})
```

The options object can have the following properties:

- `endpoint`: The URL of the Furver API server to connect to. Default: `'http://localhost:3000'`.
- `fetch`: The fetch function to use for making API requests. Default: `FurverClient.fetch`.
- `schema`: The function to use for retrieving the schema of the Furver API. Default: `FurverClient.schema`.
- `method`: The HTTP method to use for bulk requests. Default: `'post'`.

Once you have an instance of the client, you can call methods on it as defined by the Furver API schema. For example, if the schema has a method called `getUsers`, you can call it like this:

```javascript
const users = await client.getUsers()
```

The client also has a `post` and `get` method that can be used to call any method on the API, even if it's not defined in the schema. For example:

```javascript
const result = await client.post(['customMethod', arg1, arg2])
```

This will call the `customMethod` method on the API with the specified arguments.

The `get` method should be used when no mutations occur. Using `get` has the benefits that HTTP GET requests might have in your application/infrastructure.

Note that the `fetch`, `schema`, and `method` options can be customized by passing your own functions or values to the client constructor. For example, if you want to use a different fetch library, you can pass it like this:

```javascript
const client = await FurverClient({
  fetch: myFetchLibrary.fetch
})
```

## Customizing fetch and schema

The fetch and schema options can be customized by passing your own functions to
the client constructor. For example, if you want to use a different fetch
library, you can pass it like this:

```javascript
const client = await FurverClient({
  fetch: myFetch
  schema: mySchemaFetch,
})
```
