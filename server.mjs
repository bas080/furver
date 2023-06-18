import { exec } from './lisp.mjs'
import _debug from './debug.mjs'
import { FurverExpressionError } from './error.mjs'
import curry from './curry.mjs'

const isNotNil = x => x != null
const debug = _debug.extend('server')
const debugError = debug.extend('error')
const furverSymbol = Symbol('server')

const withRequest = method => function (...args) {
  const request = this[furverSymbol]

  return method.call(this, request, ...args)
}

const withConfig = curry((config, api) => {
  api[furverSymbol] = config

  return api
})

const array = (...args) => args

function server (api) {
  debug('API config: ', Boolean(api[furverSymbol]))

  api.array = api.array || array

  const {
    onRequest,
    onResponse,
    onError
  } = api[furverSymbol] || {}

  const frozenDeep = deepFreeze(api)

  debug('API', api)

  return async function onFurverRequest (request, response, program) {
    if (isNotNil(onRequest)) {
      await onRequest(request, response)
    }

    try {
      debug('Evaluate', program)

      // Create a copy of env to reduce the chance of mutations.
      const requestEnv = { ...frozenDeep }

      requestEnv[furverSymbol] = request

      const result = await exec(requestEnv, program)

      debug('Result', result)

      if (isNotNil(onResponse)) {
        return await onResponse(request, response, result)
      }

      return result
    } catch (error) {
      // Add some sane defaults for the status codes.
      if (error instanceof FurverExpressionError) {
        error.status = 404
      }

      debugError(error)

      if (isNotNil(onError)) {
        await onError(request, response, error)
        throw error
      }

      throw error
    }
  }
}

function deepFreeze (object, name = '', frozen = new Set()) {
  if (isPrimitive(object) || frozen.has(object)) {
    return object
  }

  try {
    Object.freeze(object)
    debug('Froze', name)
  } catch (error) {
    debugError('Cannot freeze', object)
  }

  frozen.add(object)

  for (const key in object) {
    deepFreeze(object[key], key, frozen)
  }

  return object
}

function isPrimitive (value) {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

export default server
export { server, withRequest, withConfig }
