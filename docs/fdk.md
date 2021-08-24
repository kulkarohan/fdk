## FDK Guide

```typescript
import { ethers, Wallet } from 'ethers'
import { Factory, Vault, constructVaultData } from './src'

const provider = ethers.providers.someProvider()
const wallet = new Wallet(key, provider)

const factory = new Factory(wallet, 1) // Mainnet=1, Rinkeby=4

// ------------ Factory Data ----------------------

const vaultCount = await factory.getVaultCount() // total vault count
const vaultId = 24 // vault id
const vaultAddress = await factory.getVault(vaultId) // address of vault 24
const settings = await factory.getSettings() // vault factory settings address

// ------------ Fractionalizing an NFT ------------

const vaultData = constructVaultData(
  name, // name of the ERC20 token which will represent the fractional ownership of locked up NFT
  symbol, // the token symbol of the ERC20 token
  token, // the ethereum address of the NFT which you are fractionalizing
  id, // the unique identifier used for your NFT in its respective smart contract
  supply, // the desired total supply of the ERC20 token
  listPrice, // the desired reserve price at the start of the fractional ownership
  fee // the curator fee which will be paid to the owner of the fractional asset
)

const tx = await factory.mint(vaultData)
await tx.wait(5)

// ------------ Vault Data ------------------------

const vault = new Vault(wallet, vaultAddress)

// Token information
const tokenAddress = await vault.tokenAddress() // ERC721 address of a vault's toke
const tokenId = await vault.tokenId() // ERC721 id of a vault's token

// Auction information
const auctionEnd = await vault.auctionEnd() // unix timestamp end time of the token auction
const auctionLength = await vault.auctionLength() // length of the token auction
const reserveTotal = await vault.reserveTotal() // reserve total = reservePrice * votingTokens
const currentPrice = await vault.livePrice() // current price of the token during an auction
const auctionState = await vault.auctionState() // state of the auction

// Vault information
const settings = await vault.settings() // governance contract which gets paid in ETH
const curator = await vault.curator() // address who initially deposited the NFT
const fee = await vault.fee() // AUM fee paid to the curator yearly
const lastClaimed = await vault.lastClaimed() // last timestamp where fees were claimed
const isClosed = await vault.isClosed() // boolean indicating if the vault has closed
const tokens = await vault.votingTokens() // number of ownership tokens voting on the reserve price at any given time
const reservePrice = await vault.reservePrice() // vault token's reserve price
```
