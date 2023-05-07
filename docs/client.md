# Furver Client

To use the FurverClient, first import it into your project:

```javascript
import FurverClient from 'furver/client.mjs'
```

Then, create an instance of the client by calling it with the required options:

```javascript
const client = await FurverClient({
  endpoint: 'http://localhost:3000',
  fetch: customFetchFunction,
  schema: customSchemaFunction
})
```

The options object can have the following properties:

- `endpoint`: The URL of the Furver API server to connect to. Default: `'http://localhost:3000'`.
- `fetch`: The fetch function to use for making API requests. Default: `FurverClient.fetch`.
- `schema`: The function to use for retrieving the schema of the Furver API. Default: `FurverClient.schema`.

Once you have an instance of the client, you can call methods on it as defined by the Furver API schema. For example, if the schema has a method called `getUsers`, you can call it like this:

```javascript
const users = await client.getUsers()
```

The client also has an `exec` method that can be used to call any method on the API, even if it's not defined in the schema. For example:

```javascript
const result = await client.exec(['customMethod', arg1, arg2])
```

This will call the `customMethod` method on the API with the specified arguments.

Note that the `fetch` and `schema` options can be customized by passing your own functions to the client constructor. For example, if you want to use a different fetch library, you can pass it like this:

```javascript
const client = await FurverClient({
  fetch: myFetchLibrary.fetch
})
```
