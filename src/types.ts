import { BigNumberish } from '@ethersproject/bignumber'

/**
 * Fractional Protocol Vault
 */
export type VaultData = {
  name: BigNumberish // name of the ERC20 token which will represent the fractional ownership of locked up NFT
  symbol: BigNumberish // the token symbol of the ERC20 token
  token: BigNumberish // the ethereum address of the NFT which you are fractionalizing
  id: BigNumberish // the unique identifier used for your NFT in its respective smart contract
  supply: BigNumberish // the desired total supply of the ERC20 token
  listPrice: BigNumberish // the desired reserve price at the start of the fractional ownership
  fee: BigNumberish // the curator fee which will be paid to the owner of the fractional asset
}
