import { expect } from 'chai'

import '../../extensions'
import { ACCOUNTS } from '../config'

let contract = null

describe('Comments', () => {
  before(() => {
    Blockchain.transaction.from = ACCOUNTS.mallendeo
    contract = new Contract()
  })

  it('Should get an empty list of comments from a random sheet', () => {
    const comments = contract.getComments({ slug: 'vueApp' })
    expect(comments).to.deep.equal([])
    expect(contract.comments.store.commentsMapSize)
      .to.equal(0)
  })

  it('Should post comments', () => {
    const id = contract.postComment('vueApp', 'Hi! this is a test comment.')
    expect(id).to.equal(0)
    expect(contract.comments.store.commentsMapSize).to.equal(1)

    contract.postComment('vueApp', 'another comment')

    const comments = contract.getComments({ slug: 'vueApp' })

    expect(contract.comments.store.commentsMapSize).to.equal(2)
    expect(comments).to.have.lengthOf(2)

    comments.forEach(comment => {
      expect(comment.id).to.be.a('number')
      expect(comment.comment).to.be.a('string')
      expect(comment.created).to.be.a('number')
    })
  })

  it('Should update a comment', () => {
    contract.updateComment(0, { comment: 'updated comment' })
    const comments = contract.getComments({ username: 'mallendeo' })
    expect(comments[0].updated).to.be.greaterThan(comments[0].created)

    expect(comments).to.have.lengthOf(2)
  })

  it('Should remove a comment', () => {
    contract.removeComment(0)
    expect(contract.getComments({ username: 'mallendeo' }))
      .to.have.lengthOf(1)
  })

  it(`Shouldn't let the user edit other users comments`, () => {
    Blockchain.transaction.from = ACCOUNTS.badUser
    expect(() => contract.updateComment(1, { comment: 'lmao' })).to.throw(/not allowed/)
    expect(() => contract.removeComment(1)).to.throw(/not allowed/)
  })

  it('Should create a comment with a different user and sheet', () => {
    Blockchain.transaction.from = ACCOUNTS.datboi
    contract.postComment('animation', 'nice animation!')
    expect(contract.getComments({ username: 'datboi' })).to.have.lengthOf(1)
    expect(contract.getComments({ slug: 'animation' })).to.have.lengthOf(1)
  })
})
