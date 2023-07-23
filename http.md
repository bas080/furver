# ./http.mjs


## Starting a server

```node
const port = Number(process.env.PORT) + 1;

async function main() {
  const { default: FurverServer } = await import('./http.mjs')

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

This demonstrates that the server has a very clear purpose, it is to receive
a request, parse the furver lisp program and evaluate that program before
sending it back to the http client.

