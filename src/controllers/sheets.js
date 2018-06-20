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
    sheets: {
      map: true,
      parse: text => new Sheet(text),
      stringify: o => JSON.stringify(o)
    }
  })

  const init = () => {
    store.sheetMapSize = 0
  }

  const _update = (slug, id, opts, init) => {
    if (opts.created) throw ForbiddenError()

    const author = Blockchain.transaction.from
    const initObj = init ? { created: Date.now() } : {}
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

    if (_checkId(sheetId)) {
      throw NotFoundError()
    }

    const sheet = store.sheets.get(sheetId)
    if (sheet.isRemoved) throw NotFoundError()

    return sheet
  }

  return {
    init,
    store,
    saveSheet,
    getSheet
  }
}
