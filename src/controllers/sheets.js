import merge from 'deepmerge'
import Sheet from '../models/sheet'

import {
  ForbiddenError,
  UnauthorizedError,
  MissingParameterError,
  NotFoundError
} from '../lib/errors'

import { initStorage } from '../lib/helpers'

export default app => {
  const store = initStorage(app)({
    sheetSlugMap: { map: true },
    sheetIndexMap: { map: true },
    sheetMapSize: null,
    sheets: {
      map: true,
      parse: text => new Sheet(text),
      stringify: o => JSON.stringify(o)
    }
  })

  const init = () => {
    store.sheetMapSize = 0
  }

  const _update = (hash, opts, init) => {
    if (opts.created) throw ForbiddenError()

    const author = Blockchain.transaction.from
    const initObj = init ? { created: Date.now() } : {}
    const sheet = store.sheets.get(hash) || {}
    const update = { updated: Date.now(), author }

    const obj = merge.all([sheet, opts, update, initObj])
    return store.sheets.put(hash, obj)
  }

  const saveSheet = (slug, opts) => {
    if (!slug) throw MissingParameterError('slug')
    if (!opts) throw MissingParameterError('opts')

    const { from, hash } = Blockchain.transaction

    let sheetHash = store.sheetSlugMap.get(slug)
    if (!sheetHash) {
      sheetHash = hash
      store.sheetSlugMap.put(slug, hash)
      store.sheetIndexMap.put(store.sheetMapSize, hash)
      store.sheetMapSize += 1

      return _update(hash, opts, true)
    }

    const current = store.sheets.get(sheetHash)

    if (current.author !== from) {
      throw UnauthorizedError(`You can't edit a sheet that isn't yours`)
    }

    const slugSheetHash = store.sheetSlugMap.get(slug)
    if (slugSheetHash && slugSheetHash !== sheetHash) {
      throw ForbiddenError('This slug is already taken')
    }

    store.sheetSlugMap.put(slug, sheetHash)

    return _update(sheetHash, opts)
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
