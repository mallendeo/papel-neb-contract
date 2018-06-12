import AdminController from './controllers/admin'
import SheetsController from './controllers/sheets'
import UsersController from './controllers/users'

export default class PapelApp {
  constructor () {
    this.admin = AdminController(this)
    this.sheets = SheetsController(this)
    this.users = UsersController(this)

    // 👥 Users
    // ----------------------------
    this.setUsername = this.users.setUsername
    this.saveUser = this.users.saveUser
    this.getUser = this.users.getUser
    this.getUserFullProfile = this.users.getUserFullProfile

    // 📝 Sheets
    // ----------------------------
    this.saveSheet = this.sheets.saveSheet
    this.getSheet = this.sheets.getSheet

    // 🔐 Admin
    // ----------------------------
    this.withdraw = this.admin.withdraw
  }

  init () {
    this.admin.init()
    this.sheets.init()
    this.users.init()
  }
}
