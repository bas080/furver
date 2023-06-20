import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './client.mjs',
  output: {
    name: 'furver',
    file: './client.min.js',
    format: 'iife',
    exports: 'named'
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    terser()
  ]
}
