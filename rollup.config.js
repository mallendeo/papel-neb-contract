import eslint from 'rollup-plugin-eslint'

export default {
  input: 'src/contract.js',
  output: {
    file: 'dist/contract.js',
    format: 'cjs'
  },
  plugins: [eslint()]
}
