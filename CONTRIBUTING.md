# Contributing

## Dependencies

Lists projects dependencies and the versions.

```bash
npm --version  # Dependency management
node --version # Testing and implementation
bash --version | head -n 1 # For usage examples

# Examples on how to use server
curl --version | head -n 1 | cut -f -2 -d ' '
```
```
9.6.7
v20.3.1
GNU bash, version 5.0.17(1)-release (x86_64-pc-linux-gnu)
curl 7.68.0
```

Other:

- [markatzea][markatzea]

## Development

First clone the project and then run `npm link`.

```bash
npm ci
npm link
furver --version
```

You should now be able to run the bin scripts and tests.

## Tests

```bash
npm t -- -R classic

# or with code coverage
# npx c8 npm t
```
```

> furver@1.0.0 test
> tap -j 1 *.test.mjs --no-cov -R classic

cli.test.mjs .......................................... 4/4 2s
client.test.mjs ..................................... 16/16
curry.test.mjs ........................................ 4/4
debounce.test.mjs ..................................... 3/3
http.test.mjs ....................................... 10/10
lisp.test.mjs ....................................... 14/14
promises.test.mjs ................................... 10/10
total ............................................... 61/61

  61 passing (5s)

  ok
```

## Formatting

```bash
npx standard
```

## Client Bundle

```bash
set -euo pipefail

# Install dependencies without storing them in the package.json
npm install --no-save rollup \
  @rollup/plugin-babel \
  @rollup/plugin-commonjs \
  @rollup/plugin-terser \
  @rollup/plugin-node-resolve

# Uses the .babelrc and the rollup.config.mjs configs
npx rollup -c

git add ./client.min.js
```
```

added 32 packages, removed 1 package, and audited 402 packages in 6s

38 packages are looking for funding
  run `npm fund` for details

16 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

## Documentation

```bash
set -euo pipefail

# Install dependencies for the examples.
npm install ramda --no-save > /dev/null

# Spawn a server to demonstrate examples.
export PORT=8999
npx furver server ./example/api.mjs&

# And spawn one for the getting-started examples
npx furver server ./example/getting-started.mjs --port 5000&

# Could use pinging instead to wait for the server to start.
sleep 4

for mz in *.mz ;do
  test "$mz" = "CONTRIBUTING.mz" && continue
  name="${mz%.*}"
  md="${name}.md"
  echo "Generating docs for: $mz > $md"
  rm "$md" || true
  markatzea "$mz" | tee "$md" 1>&2
  chmod -x "$md"
done

# Add a TOC
npx markdown-toc -i README.md
npx markdown-toc -i client.md
npx markdown-toc -i lisp.md

# Remove tmp files created in the mz files.
rm -v .tmp.*

# Stop the server
pkill furver
```
```
Generating docs for: client.mz > client.md
Generating docs for: lisp.mz > lisp.md
Generating docs for: README.mz > README.md
Generating docs for: server.mz > server.md
removed '.tmp.client.example.mjs'
removed '.tmp.client.mjs'
removed '.tmp.getting.mjs'
removed '.tmp.lisp_exec.mjs'
removed '.tmp.lisp_fn.mjs'
removed '.tmp.lisp_import.mjs'
removed '.tmp.lisp_let.mjs'
removed '.tmp.lisp_ref.mjs'
```

## Changelog

The [changelog][changelog] is generated using the useful
[auto-changelog][auto-changelog] project.

```bash
npx auto-changelog -p
```

[changelog]:./CHANGELOG.md
[auto-changelog]:https://www.npmjs.com/package/auto-changelog
[markatzea]:https://github.com/bas080/markatzea
