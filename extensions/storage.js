// https://github.com/HermantNET/nebulas-contract-mimic/blob/master/src/extensions/storage.js
// Unmodified source code: https://github.com/nebulasio/go-nebulas/blob/master/nf/nvm/v8/lib/storage.js
import db from './db'

class NativeStorage {
  constructor () {
    this.db = db

    this.get.bind(this)
    this.set.bind(this)
    this.del.bind(this)
  }

  get (key) {
    return this.db.get(key).value()
  }
  set (key, val) {
    return this.db.set(key, val).write()
  }
  del (key) {
    return this.db.unset(key).write()
  }
}

const fieldNameRe = /^[a-zA-Z_$][a-zA-Z0-9_]+$/

const combineStorageMapKey = (fieldName, key) => `@${fieldName}[${key}]`

const applyMapDescriptor = (obj, descriptor) => {
  descriptor = Object.assign(
    {
      stringify: JSON.stringify,
      parse: JSON.parse
    },
    descriptor || {}
  )

  if (
    typeof descriptor.stringify !== 'function' ||
    typeof descriptor.parse !== 'function'
  ) {
    throw new Error(
      'descriptor.stringify and descriptor.parse must be function.'
    )
  }

  Object.defineProperty(obj, 'stringify', {
    configurable: false,
    enumerable: false,
    get () {
      return descriptor.stringify
    }
  })

  Object.defineProperty(obj, 'parse', {
    configurable: false,
    enumerable: false,
    get () {
      return descriptor.parse
    }
  })
}

const applyFieldDescriptor = (obj, fieldName, descriptor) => {
  descriptor = Object.assign(
    {
      stringify: JSON.stringify,
      parse: JSON.parse
    },
    descriptor || {}
  )

  if (
    typeof descriptor.stringify !== 'function' ||
    typeof descriptor.parse !== 'function'
  ) {
    throw new Error(
      'descriptor.stringify and descriptor.parse must be function.'
    )
  }

  Object.defineProperty(obj, `__stringify__${fieldName}`, {
    configurable: false,
    enumerable: false,
    get () {
      return descriptor.stringify
    }
  })

  Object.defineProperty(obj, `__parse__${fieldName}`, {
    configurable: false,
    enumerable: false,
    get () {
      return descriptor.parse
    }
  })
}

class ContractStorage {
  constructor (handler) {
    this.nativeStorage = new NativeStorage(handler)
  }

  rawGet (key) {
    return this.nativeStorage.get(key)
  }

  rawSet (key, value) {
    const ret = this.nativeStorage.set(key, value)
    if (!ret) {
      throw new Error(`set key ${key} failed.`)
    }
    return ret
  }

  del (key) {
    const ret = this.nativeStorage.del(key)
    if (!ret) {
      throw new Error(`del key ${key} failed.`)
    }
    return ret
  }

  get (key) {
    let val = this.rawGet(key)
    if (val != null) {
      val = JSON.parse(val)
    }
    return val
  }

  set (key, value) {
    return this.rawSet(key, JSON.stringify(value))
  }

  defineProperty (obj, fieldName, descriptor) {
    if (!obj || !fieldName) {
      throw new Error('defineProperty requires at least two parameters.')
    }
    const $this = this
    Object.defineProperty(obj, fieldName, {
      configurable: false,
      enumerable: true,
      get () {
        let val = $this.rawGet(fieldName)
        if (val != null) {
          val = obj[`__parse__${fieldName}`](val)
        }
        return val
      },
      set (val) {
        val = obj[`__stringify__${fieldName}`](val)
        return $this.rawSet(fieldName, val)
      }
    })
    applyFieldDescriptor(obj, fieldName, descriptor)
    return this
  }

  defineProperties (obj, props) {
    if (!obj || !props) {
      throw new Error('defineProperties requires two parameters.')
    }

    for (const fieldName in props) {
      this.defineProperty(obj, fieldName, props[fieldName])
    }
    return this
  }

  defineMapProperty (obj, fieldName, descriptor) {
    if (!obj || !fieldName) {
      throw new Error('defineMapProperty requires two parameters.')
    }

    const mapObj = new StorageMap(this, fieldName, descriptor)
    Object.defineProperty(obj, fieldName, {
      configurable: false,
      enumerable: true,
      get () {
        return mapObj
      }
    })
    return this
  }

  defineMapProperties (obj, props) {
    if (!obj || !props) {
      throw new Error('defineMapProperties requires two parameters.')
    }

    for (const fieldName in props) {
      this.defineMapProperty(obj, fieldName, props[fieldName])
    }
    return this
  }
}

class StorageMap {
  constructor (contractStorage, fieldName, descriptor) {
    if (!(contractStorage instanceof ContractStorage)) {
      throw new Error('StorageMap only accept instance of ContractStorage')
    }

    if (typeof fieldName !== 'string' || fieldNameRe.exec(fieldName) == null) {
      throw new Error('StorageMap fieldName must match regex /^[a-zA-Z_$].*$/')
    }

    Object.defineProperty(this, 'contractStorage', {
      configurable: false,
      enumerable: false,
      get () {
        return contractStorage
      }
    })
    Object.defineProperty(this, 'fieldName', {
      configurable: false,
      enumerable: false,
      get () {
        return fieldName
      }
    })

    applyMapDescriptor(this, descriptor)
  }

  del (key) {
    return this.contractStorage.del(combineStorageMapKey(this.fieldName, key))
  }

  get (key) {
    let val = this.contractStorage.rawGet(
      combineStorageMapKey(this.fieldName, key)
    )
    if (val != null) {
      val = this.parse(val)
    }
    return val
  }

  set (key, value) {
    const val = this.stringify(value)
    return this.contractStorage.rawSet(
      combineStorageMapKey(this.fieldName, key),
      val
    )
  }
}

StorageMap.prototype.put = StorageMap.prototype.set
StorageMap.prototype.delete = StorageMap.prototype.del

ContractStorage.prototype.put = ContractStorage.prototype.set
ContractStorage.prototype.delete = ContractStorage.prototype.del

export default Object.freeze({
  ContractStorage,
  lcs: new ContractStorage()
})
