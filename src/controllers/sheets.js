import merge from 'deepmerge'
import Sheet from '../models/sheet'

import {
  ForbiddenError,
  UnauthorizedError,
  MissingParameterError,
  NotFoundError,
  AppError,
  BadRequestError
} from '../lib/errors'

import {
  initStorage,
  rndSlug,
  strToCharCode,
  slugSafe
} from '../lib/helpers'

export default app => {
  const store = initStorage(app)({
    sheetSlugMap: { map: true },
    sheetMapSize: null,
    sheetUserMap: { map: true },

    sheetPicksMap: { map: true },
    sheetPicksIndexMap: { map: true },
    sheetPicksSize: null,

    sheets: {
      map: true,
      parse: text => new Sheet(text),
      stringify: o => JSON.stringify(o)
    }
  })

  const init = () => {
    store.sheetMapSize = 0
    store.sheetPicksSize = 0
  }

  const _update = (slug, id, opts, init) => {
    if (opts.created) throw ForbiddenError()

    const author = Blockchain.transaction.from
    const now = Date.now()

    const initObj = init ? { created: now, updated: now } : {}
    const sheet = store.sheets.get(id) || {}
    const update = { updated: Date.now(), author, slug }

    const obj = merge.all([sheet, opts, update, initObj])
    store.sheets.put(id, obj)

    return { slug }
  }

  const _checkId = id => typeof id === 'undefined' || id === null

  const saveSheet = (slug, opts) => {
    const { from } = Blockchain.transaction

    if (!slug) {
      slug = rndSlug(strToCharCode(from))

      if (store.sheetSlugMap.get(slug)) {
        throw AppError('There was an error, please try again')
      }
    }

    if (!slugSafe(slug)) throw BadRequestError(`Invalid 'slug' format: ${slug}`)

    if (!opts) throw MissingParameterError('opts')

    let sheetId = store.sheetSlugMap.get(slug)
    if (_checkId(sheetId)) {
      sheetId = store.sheetMapSize
      store.sheetSlugMap.put(slug, sheetId)

      const userSheetList = store.sheetUserMap.get(from) || []
      userSheetList.push(store.sheetMapSize)
      store.sheetUserMap.put(from, userSheetList)

      store.sheetMapSize += 1
      return _update(slug, sheetId, opts, true)
    }

    if (store.sheets.get(sheetId).author !== from) {
      throw UnauthorizedError(`You can't edit a sheet that isn't yours`)
    }

    const slugSheetId = store.sheetSlugMap.get(slug)
    if (slugSheetId && slugSheetId !== sheetId) {
      throw ForbiddenError('This slug is already taken')
    }

    store.sheetSlugMap.put(slug, sheetId)

    return _update(slug, sheetId, opts)
  }

  const getSheet = slug => {
    const sheetId = store.sheetSlugMap.get(slug)
    const err = NotFoundError(`Couldn't find '${slug}'`)

    if (_checkId(sheetId)) throw err

    const sheet = store.sheets.get(sheetId)
    if (sheet.isRemoved) throw err

    return sheet
  }

  const listSheets = (type = 'public', page = 1) => {
    if (page < 1) throw BadRequestError()

    const perPage = 6
    const sheetList = []

    const typeMap = {
      public: { name: 'sheets', size: store.sheetMapSize },
      picks: { name: 'sheetPicksMap', size: store.sheetPicksSize }
    }

    const map = typeMap[type]

    if (!map) throw NotFoundError(`Invalid list '${type}'`)

    const start = map.size - (page - 1) * perPage

    for (let id = start; id > -1; --id) {
      const sheet = type === 'public'
        ? store[map.name].get(id)
        : store.sheets.get(store[map.name].get(id))

      if (!sheet) continue

      const user = app.users.store.users.get(sheet.author)

      if (sheet.isPublic && !sheet.isRemoved && !user.isBanned) {
        const { avatar, username } = user
        const author = { avatar, username, address: sheet.author }
        sheetList.push({ ...sheet, author })
      }

      if (sheetList.length === perPage) break
    }

    return {
      sheets: sheetList,
      totalSheets: map.size,
      perPage,
      prev: page > 1,
      next: page < map.size / perPage
    }
  }

  return {
    init,
    store,
    saveSheet,
    getSheet,
    listSheets
  }
}
