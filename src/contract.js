import AdminController from './controllers/admin'
import SheetsController from './controllers/sheets'
import UsersController from './controllers/users'
import CommentsController from './controllers/comments'
import FilesController from './controllers/files'

export default class PapelApp {
  constructor () {
    this.admin = AdminController(this)
    this.sheets = SheetsController(this)
    this.users = UsersController(this)
    this.comments = CommentsController(this)
    this.files = FilesController(this)

    // Set instance props
    this.from = Blockchain.transaction.from
    this.user = this.users.store.users.get(this.from)

    // 👥 Users
    // ----------------------------

    // Prevent user from avoiding flood ban
    this.saveUser = user => this.users.saveUser(user)
    this.getUser = this.users.getUser
    this.getUserSheets = this.users.getUserSheets
    this.getUserFullProfile = this.users.getUserFullProfile
    this.getUserByAddress = this.users.getUserByAddress

    // 📝 Sheets
    // ----------------------------
    this.saveSheet = this.sheets.saveSheet
    this.getSheet = this.sheets.getSheet
    this.listSheets = this.sheets.listSheets

    // -- 💬 Comments
    this.getComments = this.comments.getComments
    this.postComment = this.comments.postComment
    this.removeComment = this.comments.removeComment
    this.updateComment = this.comments.updateComment

    // 🗄 Files
    // ----------------------------
    this.saveFiles = this.files.saveFiles
    this.removeFile = this.files.removeFile
    this.getFiles = this.files.getFiles

    // 🔐 Admin
    // ----------------------------
    this.setUserBan = this.admin.setUserBan
    this.setUserRoles = this.admin.setUserRoles
    this.setPick = this.admin.setPick
    this.setSoftBanTimeout = this.admin.setSoftBanTimeout
    this.withdraw = this.admin.withdraw
  }

  init ({ sheets, comments } = {}) {
    this.admin.init()
    this.sheets.init()
    this.users.init()
    this.comments.init()
    this.files.init()

    if (sheets) {
      sheets.forEach(sheet => {
        const { slug, ...data } = sheet
        this.saveSheet(slug, data)
      })
    }

    if (comments) {
      comments.forEach(comment => {
        const { slug, msg } = comment
        this.postComment(slug, msg)
      })
    }
  }
}
