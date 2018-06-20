export default class Sheet {
  constructor (text) {
    const opts = JSON.parse(text)

    this.author = opts.author
    this.slug = opts.slug
    this.isPublic = opts.isPublic
    this.title = opts.title
    this.description = opts.description
    this.isRemoved = opts.isRemoved

    /**
     * Code and config
     *
     * - IPFS_HASH
     *  - src/
     *  - dist/
     *  - config.json
     */
    this.dirHash = opts.dirHash

    this.created = new BigNumber(opts.created)
    this.updated = new BigNumber(opts.updated)
  }
}
