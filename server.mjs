import { exec } from './lisp.mjs'
import _debug from './debug.mjs'
import { FurverExpressionError } from './error.mjs'
import curry from './curry.mjs'

const isNotNil = x => x != null
const debug = _debug.extend('server')
const debugError = debug.extend('error')
const furverSymbol = Symbol('server')

const withRequest = method => function (...args) {
  const request = this[furverSymbol].request

  return method.call(this, request, ...args)
}

const withResponse = method => function (...args) {
  const response = this[furverSymbol].response

  return method.call(this, response, ...args)
}

const withConfig = curry((config, api) => {
  debug('Configured with', config)

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

  deepFreeze(api)

  debug('API', api)

  return async function onFurverRequest (request, response, program) {
    if (isNotNil(onRequest)) {
      request.body = program
      await onRequest(request, response)
    }

    try {
      debug('Evaluate', program)

      // Create a copy of env to reduce the chance of mutations.
      const requestEnv = { ...api }

      requestEnv[furverSymbol] = { request, response }

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
export { server, withRequest, withResponse, withConfig }
