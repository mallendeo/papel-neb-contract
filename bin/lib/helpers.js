const { neb } = require('../nebulas')

const asyncUntil = async (func, retries = 4, _delay = 10000) => {
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

const waitTx = async hash => {
  await asyncUntil(async retry => {
    const { status } = await neb.api.getTransactionReceipt({ hash })
    if (status === 1) return { done: true }
    if (status === 0) return { finish: true }
    return { delay: retry > 0 ? 5000 : 15000 }
  }, 4)
}

module.exports = {
  asyncUntil,
  waitTx
}
