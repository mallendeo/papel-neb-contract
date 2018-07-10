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
    contract.setUserRoles('mallendeo', roles)
    contract.setUserRoles('testuser2018', ['moderator'])

    expect(contract.getUser('mallendeo').roles)
      .to.deep.equal(roles)
    expect(contract.getUser('testuser2018').roles)
      .to.deep.equal(['moderator'])
  })

  it('Should fail trying to set roles with a unauthorized user', () => {
    Blockchain.transaction.from = ACCOUNTS.bot
    contract = new Contract()
    expect(() => contract.setUserRoles('mallendeo', []))
      .to.throw(/not allowed/)

    Blockchain.transaction.from = ACCOUNTS.testuser
    contract = new Contract()
    expect(() => contract.setUserRoles('testuser', ['admin']))
      .to.throw(/not allowed/)
  })

  it('Should ban a user', () => {
    Blockchain.transaction.from = ACCOUNTS.badUser
    contract = new Contract()
    contract.saveUser({ username: 'baduser' })

    Blockchain.transaction.from = ACCOUNTS.mallendeo
    contract = new Contract()
    contract.setUserBan('baduser')

    expect(() => contract.getUser('baduser'))
      .to.throw(/couldn't find user/i)
  })

  it('Should unban a user', () => {
    contract.setUserBan('baduser', false)

    expect(contract.getUser('baduser'))
      .to.be.an('object')
  })

  describe('picks', () => {
    it('Should pick a user sheet', () => {
      contract.saveSheet('pick', { isPublic: true })
      contract.saveSheet('anotherpick', { isPublic: true })

      contract.setPick('pick')
      contract.setPick('demoapp')
      contract.setPick('anotherpick')

      expect(contract.listSheets('picks').sheets)
        .to.be.an('array').with.lengthOf(3)
    })

    it('Should unpick a user sheet', () => {
      contract.setPick('demoapp', true)
      contract.setPick('anotherpick', true)

      expect(contract.listSheets('picks').sheets)
        .to.be.an('array').with.lengthOf(1)
    })

    it('Should throw trying to pick a null sheet', () => {
      expect(() => contract.listSheets('_'))
        .to.throw(/invalid/i)
    })
  })
})
