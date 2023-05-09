import * as ramda from 'ramda'
import lips from '@jcubic/lips'
import { readFileSync } from 'node:fs'
import { withRequest } from '../server.mjs'
import { promises } from '../promises.mjs'

const _package = JSON.parse(readFileSync('./package.json').toString())

const invoices = {}

const messages = (() => {
  const messages = []
  const waiting = promises()

  return {

    async onNew (length) {
      if (length == null) { throw new Error('You must suply a length') }

      // Get new messages.
      if (length < messages.length) return messages.slice(length)

      // Wait for new messages.
      await waiting.promise()

      // Recur to get the new messages.
      return this.onNew(length)
    },

    push (...newMessages) {
      const length = messages.push(...newMessages)

      // Share that the waiting is over.
      waiting.resolve(true)

      return length
    }

  }
})()

const api = {
  ...ramda,

  // Simple onPing long polling listener and ping to send a message to those
  // requests.

  ...((() => {
    const onPing = promises()

    return {
      ping (value) {
        return onPing.resolve(value)
      },
      onPing () {
        return onPing.promise()
      }
    }
  })()),

  async onNewMessages (length) {
    return await messages.onNew(length)
  },

  message (newMessages) {
    return messages.push(...newMessages)
  },

  method: withRequest(req => {
    return req.method
  }),

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
  createInvoice (data) {
    const id = 42
    invoices[id] = data
    return id
  },
  invoiceById (id) {
    return invoices[id]
  },
  cannotMutate: 'initial value',
  mutate () {
    // Because of freeze this is not allowed.
    api.cannotMutate = 'otherValue'
  }
}

export default api
