import { expect } from 'chai'

import '../../extensions'
import db from '../../extensions/db'
import { ACCOUNTS } from '../config'

let contract = null

describe('Users', () => {
  before(() => {
    Blockchain.transaction.from = ACCOUNTS.mallendeo
    contract = new Contract()
  })

  it('Should check user map size to equal 3', () => {
    // We added ACCOUNTS on init, so map size should be 4
    expect(db.get('prop_userMapSize').value())
      .to.equal('4')
    expect(contract.users.store.userMapSize)
      .to.equal(4)
  })

  it('Should create a new user', () => {
    Blockchain.transaction.from = ACCOUNTS.datboi

    expect(() => contract.getUser('datboi')).to.throw()

    const newUser = contract.saveUser({
      username: 'datboi',
      avatar: 'datboi.jpg'
    })

    expect(newUser).to.be.an('object')
    expect(contract.users.store.userMapSize).to.equal(5)
  })

  it('Should get user info', () => {
    const userInfo = contract.getUser('datboi')
    expect(userInfo).to.be.an('object')
  })

  it('Should throw a existing username error', () => {
    Blockchain.transaction.from = ACCOUNTS.testuser

    expect(() => {
      contract.saveUser({
        username: 'mallendeo',
        avatar: 'testuser.jpg'
      })
    }).to.throw('Username mallendeo is taken')
  })

  it('Should throw when trying to save a invalid username', () => {
    expect(() => {
      contract.saveUser({ username: 'invalid username' })
    }).to.throw(/invalid/i)
  })

  it('Should change an existing user username', () => {
    // Current user is testuser
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
    Blockchain.transaction.from = ACCOUNTS.bot
    contract.saveUser({ username: 'bot' })
    contract.saveSheet('slug', {})
    contract.saveSheet('demoapp', { isPublic: true })
    contract.saveSheet(null, { isPublic: true })
    contract.saveSheet(null, { isPublic: true, isRemoved: true })

    contract.saveUser({ showcase: ['slug', 'demoapp'] })

    const profile = contract.getUserFullProfile('bot')
    const sheets = contract.getUserSheets('bot')
    expect(profile).to.be.an('object')

    expect(sheets).to.have.lengthOf(5)
    expect(profile.showcase).to.have.lengthOf(2)

    profile.showcase.forEach(sheet => {
      expect(sheet.created).to.be.a('number')
      expect(sheet.updated).to.be.a('number')
      expect(sheet).to.have.property('isPublic')
    })
  })

  it('Should update showcase', () => {
    contract.saveUser({ showcase: ['slug'] })
    const profile = contract.getUserFullProfile('bot')
    expect(profile.showcase).to.have.lengthOf(1)
  })
})
