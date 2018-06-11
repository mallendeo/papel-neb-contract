export default class Sheet {
  constructor (text) {
    const opts = JSON.parse(text)

    this.author = opts.author
    this.slug = opts.slug
    this.isPrivate = opts.isPrivate
    this.title = opts.title
    this.description = opts.description
    this.isRemoved = false
    this.created = new BigNumber(opts.created)
    this.updated = new BigNumber(opts.updated)
  }
}
