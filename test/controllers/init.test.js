import '../../extensions'
import db from '../../extensions/db'
import { ACCOUNTS } from '../config'

// This will run before all tests
before(() => {
  db.setState({}).write()
  Blockchain.transaction.from = ACCOUNTS.admin
  const contract = new Contract()
  contract.init()

  // Create users
  Blockchain.transaction.from = ACCOUNTS.mallendeo
  contract.saveUser({ username: 'mallendeo', avatar: 'mallendeo.jpg' })

  Blockchain.transaction.from = ACCOUNTS.testuser
  contract.saveUser({ username: 'testuser', avatar: 'testuser.jpg' })

  Blockchain.transaction.from = ACCOUNTS.bot
  contract.saveUser({ username: 'bot', avatar: 'mallendeo.jpg' })
})
