import Sheet from '../models/sheet'
import {
  ForbiddenError,
  MissingParameterError
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

  const saveSheet = (key, opts) => {
    if (!opts) throw MissingParameterError('opts')
    const { from } = Blockchain.transaction

    const exists = store.sheets.get(key)

    if (exists && exists.author !== from) {
      throw ForbiddenError(`You can't edit a sheet that isn't yours`)
    }

    if (!exists) {
      store.sheetIndexMap.put(store.sheetMapSize, key)
      store.sheetMapSize += 1
    }

    const slugSheetKey = store.sheetSlugMap.get(opts.slug)
    if (slugSheetKey && slugSheetKey !== key) {
      throw ForbiddenError('This slug is already taken')
    }

    store.sheetSlugMap.put(opts.slug, key)

    const saved = store.sheets.put(key, Object.assign(opts, { author: from }))

    return { saved }
  }

  return {
    init,
    store,
    saveSheet
  }
}
