'use strict'

const fs = require('fs-extra')
const { neb, accounts } = require('./nebulas')

const source = fs.readFileSync('./dist/contract.js', 'utf-8')

const { asyncUntil } = require('./lib/helpers')

const sheets = require('./fixtures/sheets')
const users = require('./fixtures/users')
const populate = process.argv[2]

;(async () => {
  // Add funds from the main account
  const tx = await accounts[0].send(accounts[0], 0, {
    sourceType: 'ts',
    source,
    args: JSON.stringify(populate ? [{ sheets }] : [])
  })

  const address = tx.contract_address

  console.log('Contract address:', address)
  console.log('Tx hash:', tx.txhash)

  await asyncUntil(async retry => {
    const { status } = await neb.api.getTransactionReceipt({ hash: tx.txhash })
    if (status === 1) return { done: true }
    if (status === 0) return { finish: true }
    return { delay: retry > 0 ? 5000 : 15000 }
  }, 4)

  if (!populate) return console.log('done')

  // Add funds from the main account
  for (const account of accounts) {
    const addr = account.getAddressString()
    const state = await neb.api.getAccountState(addr)
    if (state.balance < 1000000) {
      const amount = 0.0001
      const tx = await accounts[0].send(account, amount)
      console.log(`sending ${amount} nas to`, addr, tx)
    }
  }

  await Promise.all(accounts.map(account => asyncUntil(async () => {
    const state = await neb.api.getAccountState(account.getAddressString())
    return { done: state.balance > 1000000 }
  })))

  // Create users
  for (const user of users) {
    const { name, username, bio } = user
    const tx = await accounts[0].send(address, 0, {
      function: 'saveUser',
      args: JSON.stringify([{ name, username, bio }])
    })
    console.log('creating user', username, tx)
  }

  console.log('done')
})()
