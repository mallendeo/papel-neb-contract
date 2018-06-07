import replace from 'rollup-plugin-replace'
import eslint from 'rollup-plugin-eslint'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/main.js',
    format: 'cjs'
  },
  plugins: [
    eslint(),
    replace({
      exclude: 'node_modules/**',
      USE_MAINNET: JSON.stringify(process.env.USE_MAINNET || 'true'),
      MAINNET_OWNER: JSON.stringify(process.env.MAINNET_ADDR || 'n1QbKTN2unFh5st41v9BA97oXcFtxMqcTV7'),
      TESTNET_OWNER: JSON.stringify(process.env.TESTNET_ADDR || 'n1NGsP8By5wvYpyK9FXRPvVeYso4ciUJzoZ')
    })
  ]
}
