// TBD: Remove ramda from this lisp.
import { curryN, hasIn, map } from 'ramda'

const isFunction = x => typeof x === 'function'

function castFunction(x) {
  return isFunction(x) ? x : () => x
}

const exec = curryN(2, async (env, expression) => {
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

    await Promise.all(map(async ([name, letExpr]) => {
      letEnv[name] = await exec(letEnv, letExpr)
    }, letBindings))

    return exec(letEnv, letBody)
  }

  // Throw error if operator is not in env.
  if (!hasIn(operator, env)) {
    throw new Error(`Unknown expression: ${operator}`)
  }

  const fn = castFunction(env[operator])

  try {
    return await fn(...(await Promise.all(map(exec(env), args))))
  } catch (error) {
    console.error('ferver:error ', expression)
    throw error
  }
})

export { exec }
