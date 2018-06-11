import { initStorage } from '../lib/helpers'

export default app => {
  const store = initStorage(app)({
    admin: null
  })

  const init = () => {
    store.admin = Blockchain.transaction.from
  }

  const withdraw = balance => {
    const { from } = Blockchain.transaction

    if (store.admin !== from) {
      throw new Error(`You're not the owner.`)
    }

    const result = Blockchain.transfer(from, new BigNumber(balance * 10 ** 18))

    if (!result) {
      throw new Error('Transfer failed.')
    }
  }

  return {
    init,
    store,
    withdraw
  }
}
