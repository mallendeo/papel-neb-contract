export const makeKey = (pre = 'prop') => name => `${pre}_${name}`

// Clone object including setters and getters
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
  props.reduce((obj, prop) => {
    const genKey = prop.map ? makeKey('map') : makeKey('prop')
    const key = genKey(prop.name)

    const newObj = {}

    if (prop.map) {
      LocalContractStorage.defineMapProperty(app, key, prop.opts)
      newObj[prop.name] = app[key]

      return assign(obj, newObj)
    }

    LocalContractStorage.defineProperty(app, key)

    Object.defineProperty(newObj, prop.name, {
      set (val) { app[key] = val },
      get () { return app[key] },
      enumerable: true
    })

    return assign(obj, newObj)
  }, {})
