import { promises } from './promises.mjs'

export function debounce (callback, milliseconds = 0) {
  const { resolve, reject, promise } = promises()

  let timeout

  innerDebounce.calls = []

  async function innerDebounce (...args) {
    innerDebounce.calls.push(args)

    timeout && clearTimeout(timeout)

    timeout = setTimeout(() => {
      resolve(callback(innerDebounce.calls))
      innerDebounce.calls = []
    }, milliseconds)

    return promise()
  }

  innerDebounce.reject = reject

  // TODO: Consider adding a resolve for an early resolve.

  return innerDebounce
}

export function debounceWithIndex (callback, milliseconds = 0) {
  const innerDebounce = debounce(callback, milliseconds)

  return async (...args) => {
    const index = innerDebounce.calls.length

    return (await innerDebounce(...args))[index]
  }
}
