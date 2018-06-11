import { expect } from 'chai'

import '../extensions'
import db from '../extensions/db'

export const clearDb = () => db.setState({}).write()

let contract = null

describe('Admin', () => {
  before(() => {
    clearDb()

    Blockchain.transaction.from = 'NB_ADDRESS_ADMIN'

    contract = new Contract()
    contract.init()
  })

  it('Should have the admin address set', () => {
    expect(db.get('prop_admin').value()).to.be.equal('"NB_ADDRESS_ADMIN"')
    expect(contract.store.admin).to.be.equal('NB_ADDRESS_ADMIN')
  })
})
