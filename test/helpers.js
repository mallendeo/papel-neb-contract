import crypto from 'crypto'

export const makeHash = () => crypto.randomBytes(16).toString('hex')

export const newTxHash = () => {
  const hash = makeHash()
  Blockchain.transaction.hash = hash
  return hash
}
