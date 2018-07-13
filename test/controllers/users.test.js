import { expect } from 'chai'
import sinon from 'sinon'

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
      .to.equal('3')
    expect(contract.users.store.userMapSize)
      .to.equal(3)
  })

  it('Should create a new user', () => {
    Blockchain.transaction.from = ACCOUNTS.datboi
    contract = new Contract()

    expect(() => contract.getUser('datboi')).to.throw()

    const newUser = contract.saveUser({
      username: 'datboi',
      avatar: 'datboi.jpg'
    })

    expect(newUser).to.be.an('object')
    expect(contract.users.store.userMapSize).to.equal(4)
  })

  it('Should get user info', () => {
    const userInfo = contract.getUser('datboi')
    expect(userInfo).to.be.an('object')
  })

  it('Should get user info by address', () => {
    const userInfo = contract.getUserByAddress('NB_ADDRESS_datboi')
    expect(userInfo).to.be.an('object')
  })

  it('Should throw a existing username error', () => {
    Blockchain.transaction.from = ACCOUNTS.testuser
    contract = new Contract()

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
    contract = new Contract()

    contract.saveUser({ username: 'bot' })
    contract.saveSheet('slug', {})
    contract.saveSheet('demoapp', { isPublic: true })
    contract.saveSheet('animation', { isPublic: true })
    contract.saveSheet('logo', { isPublic: true, isRemoved: true })

    contract.saveUser({ showcase: ['slug', 'demoapp'] })

    const profile = contract.getUserFullProfile('bot')
    const { results } = contract.getUserSheets('bot')
    expect(profile).to.be.an('object')

    expect(results).to.have.lengthOf(5)
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

  it('Should get a paginated sheet list', () => {
    Array(20).fill(null).forEach((el, index) => {
      contract.saveSheet(`sheet_n_${index}`, { isPublic: true })
    })

    const { results, total } = contract.getUserSheets('bot', 3, { reverse: true })

    expect(total).to.equal(25)
    expect(results[0]).to.have.property('slug', 'sheet_n_7')
  })

  describe('Flood attack prevention', () => {
    const clock = sinon.useFakeTimers(Date.now())

    it(`Shouldn't let the user post more than once in the range of 15 seconds`, () => {
      contract.saveSheet(`sheet_n_1000`, { isPublic: true })

      clock.tick(5000)
      expect(() => contract.users.checkActivity(true))
        .to.throw(/try again/)

      clock.tick(10000)
      expect(() => contract.users.checkActivity(true))
        .to.not.throw()
    })

    after(() => {
      clock.restore()
    })
  })
})
