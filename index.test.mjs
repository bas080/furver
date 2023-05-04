import { test } from 'tap'
import crispEval from './index.mjs'

test('should evaluate basic expressions correctly', (t) => {
  t.plan(4);

  crispEval({ '+': (a, b) => a + b }, ['+', 1, 2])
    .then((result) => t.equal(result, 3, '1 + 2 = 3'));

  crispEval({ '-': (a, b) => a - b }, ['-', 5, 3])
    .then((result) => t.equal(result, 2, '5 - 3 = 2'));

  crispEval({ '*': (a, b) => a * b }, ['*', 4, 3])
    .then((result) => t.equal(result, 12, '4 * 3 = 12'));

  crispEval({ '/': (a, b) => a / b }, ['/', 10, 2])
    .then((result) => t.equal(result, 5, '10 / 2 = 5'));
});

test('should handle let expressions', (t) => {
  t.plan(1);

  crispEval({ '+': (a, b) => a + b }, ['let', [['x', 2], ['y', 3]], ['+', ['x'], ['y']]])
    .then((result) => t.equal(result, 5, 'x + y = 5'));
});

test('should handle fn expressions', (t) => {
  t.plan(2);

  crispEval({}, ['fn', ['+', 1, 'x']])
    .then((result) => t.equal(typeof result, 'function', 'should return a function'));

  crispEval({ '+': (a, b) => a + b }, ['fn', ['+', 1, ['x']]])
    .then(async (result) => {
      t.equal(await result({ x: 2 }), 3, '1 + 2 = 3')
    });
});

test('should throw an error for unknown expressions', (t) => {
  t.plan(1);

  crispEval({ '+': (a, b) => a + b }, ['-', 1, 2])
    .catch((err) => t.equal(err.message, 'Unknown expression: -', 'should throw an error for unknown expressions'));
});

test('should evaluate nested expressions correctly', (t) => {
  t.plan(1);

  const env = {
    '+': (a, b) => a + b,
    '*': (a, b) => a * b,
  };

  crispEval(env, ['*', 2, ['+', 1, 2]])
    .then((result) => t.equal(result, 6, '2 * (1 + 2) = 6'));
});

test('should concatenate two arrays', async t => {
  t.plan(1)

  const env = { concat: (a, b) => a.concat(b) };
  const expression = ['concat', [[1, 2, 3]], [[4, 5, 6]]];
  const result = await crispEval(env, expression);

  t.same(result, [1,2,3,4,5,6])
});
