export default class Sheet {
  constructor (title) {
    LocalContractStorage.defineMapProperty(this, 'title')
    this.title = title
  }

  toString () {
    return JSON.stringify(this)
  }
}
