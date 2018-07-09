export default class User {
  constructor (text) {
    const info = JSON.parse(text)
    this.username = info.username
    this.avatar = info.avatar
    this.bio = info.bio
    this.created = info.created
    this.showcase = info.showcase

    this.isBanned = info.isBanned
    this.isRemoved = info.isRemoved
    this.roles = info.roles

    // Prevent comment/sheet flood
    this.lastPost = info.lastPost ? Number(info.lastPost) : null
  }
}
