// USING MAINNET: USE_MAINNET

import Sheet from './sheet'

class PapelApp {
  constructor () {
    LocalContractStorage.defineMapProperty(this, 'sheets', {
      parse: text => new Sheet(text),
      stringify: o => o.toString()
    })

    // This will be replaced by rollup
    this.ownerAddr = USE_MAINNET === 'true' ? MAINNET_OWNER : TESTNET_OWNER
  }

  init () {

  }

  withdraw (balance) {
    const from = Blockchain.transaction.from
    if (this.ownerAddr !== from) {
      throw new Error(`You're not the owner.`)
    }

    const result = Blockchain.transfer(from, new BigNumber(balance))

    if (!result) {
      throw new Error('Transfer failed.')
    }
  }
}

export default PapelApp
