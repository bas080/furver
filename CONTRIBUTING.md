# Contributing

## Development

First clone the project and then run `npm link`.

```bash bash
npm install
npm ci
npm link
git add package-lock.json
```
```

up to date, audited 483 packages in 2s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

added 320 packages, and audited 483 packages in 3s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

up to date, audited 3 packages in 1s

found 0 vulnerabilities
```

You should now be able to run the bin scripts.

## Client Bundle

```bash bash
npm run build
git add ./client.min.js
```
```

> furver@0.0.23 build
> babel ./client.mjs --presets=@babel/env > client.min.js

```

## Formatting

```bash bash
npx standard
```

## Documentation

Generate docs with [markatzea][markatzea].

```bash bash
# Spawn a server to demonstrate examples.

export PORT=8999

npx furver ./example/api.mjs&

sleep 4

markatzea README.mz | tee README.md 1>&2

npx markdown-toc -i README.md

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
