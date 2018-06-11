import { expect } from 'chai'

import '../extensions'
import db from '../extensions/db'

export const clearDb = () => db.setState({}).write()

let contract = null

describe('Sheets', () => {
  before(() => {
    clearDb()

    Blockchain.transaction.from = 'NB_ADDRESS_ADMIN'

    contract = new Contract()
    contract.init()
  })

  it('Should init and set props', () => {
    expect(db.get('prop_sheetMapSize').value()).to.be.equal('0')
    expect(contract.sheets.store.sheetMapSize)
      .to.be.equal(0)
  })
})
