import { expect } from 'chai'

import '../../extensions'
import db from '../../extensions/db'
import { ACCOUNTS } from '../config'

let contract = null

describe('Admin', () => {
  before(() => {
    Blockchain.transaction.from = ACCOUNTS.admin
    contract = new Contract()
  })

  it('Should have the admin address set', () => {
    expect(contract.admin.store.admin).to.equal('NB_ADDRESS_ADMIN')
    expect(JSON.parse(db.get('prop_admin').value()))
      .to.equal('NB_ADDRESS_ADMIN')
  })

  it('Should set user roles', () => {
    const roles = ['admin', 'moderator']
    contract.admin.setUserRoles('mallendeo', roles)
    contract.admin.setUserRoles('testuser', ['moderator'])

    expect(contract.users.getUser('mallendeo').roles)
      .to.deep.equal(roles)
    expect(contract.users.getUser('testuser').roles)
      .to.deep.equal(['moderator'])
  })

  it('Should fail trying to set roles with a unauthorized user', () => {
    Blockchain.transaction.from = ACCOUNTS.bot
    expect(() => contract.admin.setUserRoles('mallendeo', []))
      .to.throw(/not allowed/)

    Blockchain.transaction.from = ACCOUNTS.testuser
    expect(() => contract.admin.setUserRoles('testuser', ['admin']))
      .to.throw(/not allowed/)
  })

  it('Should ban a user', () => {
    Blockchain.transaction.from = ACCOUNTS.badUser
    contract.users.saveUser({ username: 'baduser' })

    Blockchain.transaction.from = ACCOUNTS.mallendeo
    contract.admin.setUserBan('baduser')

    expect(() => contract.users.getUser('baduser'))
      .to.throw(/couldn't find user/i)
  })

  it('Should unban a user', () => {
    contract.admin.setUserBan('baduser', false)

    expect(contract.users.getUser('baduser'))
      .to.be.an('object')
  })
})
