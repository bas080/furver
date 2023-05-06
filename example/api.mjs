import * as ramda from 'ramda'
import lips from '@jcubic/lips'
import { readFileSync } from 'node:fs'

const _package = JSON.parse(readFileSync('./package.json').toString())

const api = {
  ...ramda,
  version () {
    return _package.version
  },
  timestamp () {
    return Date.now()
  },
  async lips (string) {
    const results = await lips.exec(string)
    return results.valueOf()
  },
  cannotMutate: 'initial value',
  mutate () {
    // Because of freeze this is not allowed.
    api.cannotMutate = 'otherValue'
  }
}

export default api
