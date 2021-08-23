import { ethers, Signer, Contract, ContractTransaction } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { BasketABI } from './abi'
import { validateAndParseAddress } from './utils'

export class Basket {
  public signerOrProvider: Signer | Provider
  private readOnly: boolean
  private basketAddress: string
  private basket: Contract

  constructor(signerOrProvider: Signer | Provider, address: string) {
    if (Signer.isSigner(signerOrProvider)) {
      this.readOnly = false
    } else {
      this.readOnly = true
    }

    this.signerOrProvider = signerOrProvider
    this.basketAddress = validateAndParseAddress(address)

    this.basket = new ethers.Contract(
      this.basketAddress,
      BasketABI,
      this.signerOrProvider
    )
  }

  /**
   * Deposit an ERC721 token from another contract into an ERC721 in this contract
   */
  public async depositERC721(
    tokenAddress: string,
    tokenId: number
  ): Promise<ContractTransaction> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }
    const parsedAddress = validateAndParseAddress(tokenAddress)
    return this.basket.depositERC721(parsedAddress, tokenId)
  }

  /**
   * Withdraw an ERC721 token from this contract into your wallet
   */
  public async withdrawERC721(
    tokenAddress: string,
    tokenId: number
  ): Promise<ContractTransaction> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }
    const parsedAddress = validateAndParseAddress(tokenAddress)
    return this.basket.withdrawERC721(parsedAddress, tokenId)
  }

  /**
   * Withdraw ETH in the case a held NFT earned ETH (ie. euler beats)
   */
  public async withdrawETH(): Promise<ContractTransaction> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }
    return this.basket.withdrawETH()
  }

  /**
   * Withdraw ERC20 in the case a held NFT earned ERC20
   */
  public async withdrawERC20(
    tokenAddress: string
  ): Promise<ContractTransaction> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }
    const parsedAddress = validateAndParseAddress(tokenAddress)
    return this.basket.withdrawERC20(parsedAddress)
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
}
