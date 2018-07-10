import User from '../models/user'
import { initStorage, slugSafe, paginate } from '../lib/helpers'

import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  AppError
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
    if (!username || !slugSafe(username, 1)) {
      throw BadRequestError('Invalid characters for "username"')
    }

    const ownerAddr = store.usernameMap.get(username)

    if (ownerAddr) throw ConflictError(`Username ${username} is taken`)

    if (oldUsername) {
      const oldUserAddr = store.usernameMap.get(oldUsername)
      if (oldUserAddr !== app.from) {
        throw UnauthorizedError()
      }

      store.usernameMap.del(oldUsername)
    }

    store.usernameMap.put(username, from)
  }

  const _userSheets = (username, type = 'showcase') => {
    const user = getUser(username)
    const { sheetUserMap, sheets } = app.sheets.store
    let userSheets = []

    switch (type) {
      case 'showcase':
        userSheets = (user.showcase || [])
          .map(slug => app.sheets.store.sheetSlugMap.get(slug))
        break
      case 'all':
        userSheets = sheetUserMap.get(user.userAddr)
        break
    }

    const owner = user.userAddr === app.from
    return (userSheets || [])
      .map(sheetId => {
        const { editor, compiled, author, ...info } = sheets.get(sheetId)
        return info
      })
      .filter(sheet => (owner || sheet.isPublic) && !sheet.isRemoved)
  }

  const checkActivity = (force = false) => {
    const { from } = Blockchain.transaction
    const user = store.users.get(from)

    if (!force && process && process.env.NODE_ENV === 'test') {
      saveUser({ lastPost: Date.now() })
      return
    }

    if (user.lastPost && Date.now() - user.lastPost < 15000) {
      throw AppError(null, 'Please try again in a few seconds.')
    }

    saveUser({ lastPost: Date.now() })
  }

  const saveUser = user => {
    const newUser = { ...user }
    const { username, showcase } = newUser

    if (showcase && showcase.length) {
      const notAllowed = showcase
        .map(app.sheets.getSheet)
        .some(sheet => sheet.author !== app.from)

      if (notAllowed) {
        throw ForbiddenError(`You can't add other user's sheets to your showcase`)
      }
    }

    const { from } = Blockchain.transaction
    const found = store.users.get(from)

    // Check if the user is banned
    if (found) _disallowMiddleware(found, true)

    // Prevent user for changing his status and roles
    _disallowMiddleware(newUser, false, [
      'isBanned',
      'roles',
      'created',
      'updated'
    ])

    if (found && username && username !== found.username) {
      _setUsername(from, username, found.username)
    }

    if (!found) {
      if (username) _setUsername(from, username)
      newUser.created = Date.now()

      store.userIndexMap.put(store.userMapSize, from)
      store.userMapSize += 1
    }

    return store.users.put(from, { ...(found || {}), ...newUser })
  }

  const getUser = username => {
    const userAddr = store.usernameMap.get(username)

    const user = store.users.get(userAddr)
    if (!user || user.isBanned) {
      throw NotFoundError(`Couldn't find user ${username}`)
    }

    return { ...user, userAddr }
  }

  const getUserSheets = (username, page = 1, opts = {}) => {
    const sheets = _userSheets(username, 'all')
    const arr = opts.reverse ? sheets.reverse() : sheets

    return {
      results: paginate(arr, opts.limit || 6)(page),
      total: arr.length
    }
  }

  const getUserFullProfile = username => ({
    ...getUser(username),
    showcase: _userSheets(username, 'showcase')
  })

  return {
    init,
    store,
    saveUser,
    getUser,
    getUserSheets,
    getUserFullProfile,
    checkActivity
  }
}
