import { initStorage } from '../lib/helpers'
import { AppError, UnauthorizedError } from '../lib/errors'

export default app => {
  const store = initStorage(app)({
    admin: null
  })

  const { from } = Blockchain.transaction

  const init = () => {
    store.admin = Blockchain.transaction.from
  }

  const _checkPermissions = (role = 'admin') => {
    if (store.admin === from) return

    const userStore = app.users.store
    const user = userStore.users.get(from)
    const found = user.roles.find(r => r === role)
    if (!found) throw UnauthorizedError()
  }

  const _updateUser = (username, opts) => {
    const userStore = app.users.store
    const userAddr = userStore.usernameMap.get(username)
    const profile = userStore.users.get(userAddr)
    return userStore.users.put(userAddr, { ...profile, ...opts })
  }

  const setUserBan = (username, isBanned = true) => {
    _checkPermissions('moderator')
    _updateUser(username, { isBanned })
  }

  const setUserRoles = (username, roles = []) => {
    _checkPermissions('admin')
    _updateUser(username, { roles })
  }

  const withdraw = balance => {
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
    withdraw,
    setUserBan,
    setUserRoles
  }
}
