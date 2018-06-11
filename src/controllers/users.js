import User from '../models/user'
import { initStorage } from '../lib/helpers'

export default app => {
  const store = initStorage(app)([
    { name: 'usernameMap', map: true },
    { name: 'userIndexMap', map: true },
    { name: 'userMapSize' },
    {
      name: 'users',
      map: true,
      opts: {
        parse: text => new User(text),
        stringify: o => JSON.stringify(o)
      }
    }
  ])

  const init = () => {
    store.userMapSize = 0
  }

  const setUsername = (from, username, oldUsername) => {
    const addrOwner = store.usernameMap.get(username)
    if (addrOwner) throw Error(`Username ${username} is taken`)
    if (oldUsername) store.usernameMap.del(oldUsername)
    store.usernameMap.put(username, from)
  }

  const saveUser = user => {
    const { username } = user
    if (!username) throw Error('Missing parameter "username"')

    const { from } = Blockchain.transaction
    const found = store.users.get(from)

    if (user.created) throw Error('Not allowed')

    if (found && username !== found.username) {
      setUsername(from, username, found.username)
    }

    if (!found) {
      setUsername(from, username)
      user.created = Date.now()

      store.userIndexMap.put(store.userMapSize, from)
      store.userMapSize += 1
    }

    return store.users.put(from, Object.assign(found || {}, user))
  }

  const getUser = username => {
    const userId = store.usernameMap.get(username)
    return store.users.get(userId)
  }

  return {
    init,
    store,
    setUsername,
    saveUser,
    getUser
  }
}
