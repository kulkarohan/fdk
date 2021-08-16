## Vault Factory Guide

```typescript
import { ethers, Wallet } from 'ethers'
import { constructVaultData, VaultFactory } from 'fdk'

const provider = ethers.providers.someProvider()
const wallet = new Wallet(key, provider)

const vf = new VaultFactory(wallet, 4) // Rinkeby=4, Mainnet=1

/******************
 * View Functions
 ******************
 */
const vaultCount = await vf.getVaultCount()

const vaultId = 33
const vaultAddress = await vf.getVault(vaultId)

const settings = await vf.getSettings()

/*************************
 * Fractionalizing an NFT
 *************************
 */
const vault = constructVaultData(
  name, // name of the ERC20 token which will represent the fractional ownership of locked up NFT
  symbol, // the token symbol of the ERC20 token
  token, // the ethereum address of the NFT which you are fractionalizing
  id, // the unique identifier used for your NFT in its respective smart contract
  supply, // the desired total supply of the ERC20 token
  listPrice, // the desired reserve price at the start of the fractional ownership
  fee // the curator fee which will be paid to the owner of the fractional asset
)

const tx = await vf.mint(vault)
```
