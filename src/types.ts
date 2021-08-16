import { BigNumber } from '@ethersproject/bignumber'

/**
 * Fractional Protocol Vault
 */
export type VaultData = {
  name: string // name of the ERC20 token which will represent the fractional ownership of locked up NFT
  symbol: string // the token symbol of the ERC20 token
  token: string // the ethereum address of the NFT which you are fractionalizing
  id: number // the unique identifier used for your NFT in its respective smart contract
  supply: number // the desired total supply of the ERC20 token
  listPrice: BigNumber // the desired reserve price at the start of the fractional ownership
  fee: BigNumber // the curator fee which will be paid to the owner of the fractional asset
}
