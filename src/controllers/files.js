import { initStorage } from '../lib/helpers'
import { MissingParameterError, BadRequestError, ForbiddenError } from '../lib/errors'

export default app => {
  const store = initStorage(app)({
    files: { map: true },
    filesMapSize: null,
    usersFilesMap: { map: true }
  })

  const init = () => {
    store.filesMapSize = 0
  }

  const saveFiles = files => {
    if (!files || !files.length) throw BadRequestError()

    const indexes = files.map(file => {
      ['name', 'type', 'hash'].forEach(param => {
        if (!param) throw MissingParameterError(param)
      })

      const { name, type, hash } = file
      const index = store.filesMapSize
      store.files.put(index, {
        name,
        type,
        hash,
        created: Date.now()
      })

      store.filesMapSize += 1
      return index
    })

    const userFiles = store.usersFilesMap.get(app.from) || []
    store.usersFilesMap.put(app.from, [...userFiles, ...indexes])

    return store.usersFilesMap.get(app.from)
  }

  const removeFile = index => {
    const files = store.usersFilesMap.get(app.from)
    if (files.indexOf(index) < 0) throw ForbiddenError()

    const file = store.files.get(index)
    store.files.put(index, { ...file, isRemoved: true })

    return true
  }

  const getFiles = () =>
    store.usersFilesMap.get(app.from)
      .map(index => store.files.get(index))
      .filter(file => !file.isRemoved)

  return {
    init,
    store,
    saveFiles,
    getFiles,
    removeFile
  }
}
