import eslint from 'rollup-plugin-eslint'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'

export default {
  input: 'src/contract.js',
  output: {
    file: 'dist/contract.js',
    format: 'cjs'
  },
  plugins: [
    eslint(),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**',
      extensions: ['.js']
    }),
    cleanup()
  ]
}
