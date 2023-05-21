# Contributing

## Dependencies

Lists projects dependencies and the versions.

```bash bash
npm --version  # Dependency management
node --version # Testing and implementation
bash --version # For usage examples

# Examples on how to use server
curl --version | head -n 1 | cut -f -2 -d ' '
```
```
9.6.6
v20.2.0
GNU bash, version 5.0.17(1)-release (x86_64-pc-linux-gnu)
Copyright (C) 2019 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
curl 7.68.0
```

Other:

- [markatzea][markatzea]

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

added 320 packages in 5s

35 packages are looking for funding
  run `npm fund` for details

up to date, audited 3 packages in 1s

found 0 vulnerabilities

added 1 package, and audited 484 packages in 2s

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

You should now be able to run the bin scripts and tests.

## Tests

```bash bash
npm t -- -R classic

# or with code coverage
# npx c8 npm t
```
```

> furver@0.0.23 test
> tap *.test.mjs --no-cov -R classic

cli.test.mjs .......................................... 4/4 1s
client.test.mjs ..................................... 12/12
debounce.test.mjs ..................................... 3/3
lisp.test.mjs ....................................... 10/10
promises.test.mjs ................................... 10/10
server.test.mjs ....................................... 4/4
total ............................................... 43/43

  43 passing (2s)

  ok
```

## Formatting

```bash bash
npx standard || {
  npx standard --fix
  exit 1
}
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

```bash bash
set -euo pipefail

# Spawn a server to demonstrate examples.
export PORT=8999
npx furver server ./example/api.mjs&

# Could use pinging instead to wait for the server to start.
sleep 4

for mz in *.mz ;do
  test "$mz" = "CONTRIBUTING.mz" && continue
  name="${mz%.*}"
  md="${name}.md"
  echo "Generating docs for: $mz > $md"
  rm -f "$md"
  markatzea "$mz" | tee "$md" 1>&2
  chmod -w "$md"
done

# Add a TOC
chmod +w README.md
npx markdown-toc -i README.md
chmod -w README.md

# Stop the server
pkill furver
```
```
Generating docs for: client.mz > client.md
Generating docs for: lisp.mz > lisp.md
Generating docs for: README.mz > README.md
Generating docs for: server.mz > server.md
```

## Changelog

The [changelog][changelog] is generated using the useful
[auto-changelog][auto-changelog] project.

```bash bash > /dev/null
npx auto-changelog -p
```

[changelog]:./CHANGELOG.md
[auto-changelog]:https://www.npmjs.com/package/auto-changelog
