import { expect } from 'chai'

import '../extensions'
import db from '../extensions/db'
import { ACCOUNTS } from './config'

let contract = null

describe('Sheets', () => {
  before(() => {
    Blockchain.transaction.from = ACCOUNTS.mallendeo
    contract = new Contract()
  })

  it('Should init and set props', () => {
    expect(db.get('prop_sheetMapSize').value()).to.equal('0')
    expect(contract.sheets.store.sheetMapSize)
      .to.equal(0)
  })

  it('Should create a new sheet', () => {
    contract.saveSheet('myDapp', {
      title: 'An awesome Dapp',
      dirHash: 'some_ipfs_hash'
    })

    const saved = contract.getSheet('myDapp')
    const index = db.get(`@map_sheetSlugMap['myDapp']`).value()

    expect(index).to.equal('0')
    expect(saved).to.be.an('object')
      .and.have.property('author', Blockchain.transaction.from)
  })

  it('Should update an existing sheet', () => {
    contract.saveSheet('myDapp', {
      dirHash: 'some_updated_ipfs_hash'
    })

    const sheet = contract.getSheet('myDapp')
    expect(sheet.title).to.equal('An awesome Dapp')
    expect(sheet.dirHash).to.equal('some_updated_ipfs_hash')
  })

  it('Should throw when updating other user sheet', () => {
    Blockchain.transaction.from = ACCOUNTS.testuser
    expect(() => {
      contract.saveSheet('myDapp', {
        dirHash: 'ipfs_hash'
      })
    }).to.throw(/can't edit/)
  })

  it('Should save compiled code', () => {
    Blockchain.transaction.from = ACCOUNTS.bot

    contract.saveSheet('vueApp', { // Random generated slug
      isPublic: true,
      dirHash: 'ipfs_hash'
    })

    const saved = contract.getSheet('vueApp')
    expect(saved.isPublic).to.be.true
    expect(saved.dirHash).to.deep.equal('ipfs_hash')
  })

  it('Should generate a slug', () => {
    const newSheet = contract.saveSheet(null, { dirHash: 'ipfs_hash' })
    const saved = contract.getSheet(newSheet.slug)

    expect(newSheet).to.haveOwnProperty('slug')
    expect(saved.dirHash).to.deep.equal('ipfs_hash')
  })

  it('Should throw when saving a invalid slug', () => {
    ['invalid slug', '$invalid', 'inválid slúg'].forEach(invalid => {
      expect(() => {
        contract.saveSheet(invalid, {})
      }).to.throw(/invalid 'slug'/i)
    })
  })
})
