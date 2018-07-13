'use strict'
const {
  Neb,
  HttpRequest,
  Account,
  Transaction,
  Unit
} = require('nebulas')

const users = require('./fixtures/users')

const mainnet = typeof process.env.MAIN !== 'undefined' && process.env.MAIN

const neb = new Neb()
neb.setRequest(new HttpRequest(
  `https://${mainnet ? 'mainnet' : 'testnet'}.nebulas.io`
))

const send = from => async (to, value, contract, nonce = 0) => {
  if (!to) throw Error('Missing parameter `to`')
  const state = await neb.api.getAccountState(from.getAddressString())

  const tx = new Transaction(
    mainnet ? 1 : 1001,
    from,
    to,
    Unit.nasToBasic(value),
    parseInt(state.nonce) + 1 + nonce,
    1000000,
    200000,
    contract
  )

  tx.signTransaction()

  return neb.api.sendRawTransaction({ data: tx.toProtoString() })
}

const accounts = users.map(user => {
  const account = Account.NewAccount()
  account.setPrivateKey(user.pkey)
  account.send = send(account)
  account.addr = account.getAddressString()

  return account
})

module.exports = { neb, accounts, send, mainnet }
