import UsersController from './controllers/users'
import SheetsController from './controllers/sheets'

import { initStorage } from './lib/helpers'

class PapelApp {
  constructor () {
    this.store = initStorage(this)([
      { name: 'admin' }
    ])

    this.users = UsersController(this)
    this.sheets = SheetsController(this)
  }

  init () {
    this.store.admin = Blockchain.transaction.from

    this.users.init()
    this.sheets.init()
  }

  // --------------
  // Users
  // --------------
  setUsername (from, username, oldUsername) {
    return this.users.setUsername(from, username, oldUsername)
  }

  saveUser (user) {
    return this.users.saveUser(user)
  }

  getUser (username) {
    return this.users.getUser(username)
  }

  // --------------
  // Sheets
  // --------------

  saveSheet (key, opts) {
    return this.sheets.saveSheet(key, opts)
  }

  withdraw (balance) {
    const { from } = Blockchain.transaction
    if (this.store.admin !== from) {
      throw new Error(`You're not the owner.`)
    }

    const result = Blockchain.transfer(from, new BigNumber(balance * 10 ** 18))

    if (!result) {
      throw new Error('Transfer failed.')
    }
  }
}

export default PapelApp
