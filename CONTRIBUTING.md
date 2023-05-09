# Contributing

## Development

First clone the project and then run `npm link`.

```bash bash
npm install
npm ci
npm link
npm link furver
git add package-lock.json
```
```

removed 1 package, and audited 483 packages in 1s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

added 320 packages, and audited 483 packages in 3s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

up to date, audited 3 packages in 1s

found 0 vulnerabilities

added 1 package, and audited 484 packages in 1s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

You should now be able to run the bin scripts.

## Tests

```bash bash
npm t -- -R classic

# or with code coverage
# npx c8 npm t
```
```

> furver@0.0.23 test
> tap *.test.mjs --no-cov -R classic

cli.test.mjs .......................................... 4/4
client.test.mjs ..................................... 12/12
debounce.test.mjs ..................................... 3/3
lisp.test.mjs ....................................... 10/10
promises.test.mjs ................................... 10/10
server.test.mjs ....................................... 4/4
total ............................................... 43/43

  43 passing (1s)

  ok
```

## Formatting

```bash bash
npx standard
```

## Client Bundle

```bash bash
npm run build
git add ./client.min.js
```
```

> furver@0.0.23 build
> babel ./client.mjs --presets=@babel/env > client.min.js

```

## Documentation

Generate docs with [markatzea][markatzea].

```bash bash
# Spawn a server to demonstrate examples.

export PORT=8999

npx furver ./example/api.mjs&

sleep 4

rm -f README.md

markatzea README.mz | tee README.md 1>&2


npx markdown-toc -i README.md

chmod -w ./README.md

pkill furver
```

## Changelog

The [changelog][changelog] is generated using the useful
[auto-changelog][auto-changelog] project.

```bash bash > /dev/null
npx auto-changelog -p
```

[changelog]:./CHANGELOG.md
[auto-changelog]:https://www.npmjs.com/package/auto-changelog
