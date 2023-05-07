# Contributing

## Development

First clone the project and then run `npm link`.

```bash bash
npm install
npm ci
npm link
npm install furver --no-save
```
```

removed 1 package, and audited 371 packages in 1s

31 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

added 208 packages, and audited 371 packages in 2s

31 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

up to date, audited 3 packages in 917ms

found 0 vulnerabilities

added 1 package, and audited 372 packages in 2s

31 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

You should now be able to run the bin scripts.

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
