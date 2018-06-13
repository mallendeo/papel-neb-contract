import { expect } from 'chai'

import '../extensions'
import db from '../extensions/db'
import { ACCOUNTS } from './config'

let contract = null

const DEMO_SHEET = {
  src: {
    html: {
      type: 'pug',
      code: '#app'
    },
    js: {
      code: `new Vue({ el: '#app' })`,
      libs: ['https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.16/vue.min.js']
    },
    css: {
      code: '#app \n  display flex',
      libs: ['https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.css']
    }
  },
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
}

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

    const saved = contract.getSheet('myDapp')
    const index = db.get(`@map_sheetSlugMap['myDapp']`).value()

    expect(index).to.equal('0')
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
  })

  it('Should throw when updating other user sheet', () => {
    Blockchain.transaction.from = ACCOUNTS.testuser
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
    Blockchain.transaction.from = ACCOUNTS.bot

    contract.saveSheet('vueApp', { // Random generated slug
      isPublic: true,
      src: DEMO_SHEET.src,
      compiled: DEMO_SHEET.compiled
    })

    const saved = contract.getSheet('vueApp')
    expect(saved.isPublic).to.be.true
    expect(saved.src).to.deep.equal(DEMO_SHEET.src)
    expect(saved.compiled).to.deep.equal(DEMO_SHEET.compiled)
  })

  it('Should generate a slug', () => {
    const newSheet = contract.saveSheet(null, { src: DEMO_SHEET.src })
    const saved = contract.getSheet(newSheet.slug)

    expect(newSheet).to.haveOwnProperty('slug')
    expect(saved.src).to.deep.equal(DEMO_SHEET.src)
  })

  it('Should throw when saving a invalid slug', () => {
    ['invalid slug', '$invalid', 'inválid slúg'].forEach(invalid => {
      expect(() => {
        contract.saveSheet(invalid, {})
      }).to.throw(/invalid 'slug'/i)
    })
  })
})
