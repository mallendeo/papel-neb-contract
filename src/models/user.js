export default class User {
  constructor (text) {
    const info = JSON.parse(text)
    this.username = info.username
    this.avatar = info.avatar
    this.created = new BigNumber(info.created)
  }
}
