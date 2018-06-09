import BigNumber from 'bignumber.js'
import ContractStorage from './storage'
import Contract from '../src/contract'

// Assign to Global
const LocalContractStorage = ContractStorage.lcs

Object.assign(global, {
  BigNumber,
  Contract,
  ContractStorage,
  LocalContractStorage,
  Blockchain: {
    transaction: {
      from: 'address_1',
      to: 'contract_address'
    }
  },
  Events: {}
})
