import _debug from './debug.mjs'

const debug = _debug.extend('lisp')

const curryN = (n, fn) => {
  const arity = n || fn.length
  return function curried (...args) {
    if (args.length >= arity) {
      return fn.call(this, ...args)
    }
    return (...newArgs) => curried.call(this, ...args, ...newArgs)
  }
}

const isFunction = x => typeof x === 'function'

function castFunction (x) {
  return isFunction(x) ? x : () => x
}

const exec = curryN(2, async (env, expression) => {
  debug('exec', expression)

  if (!Array.isArray(expression)) {
    return expression
  }

  const [operator, ...args] = expression

  // If operator is an array, return its JSON value.
  if (Array.isArray(operator)) {
    return Promise.all(operator.map(exec(env)))
  }

  if (operator === 'fn') {
    const [body] = args

    return (fnEnv) => exec(Object.assign(Object.create(env), fnEnv), body)
  }

  if (operator === 'let') {
    const letEnv = Object.create(env)
    const [letBindings, letBody] = args

    await Promise.all(letBindings.map(async ([name, letExpr]) => {
      letEnv[name] = await exec(letEnv, letExpr)
    }))

    return exec(letEnv, letBody)
  }

  // Throw error if operator is not in env.
  if (!(operator in env)) {
    const error = new Error(`Unknown expression: ${operator}`)
    debug(error)
    throw error
  }

  const fn = castFunction(env[operator])

  try {
    return await fn.call(env, ...(await Promise.all(args.map(exec(env)))))
  } catch (error) {
    debug(error)
    throw error
  }
})

export { exec }
