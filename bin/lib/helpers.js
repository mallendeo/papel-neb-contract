exports.asyncUntil = async (func, retries = 4, _delay = 10000) => {
  return new Promise((resolve, reject) => {
    const loop = async (timeout = _delay, retry = 0) => {
      const { delay, finish, done } = (await func(retry, timeout) || {})

      if (done) return resolve(done)

      const last = retry + 1 === retries
      const err = new Error()
      err.data = { finish, last }
      if (finish || last) return reject(err)

      const newDelay = typeof delay === 'number' ? delay : timeout

      setTimeout(() => loop(newDelay, retry + 1), newDelay)
    }

    loop()
  })
}
