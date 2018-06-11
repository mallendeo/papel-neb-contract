export const makeKey = (pre = 'prop') => name => `${pre}_${name}`

// Like Object.assign but includes getters and setters
export const assign = (target, ...args) => {
  const copy = (key, obj) => {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      const desc = Object.getOwnPropertyDescriptor(obj, key)
      Object.defineProperty(target, key, desc)
    }
  }

  args.forEach(obj =>
    Object.keys(obj).forEach(key => copy(key, obj))
  )

  return target
}

export const initStorage = app => props =>
  Object.keys(props).reduce((obj, propKey) => {
    const prop = props[propKey] || {}
    const genKey = prop.map ? makeKey('map') : makeKey('prop')
    const key = genKey(propKey)

    const newObj = {}
    const desc = {}

    if (prop.parse) desc.parse = prop.parse
    if (prop.stringify) desc.stringify = prop.stringify

    if (prop.map) {
      LocalContractStorage.defineMapProperty(app, key, desc)
      newObj[propKey] = app[key]

      return assign(obj, newObj)
    }

    LocalContractStorage.defineProperty(app, key, desc)

    Object.defineProperty(newObj, propKey, {
      set (val) { app[key] = val },
      get () { return app[key] },
      enumerable: true
    })

    return assign(obj, newObj)
  }, {})
