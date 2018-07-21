export default class File {
  constructor (text) {
    const opts = JSON.parse(text)

    this.name = opts.name
    this.type = opts.type
    this.hash = opts.hash
    this.size = opts.size

    this.created = opts.created
    this.isRemoved = opts.isRemoved
  }
}
