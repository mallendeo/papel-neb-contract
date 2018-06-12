import { expect } from 'chai'
import crypto from 'crypto'

import '../extensions'
import db from '../extensions/db'
import { ADDR_USER_1, ADDR_USER_2, ADDR_USER_3 } from './config'

const makeHash = () => crypto.randomBytes(16).toString('hex')

let contract = null

describe('Sheets', () => {
  before(() => {
    Blockchain.transaction.from = ADDR_USER_1
    contract = new Contract()
  })

  it('Should init and set props', () => {
    expect(db.get('prop_sheetMapSize').value()).to.be.equal('0')
    expect(contract.sheets.store.sheetMapSize)
      .to.be.equal(0)
  })

  it('Should create a new sheet', () => {
    const hash = makeHash()
    Blockchain.transaction.hash = hash

    contract.saveSheet('myDapp', {
      title: 'An awesome Dapp',
      src: {
        html: {
          type: 'pug',
          code: 'h1 test'
        },
        css: {
          type: 'stylus',
          code: 'h1 { color: #333 }'
        },
        js: {
          type: 'babel',
          code: `console.log('hi')`
        }
      }
    })

    const saved = JSON.parse(db.get('@map_sheets').value()[hash])
    expect(saved).to.be.an('object')
      .and.have.property('author', Blockchain.transaction.from)
  })

  it('Should update an existing sheet', () => {
    contract.saveSheet('myDapp', {
      src: {
        html: {
          type: 'html',
          code: '<span>test</span>'
        }
      }
    })

    const sheet = contract.getSheet('myDapp')
    expect(sheet.src.html.code).to.equal('<span>test</span>')
    expect(sheet.src).to.have.property('css').not.undefined
    expect(sheet.src).to.have.property('js').not.undefined
  })

  it('Should throw when updating other user sheet', () => {
    Blockchain.transaction.from = ADDR_USER_2
    expect(() => {
      contract.saveSheet('myDapp', {
        src: {
          html: {
            type: 'html',
            code: '<span>test</span>'
          }
        }
      })
    }).to.throw(/can't edit/)
  })

  it('Should save compiled code', () => {
    Blockchain.transaction.hash = makeHash()

    Blockchain.transaction.from = ADDR_USER_3
    const saved = contract.saveSheet('vue-app', {
      isPublic: true,
      compiled: {
        html: {
          code: '<div id="app"></span>'
        },
        js: {
          code: `new Vue({ el: '#app' })`,
          libs: ['https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.16/vue.min.js']
        },
        css: {
          code: '#app { display: flex }',
          libs: ['https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.css']
        }
      }
    })
    console.log(saved)
    expect()
  })
})
