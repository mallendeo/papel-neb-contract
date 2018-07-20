import { expect } from 'chai'

import '../../extensions'
import { ACCOUNTS } from '../config'

let contract = null

describe('Files', () => {
  before(() => {
    Blockchain.transaction.from = ACCOUNTS.mallendeo
    contract = new Contract()
  })

  it('Should save files', () => {
    expect(contract.saveFiles([
      { name: 'test.jpg', type: 'image/jpeg', hash: 'some_hash' },
      { name: 'test2.jpg', type: 'image/jpeg', hash: 'some_hash_2' },
      { name: 'test3.jpg', type: 'image/jpeg', hash: 'some_hash_3' }
    ])).to.deep.equal([0, 1, 2])

    const files = contract.getFiles()
    expect(files).to.be.an('array').with.lengthOf(3)
    files.map(file => {
      ['name', 'type', 'hash']
        .map(t => expect(file).to.have.property(t))
    })
  })

  it('Should remove a file', () => {
    expect(contract.removeFile(1)).to.be.true
    expect(contract.getFiles()).to.have.lengthOf(2)
  })

  it(`Shouldn't let users remove files that they don't own`, () => {
    Blockchain.transaction.from = ACCOUNTS.badUser
    contract = new Contract()
    expect(() => contract.removeFile(2)).to.throw()
  })
})
