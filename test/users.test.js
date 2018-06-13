import { expect } from 'chai'

import '../extensions'
import db from '../extensions/db'
import { newTxHash } from './helpers'
import { ADDR_USER_1, ADDR_USER_2, ADDR_USER_3 } from './config'

let contract = null

describe('Users', () => {
  before(() => {
    Blockchain.transaction.from = ADDR_USER_1
    contract = new Contract()
  })

  it('Should init and set props', () => {
    expect(db.get('prop_userMapSize').value())
      .to.be.equal('0')
    expect(contract.users.store.userMapSize)
      .to.be.equal(0)
  })

  it('Should create a new user', () => {
    const newUser = contract.saveUser({
      username: 'mallendeo',
      avatar: 'mallendeo.jpg'
    })

    expect(newUser).to.be.an('object')
  })

  it('Should get user info', () => {
    const userInfo = contract.getUser('mallendeo')
    expect(userInfo).to.be.an('object')
  })

  it('Should throw a existing username error', () => {
    Blockchain.transaction.from = ADDR_USER_2
    contract.saveUser({
      username: 'testuser',
      avatar: 'testuser.jpg'
    })

    expect(() => {
      contract.saveUser({
        username: 'mallendeo',
        avatar: 'testuser.jpg'
      })
    }).to.throw('Username mallendeo is taken')
  })

  it('Should throw when trying to save a invalid username', () => {
    Blockchain.transaction.from = ADDR_USER_2
    expect(() => {
      contract.saveUser({ username: 'invalid username' })
    }).to.throw(/invalid/i)
  })

  it('Should change an existing user username', () => {
    // Current user is ADDR_USER_2
    const newUsername = 'testuser2018'
    expect(() => contract.saveUser({ username: newUsername }))
      .to.not.throw()

    const updated = contract.getUser(newUsername)
    expect(updated).to.be.an('object')

    // Shouldn't change other user properties
    expect(updated).to.have.property('avatar', 'testuser.jpg')
  })

  it('Shouldn\'t let the user change its creation date', () => {
    expect(() => {
      contract.saveUser({
        username: 'testuser2018',
        created: Date.now(),
        updated: Date.now()
      })
    }).to.throw(/not allowed/)
  })

  it('Shouldn\'t let the user change its roles or status', () => {
    expect(() => {
      contract.saveUser({
        username: 'bad_user',
        isBanned: false,
        roles: ['admin', 'moderator']
      })
    }).to.throw(/not allowed/)
  })

  it('Should get user\'s full profile including sheets', () => {
    // Create new user
    Blockchain.transaction.from = ADDR_USER_3
    const createSheet = (slug, opts = {}) => {
      newTxHash()
      contract.saveSheet(slug, opts)
    }
    contract.saveUser({ username: 'bot' })
    createSheet('slug')
    createSheet('demoapp', { isPublic: true })
    createSheet(null, { isPublic: true })
    createSheet(null, { isPublic: true, isRemoved: true })

    const profile = contract.getUserFullProfile('bot')
    expect(profile).to.be.an('object')

    profile.sheets.forEach(sheet => {
      expect(sheet.created).to.be.a('object')
      expect(sheet.updated).to.be.a('object')
      expect(sheet).to.have.property('isPublic')
    })
  })
})
