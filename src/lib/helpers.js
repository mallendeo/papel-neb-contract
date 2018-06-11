export const makeKey = (pre = 'prop') => name => `${pre}_${name}`

// Clone object including setters and getters
export function assign (target) {
  for (var
    hOP = Object.prototype.hasOwnProperty,
    copy = function (key) {
      if (!hOP.call(target, key)) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(this, key)
        )
      }
    },
    i = arguments.length;
    i-- > 1;
    Object.keys(arguments[i]).forEach(copy, arguments[i])
  ) {}
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
