import merge from 'deepmerge'
import Sheet from '../models/sheet'

import {
  ForbiddenError,
  UnauthorizedError,
  MissingParameterError,
  NotFoundError,
  AppError
} from '../lib/errors'

import {
  initStorage,
  rndSlug,
  strToCharCode
} from '../lib/helpers'

export default app => {
  const store = initStorage(app)({
    sheetSlugMap: { map: true },
    sheetIndexMap: { map: true },
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

  const _update = (slug, hash, opts, init) => {
    if (opts.created) throw ForbiddenError()

    const author = Blockchain.transaction.from
    const initObj = init ? { created: Date.now() } : {}
    const sheet = store.sheets.get(hash) || {}
    const update = { updated: Date.now(), author, slug }

    const obj = merge.all([sheet, opts, update, initObj])
    store.sheets.put(hash, obj)

    return obj
  }

  const saveSheet = (slug, opts) => {
    const { from, hash } = Blockchain.transaction

    if (!slug) {
      slug = rndSlug(strToCharCode(from))

      if (store.sheetSlugMap.get(slug)) {
        throw AppError('There was an error, please try again')
      }
    }

    if (!opts) throw MissingParameterError('opts')

    let sheetHash = store.sheetSlugMap.get(slug)
    if (!sheetHash) {
      sheetHash = hash
      store.sheetSlugMap.put(slug, hash)
      store.sheetIndexMap.put(store.sheetMapSize, hash)
      store.sheetMapSize += 1

      const userSheetList = store.sheetUserMap.get(from) || []
      userSheetList.push(hash)
      store.sheetUserMap.put(from, userSheetList)

      return _update(slug, hash, opts, true)
    }

    if (store.sheets.get(sheetHash).author !== from) {
      throw UnauthorizedError(`You can't edit a sheet that isn't yours`)
    }

    const slugSheetHash = store.sheetSlugMap.get(slug)
    if (slugSheetHash && slugSheetHash !== sheetHash) {
      throw ForbiddenError('This slug is already taken')
    }

    store.sheetSlugMap.put(slug, sheetHash)

    return _update(slug, sheetHash, opts)
  }

  const getSheet = slug => {
    const hash = store.sheetSlugMap.get(slug)
    if (!hash) throw NotFoundError()

    const sheet = store.sheets.get(hash)
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
