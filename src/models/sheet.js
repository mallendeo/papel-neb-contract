export default class Sheet {
  constructor (text) {
    const opts = JSON.parse(text)

    this.author = opts.author
    this.slug = opts.slug
    this.title = opts.title
    this.description = opts.description

    this.isPublic = opts.isPublic
    this.forkedFrom = opts.forkedFrom

    /**
     * Code and config
     *
     * - IPFS_HASH -> rootHash
     *  - src/
     *  - dist/ -> distHash
     *  - config.json
     */
    this.rootHash = opts.rootHash
    this.distHash = opts.distHash

    this.extra = opts.extra || {}

    this.isRemoved = opts.isRemoved
    this.created = opts.created
    this.updated = opts.updated
  }
}
