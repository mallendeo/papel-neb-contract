import AdminController from './controllers/admin'
import SheetsController from './controllers/sheets'
import UsersController from './controllers/users'

export default class PapelApp {
  constructor () {
    this.admin = AdminController(this)
    this.sheets = SheetsController(this)
    this.users = UsersController(this)
  }

  init () {
    this.admin.init()
    this.sheets.init()
    this.users.init()
  }

  // 👥 Users
  // ----------------------------

  setUsername (from, username, oldUsername) {
    return this.users.setUsername(from, username, oldUsername)
  }

  saveUser (user) {
    return this.users.saveUser(user)
  }

  getUser (username) {
    return this.users.getUser(username)
  }

  // 📝 Sheets
  // ----------------------------

  saveSheet (key, opts) {
    return this.sheets.saveSheet(key, opts)
  }

  // 🔐 Admin
  // ----------------------------

  withdraw (balance) {
    return this.admin.withdraw(balance)
  }
}
