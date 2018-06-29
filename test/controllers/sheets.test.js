import { expect } from 'chai'

import '../../extensions'
import db from '../../extensions/db'
import { ACCOUNTS } from '../config'

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

    const { results } = contract.getUserSheets('mallendeo')
    expect(results).to.have.lengthOf(1)
  })

  it('Should update an existing sheet', () => {
    contract.saveSheet('myDapp', {
      rootHash: 'some_updated_ipfs_hash'
    })

    const sheet = contract.getSheet('myDapp')
    expect(sheet.title).to.equal('An awesome Dapp')
    expect(sheet.rootHash).to.equal('some_updated_ipfs_hash')
  })

  it('Should throw when updating other user sheet', () => {
    Blockchain.transaction.from = ACCOUNTS.testuser
    expect(() => {
      contract.saveSheet('myDapp', {
        dirHash: 'ipfs_hash'
      })
    }).to.throw(/can't edit/)
  })

  it('Should save ipfs hash', () => {
    Blockchain.transaction.from = ACCOUNTS.bot

    contract.saveSheet('vueApp', { // Random generated slug
      isPublic: true,
      rootHash: 'ipfs_root_hash',
      distHash: 'ipfs_dist_hash'
    })

    const saved = contract.getSheet('vueApp')
    expect(saved.isPublic).to.be.true
    expect(saved.rootHash).to.deep.equal('ipfs_root_hash')
    expect(saved.distHash).to.deep.equal('ipfs_dist_hash')
  })

  it('Should generate a slug', () => {
    const newSheet = contract.saveSheet(null, { rootHash: 'ipfs_hash' })
    const saved = contract.getSheet(newSheet.slug)

    expect(newSheet).to.haveOwnProperty('slug')
    expect(saved.rootHash).to.deep.equal('ipfs_hash')
  })

  it('Should throw when saving a invalid slug', () => {
    ['invalid slug', '$invalid', 'inválid slúg'].forEach(invalid => {
      expect(() => {
        contract.saveSheet(invalid, {})
      }).to.throw(/invalid 'slug'/i)
    })
  })
})
