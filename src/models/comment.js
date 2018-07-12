export default class Comment {
  constructor (text) {
    const opts = JSON.parse(text)

    this.id = opts.id
    this.author = opts.author
    this.comment = opts.comment
    this.commentHtml = opts.commentHtml

    this.isRemoved = opts.isRemoved
    this.likes = Number(opts.likes || 0)

    this.created = opts.created
    this.updated = opts.updated
  }
}
