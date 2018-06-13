export default class User {
  constructor (text) {
    const info = JSON.parse(text)
    this.username = info.username
    this.avatar = info.avatar
    this.bio = info.bio
    this.created = new BigNumber(info.created)

    this.isBanned = info.isBanned
    this.roles = info.roles
  }
}
