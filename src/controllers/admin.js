import { initStorage } from '../lib/helpers'
import { AppError, UnauthorizedError } from '../lib/errors'

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
      throw UnauthorizedError(`You're not the owner.`)
    }

    const result = Blockchain.transfer(from, new BigNumber(balance * 10 ** 18))

    if (!result) {
      throw AppError('Transfer failed.')
    }
  }

  return {
    init,
    store,
    withdraw
  }
}
