'use strict'

const fs = require('fs-extra')
const { neb, accounts } = require('./nebulas')
const chunk = require('lodash/chunk')

const source = fs.readFileSync('./dist/contract.js', 'utf-8')

const { asyncUntil, waitTx } = require('./lib/helpers')

const sheets = require('./fixtures/sheets')
const users = require('./fixtures/users')
const populate = process.argv[2]

;(async () => {
  console.log('Using account', accounts[0].addr)

  // Add funds from the main account
  const tx = await accounts[0].send(accounts[0], 0, {
    sourceType: 'ts',
    source,
    args: JSON.stringify([])
  })

  const address = tx.contract_address

  console.log('Contract address:', address)
  console.log('Tx hash:', tx.txhash)

  await waitTx(tx.txhash)

  if (!populate) return console.log('done')

  // Add funds from the main account
  for (const account of accounts) {
    const state = await neb.api.getAccountState(account.addr)
    if (state.balance < 1000000) {
      const amount = 0.0001
      const tx = await accounts[0].send(account, amount)
      console.log(`sending ${amount} nas to`, account.addr, tx)
    }
  }

  await Promise.all(accounts.map(account => asyncUntil(async () => {
    const state = await neb.api.getAccountState(account.addr)
    return { done: state.balance > 1000000 }
  })))

  // Create users
  users.forEach(async (user, index) => {
    const { name, username, bio } = user
    const tx = await accounts[index].send(address, 0, {
      function: 'saveUser',
      args: JSON.stringify([{ name, username, bio }])
    })
    console.log('creating user', username)
    await waitTx(tx.txhash)
    console.log('user created', username)

    const chunks = chunk(sheets, users.length)
    for (const sheet of chunks[index]) {
      const { slug, ...data } = sheet
      const tx = await accounts[index].send(address, 0, {
        function: 'saveSheet',
        args: JSON.stringify([slug, data])
      })
      console.log('creating sheet', slug)
      await waitTx(tx.txhash)
      console.log('sheet created', slug)
    }
  })

  console.log('done')
})()
