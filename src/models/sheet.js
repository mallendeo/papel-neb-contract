export default class Sheet {
  constructor (text) {
    const opts = JSON.parse(text)
    const { isPublic } = opts

    const pub = typeof isPublic !== 'undefined' ? isPublic : false

    this.author = opts.author
    this.isPublic = pub
    this.title = opts.title
    this.description = opts.description
    this.isRemoved = opts.isRemoved

    // Code
    const { html, css, js, neb } = opts.src
    this.src = { html, css, js, neb }
    this.editor = opts.editor || {
      updateDelay: 0,
      refreshPage: false,
      indentWidth: 2,
      useSpaces: true
    }
    this.created = new BigNumber(opts.created)
    this.updated = new BigNumber(opts.updated)
  }
}
