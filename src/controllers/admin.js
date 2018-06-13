import { initStorage } from '../lib/helpers'
import { AppError, UnauthorizedError, NotFoundError } from '../lib/errors'

export default app => {
  const store = initStorage(app)({
    admin: null
  })

  const init = () => {
    store.admin = Blockchain.transaction.from
  }

  const _checkPermissions = (role = 'admin') => {
    const { from } = Blockchain.transaction
    if (store.admin === from) return

    const userStore = app.users.store
    const user = userStore.users.get(from)

    if (!user.roles) throw UnauthorizedError()

    const found = user.roles.find(r => r === role)
    if (!found) throw UnauthorizedError()
  }

  const _updateUser = (username, opts) => {
    const userStore = app.users.store
    const userAddr = userStore.usernameMap.get(username)
    if (!userAddr) throw NotFoundError(`Couldn't find user ${username}`)

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
    withdraw,
    setUserBan,
    setUserRoles
  }
}
