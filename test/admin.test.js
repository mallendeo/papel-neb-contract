import { expect } from 'chai'

import '../extensions'
import db from '../extensions/db'

let contract = null

describe('Admin', () => {
  before(() => {
    Blockchain.transaction.from = 'NB_ADDRESS_ADMIN'
    contract = new Contract()
  })

  it('Should have the admin address set', () => {
    expect(db.get('prop_admin').value()).to.be.equal('"NB_ADDRESS_ADMIN"')
    expect(contract.admin.store.admin).to.be.equal('NB_ADDRESS_ADMIN')
  })
})
