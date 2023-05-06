// TBD: Remove ramda from this lisp.
import { curryN, hasIn, map } from 'ramda'

class CrispError extends Error {}

const isFunction = x => typeof x === 'function'

function castFunction(x) {
  return isFunction(x) ? x : () => x
}

const crispEval = curryN(2, async (env, expression) => {
  if (!Array.isArray(expression)) {
    return expression
  }

  const [operator, ...args] = expression

  // If operator is an array, return its JSON value.
  if (Array.isArray(operator)) {
    return Promise.all(operator.map(crispEval(env)))
  }

  if (operator === 'fn') {
    const [body] = args

    return (fnEnv) => crispEval(Object.assign(Object.create(env), fnEnv), body)
  }

  if (operator === 'let') {
    const letEnv = Object.create(env)
    const [letBindings, letBody] = args

    await Promise.all(map(async ([name, letExpr]) => {
      letEnv[name] = await crispEval(letEnv, letExpr)
    }, letBindings))

    return crispEval(letEnv, letBody)
  }

  // Throw error if operator is not in env.
  if (!hasIn(operator, env)) {
    throw new CrispError(`Unknown expression: ${operator}`)
  }

  const fn = castFunction(env[operator])

  try {
    return await fn(...(await Promise.all(map(crispEval(env), args))))
  } catch (error) {
    console.error('crisp:error ', expression)
    throw error
  }
})

export default crispEval
