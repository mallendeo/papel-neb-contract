import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import Memory from 'lowdb/adapters/Memory'
import path from 'path'
import fs from 'fs-extra'

const { FILE_DB } = process.env

if (FILE_DB) fs.ensureDirSync('tmp')

export default low(
  FILE_DB
    ? new FileSync(path.join(__dirname, '../tmp/db.json'))
    : new Memory()
)
