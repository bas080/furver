import { test } from 'tap'
import { debounce, debounceWithIndex } from './debounce.mjs'

test('debounce', async (t) => {
  t.plan(1)

  const add = (calls) => calls.flat().reduce((acc, val) => acc + val, 0)
  const debouncedAdd = debounce(add, 100)

  debouncedAdd(1, 2)

  t.equal(await debouncedAdd(3, 4, 5), 15)
})

test('debounceWithIndex should debounce and return the correct result', async t => {
  t.plan(2)

  const callback = async (calls) => calls.map(([x]) => x * 2)

  const debouncedFn = debounceWithIndex(callback, 100)

  const result1 = await debouncedFn(2)
  t.equal(result1, 4, 'should return 2 * 2 = 4')

  const result2 = await debouncedFn(3)
  t.equal(result2, 6, 'should return 3 * 2 = 6')
})
