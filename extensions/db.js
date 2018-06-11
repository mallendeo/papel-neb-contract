import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import Memory from 'lowdb/adapters/Memory'
import path from 'path'
import fs from 'fs-extra'

const ENV_TEST = process.env.NODE_ENV === 'test'

if (!ENV_TEST) fs.ensureDirSync('tmp')

export default low(
  ENV_TEST
    ? new Memory()
    : new FileSync(path.join(__dirname, '../tmp/db.json'))
)
