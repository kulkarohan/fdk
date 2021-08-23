import { ethers, Signer, Contract, BigNumberish } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { VaultABI } from './abi'
import { validateAndParseAddress } from './utils'

export class Vault {
  public signerOrProvider: Signer | Provider
  public readOnly: boolean
  private vaultAddress: string
  private vault: Contract

  constructor(signerOrProvider: Signer | Provider, address: string) {
    if (Signer.isSigner(signerOrProvider)) {
      this.readOnly = false
    } else {
      this.readOnly = true
    }

    this.signerOrProvider = signerOrProvider
    this.vaultAddress = validateAndParseAddress(address)

    this.vault = new ethers.Contract(
      this.vaultAddress,
      VaultABI,
      this.signerOrProvider
    )
  }

  // -------- TOKEN INFORMATION --------

  /**
   * Fetches the ERC721 address of a vault's token
   */
  public async tokenAddress(): Promise<BigNumberish> {
    return this.vault.token()
  }

  /**
   * Fetches the ERC721 token ID of a vault's token
   */
  public async tokenId(): Promise<BigNumberish> {
    return this.vault.id()
  }

  // -------- AUCTION INFORMATION --------

  /**
   * Fetches the unix timestamp end time of the token auction
   */
  public async auctionEnd(): Promise<BigNumberish> {
    return this.vault.auctionEnd()
  }

  /**
   * Fetches the length of auctions
   */
  public async auctionLength(): Promise<BigNumberish> {
    return this.vault.auctionLength()
  }

  /**
   * Fetches reservePrice * votingTokens
   */
  public async reserveTotal(): Promise<BigNumberish> {
    return this.vault.reserveTotal()
  }

  /**
   * Fetches the current price of the token during an auction
   */
  public async livePrice(): Promise<BigNumberish> {
    return this.vault.livePrice()
  }

  /**
   * Fetches the state of an auction
   */
  public async auctionState(): Promise<BigNumberish> {
    return this.vault.auctionState()
  }

  // -------- VAULT INFORMATION ----------

  /**
   * Fetches the governance contract which gets paid in ETH
   */
  public async settings(): Promise<BigNumberish> {
    return this.vault.settings()
  }

  /**
   * Fetches the address who initially deposited the NFT
   */
  public async curator(): Promise<BigNumberish> {
    return this.vault.curator()
  }

  /**
   * Fetches the AUM fee paid to the curator yearly. 3 decimals. ie. 100 = 10%
   */
  public async fee(): Promise<BigNumberish> {
    return this.vault.fee()
  }

  /**
   * Fetches the last timestamp where fees were claimed
   */
  public async lastClaimed(): Promise<BigNumberish> {
    return this.vault.lastClaimed()
  }

  /**
   * Fetches a boolean to indicate if the vault has closed
   */
  public async isClosed(): Promise<boolean> {
    return this.vault.vaultClosed()
  }

  /**
   * Fetches the number of ownership tokens voting on the reserve price at any given time
   */
  public async votingTokens(): Promise<BigNumberish> {
    return this.vault.votingTokens()
  }

  /**
   * Fetches a mapping of users to their desired token price
   */
  public async userPrices(address: string): Promise<BigNumberish> {
    const parsedAddress = validateAndParseAddress(address)
    return this.vault.userPrices(parsedAddress)
  }

  // -------- VIEW METHODS --------

  /**
   * Fetches token's reserve price
   */
  public async reservePrice(): Promise<BigNumberish> {
    return this.vault.reservePrice()
  }

  // -------- GOVERNANCE METHODS --------

  /**
   * Allows governance to remove a curator who is acting maliciously in some way.
   */
  public async kickCurator(newCurator: string): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedAddress = validateAndParseAddress(newCurator)
    return this.vault.kickCurator(parsedAddress)
  }

  /**
   * Allows governance to remove a bad reserve price
   */
  public async removeReserve(userAddress: string): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedAddress = validateAndParseAddress(userAddress)
    return this.vault.removeReserve(parsedAddress)
  }

  // -------- CURATOR METHODS --------

  /**
   * Allows the curator to update their curator address
   */
  public async updateCurator(address: string): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedAddress = validateAndParseAddress(address)
    return this.vault.updateCurator(parsedAddress)
  }

  /**
   * Allows the curator to update the length of an auction for the NFT.
   */
  public async updateAuctionLength(days: number): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedDays = this.parseDays(days)
    return this.vault.updateCuratorLength(parsedDays)
  }

  /**
   * Allows the curator to update their fee.
   */
  public async updateFee(fee: number): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    return this.vault.updateFee(fee)
  }

  /**
   * Can be called by anyone but claims fees for the curator and governance.
   */
  public async claimFees(): Promise<void> {
    return this.vault.claimFees()
  }

  // -------- PRICING METHODS --------

  /**
   * Allows a user to update their desired reserve price.
   * Updates the full reserve price as well.
   */
  public async updateUserPrice(price: number): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedPrice = ethers.utils.parseEther(String(price))
    return this.vault.updateUserPrice(parsedPrice)
  }

  // -------- AUCTION METHODS --------

  /**
   * Kicks off an auction by sending ETH to the smart contract
   */
  public async start(reservePrice: number): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedReservePrice = ethers.utils.parseEther(String(reservePrice))
    return this.vault.start({
      value: parsedReservePrice,
    })
  }

  /**
   * Bid on a live auction to purchase the vault's NFT
   */
  public async bid(bidAmount: number): Promise<void> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const parsedBidAmount = ethers.utils.parseEther(String(bidAmount))
    return this.vault.bid({
      value: parsedBidAmount,
    })
  }

  /**
   * Can be called by anyone once an auction has ended to close the vault and send NFT to the winner.
   */
  public async end(): Promise<void> {
    return this.vault.end()
  }

  /**
   * Burns the total supply of ERC20 ownership tokens to receive the ERC721 token
   */
  public async redeem(): Promise<void> {
    return this.vault.redeem()
  }

  /**
   * Burns ERC20 tokens to receive ETH from ERC721 token purchase
   */
  public async cash(): Promise<void> {
    return this.vault.cash()
  }

  // -------- PRIVATE METHODS --------

  /**
   * Throws an error if called on a readOnly == true instance
   * @private
   */
  private ensureNotReadOnly() {
    if (this.readOnly) {
      throw new Error(
        'ensureNotReadOnly: cannot call contract methods that require a signer.'
      )
    }
  }

  /**
   * Converts days from canonical units to Solidity 'days' unit.
   * For intuitive interaction with `updateAuctionLength`
   */
  private parseDays(days: number): number {
    // 86400 is the uint256 representation of `1 days`
    return days * 86400
  }
}
