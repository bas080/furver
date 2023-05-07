# Furver Lisp

The `lisp.mjs` module provides an implementation of a Lisp interpreter that can
evaluate basic expressions, handle let and fn expressions, and throw an error
for unknown expressions. The interpreter is asynchronous and returns a Promise
that resolves to the result of the evaluation.


> The Lisp was added because I, Bas Huis, wanted support for bulk requests.
> I needed a way to represent that in JSON. JSON, because it is simple to
> serialize and parse. I had a a JSON Lisp laying around and it seems to me
> like a good match for this purposes since it manages async and doing things
> in parallel. I added the `fn` and `let` to make it a bit fancier but really
> it's not necessary.

Usage
-----

To use the Lisp interpreter, you first need to import the `exec` function from
the module:

```javascript
import { exec } from 'furver/lisp.mjs'
```

Once you have imported the `exec` function, you can call it with an environment
object and an expression to evaluate:

```javascript
const env = { '+': (a, b) => a + b }
const expression = ['+', 1, 2]

exec(env, expression)
  .then(result => console.log(result)) // 3
  .catch(error => console.error(error))
```

The `exec` function takes two arguments:

1. The environment object in which the expression is evaluated. This is an
   object that maps operator names to functions that implement those operators.
   In the example above, the environment object contains a `+` operator that
   adds two numbers.

2. The expression to evaluate. This is an array that represents the expression
   in the Lisp syntax. The first element of the array is the operator name, and
   the rest of the elements are the arguments to the operator. In the example
   above, the expression is `['+', 1, 2]`, which means "add 1 and 2".

Let Expressions
---------------

The Lisp interpreter supports let expressions, which allow you to define local
variables in an expression. A let expression has the form:

```lisp
(let ((name1 value1) (name2 value2) ...) body)
```

The `let` operator takes two arguments:

1. An array of bindings, where each binding is a pair of a variable name and
   its value.

2. The body expression, which is evaluated in a new environment that includes
   the variable bindings.

Here's an example of using a let expression:

```javascript
const env = { '+': (a, b) => a + b }
const expression = ['let', [['x', 2], ['y', 3]], ['+', ['x'], ['y']]]

exec(env, expression)
  .then(result => console.log(result)) // 5
  .catch(error => console.error(error))
```

This expression defines two lexically scoped variables `x` and `y` with values
2 and 3, respectively, and then adds them together.

Fn Expressions
--------------

The Lisp interpreter also supports fn expressions, which allow you to define
anonymous functions. An fn expression has the form:

```lisp
(fn body)
```

The `fn` operator takes only the body argument. It does not support arguments
as the environment already allows passing aliased values to the body. If you
wish to define your own values you should use the let statement.

Here's an example of using an fn expression:

```javascript
const env = { '+': (a, b) => a + b }
const expression = ['fn', ['+', 1, ['x']]]

exec(env, expression)
  .then(result => console.log(typeof result)) // function
  .catch(error => console.error(error))
```

This expression defines an anonymous function that adds 1 to a single argument
`x`.

To invoke the function, you pass it an environment object that contains the
argument values:

```javascript
const env = { '+': (a, b) => a + b }
const expression = ['fn', ['+', 1, ['x']]]

exec(env, expression)
  .then(fn => fn({ x: 2 }))
  .then(result => console.log(result)) // 3
  .catch
```


In conclusion, the lisp.mjs module provides an asynchronous implementation of
a Lisp interpreter that supports basic expressions, let expressions, and fn
expressions.
