import eslint from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import replace from 'rollup-plugin-replace'

export default {
  input: 'src/contract.js',
  output: {
    file: 'dist/contract.js',
    format: 'cjs'
  },
  plugins: [
    eslint(),
    replace({
      'process.env.NODE_ENV': process.env.NODE_ENV || JSON.stringify('production')
    }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      plugins: [
        'external-helpers',
        'transform-object-rest-spread'
      ],
      presets: [
        ['env', {
          modules: false,
          targets: {
            node: 'current'
          }
        }]
      ]
    }),
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
