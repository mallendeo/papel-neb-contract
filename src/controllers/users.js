import User from '../models/user'
import { initStorage, slugSafe } from '../lib/helpers'
import {
  MissingParameterError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  UnauthorizedError
} from '../lib/errors'

export default app => {
  const store = initStorage(app)({
    usernameMap: { map: true },
    userIndexMap: { map: true },
    userMapSize: null,
    users: {
      map: true,
      parse: text => new User(text),
      stringify: o => JSON.stringify(o)
    }
  })

  const init = () => {
    store.userMapSize = 0
  }

  const _disallowMiddleware = (obj, truthy = true, props = ['isBanned']) => {
    const deny = props.some(prop =>
      truthy
        ? obj[prop]
        : typeof obj[prop] !== 'undefined'
    )
    if (deny) throw UnauthorizedError()
  }

  const _setUsername = (from, username, oldUsername) => {
    if (!slugSafe(username)) {
      throw BadRequestError('Invalid characters for "username"')
    }

    const ownerAddr = store.usernameMap.get(username)
    if (ownerAddr) throw ConflictError(`Username ${username} is taken`)
    if (oldUsername) store.usernameMap.del(oldUsername)
    store.usernameMap.put(username, from)
  }

  const saveUser = user => {
    const { username } = user
    if (!username) throw MissingParameterError('username')

    const { from } = Blockchain.transaction
    const found = store.users.get(from)

    // Check if the user is banned
    if (found) _disallowMiddleware(found, true)

    // Prevent user for changing his status and roles
    _disallowMiddleware(user, false, [
      'isBanned',
      'roles',
      'created',
      'updated'
    ])

    if (found && username !== found.username) {
      _setUsername(from, username, found.username)
    }

    if (!found) {
      _setUsername(from, username)
      user.created = Date.now()

      store.userIndexMap.put(store.userMapSize, from)
      store.userMapSize += 1
    }

    return store.users.put(from, { ...(found || {}), ...user })
  }

  const getUser = username => {
    const userAddr = store.usernameMap.get(username)
    const user = store.users.get(userAddr)
    if (!user || user.isBanned) {
      throw NotFoundError(`Couldn't find user ${username}`)
    }

    return { ...user, userAddr }
  }

  const getUserFullProfile = username => {
    const user = getUser(username)
    const { sheetUserMap, sheets } = app.sheets.store
    const userSheets = sheetUserMap.get(user.userAddr)
    return {
      ...user,
      sheets: userSheets
        .map(sheetId => {
          const { editor, compiled, author, ...info } = sheets.get(sheetId)
          return info
        })
        .filter(sheet => sheet.isPublic && !sheet.isRemoved)
    }
  }

  return {
    init,
    store,
    saveUser,
    getUser,
    getUserFullProfile
  }
}
