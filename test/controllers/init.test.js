import '../../extensions'
import db from '../../extensions/db'
import { ACCOUNTS } from '../config'

// This will run before all tests
before(() => {
  db.setState({}).write()
  Blockchain.transaction.from = ACCOUNTS.admin
  new Contract().init()

  // Create users
  Blockchain.transaction.from = ACCOUNTS.mallendeo
  new Contract().saveUser({ username: 'mallendeo', avatar: 'mallendeo.jpg' })

  Blockchain.transaction.from = ACCOUNTS.testuser
  new Contract().saveUser({ username: 'testuser', avatar: 'testuser.jpg' })

  Blockchain.transaction.from = ACCOUNTS.bot
  new Contract().saveUser({ username: 'bot', avatar: 'mallendeo.jpg' })
})
