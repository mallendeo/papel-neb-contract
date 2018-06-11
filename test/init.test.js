import '../extensions'
import db from '../extensions/db'

// This will run before all tests
before(() => {
  db.setState({}).write()
  Blockchain.transaction.from = 'NB_ADDRESS_ADMIN'

  new Contract().init()
})
