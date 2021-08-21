import {
  ethers,
  Signer,
  Contract,
  ContractTransaction,
  BigNumberish,
} from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { VaultFactoryABI, BasketFactoryABI } from './abi'
import { addresses } from './addresses'
import { VaultData } from './types'
import { chainIdToNetworkName } from './utils'

export class FDK {
  public signerOrProvider: Signer | Provider
  public chainId: number
  public readOnly: boolean

  public vaultFactoryAddress: string
  public basketFactoryAddress: string

  private vaultFactory: Contract
  private basketFactory: Contract

  constructor(signerOrProvider: Signer | Provider, chainId: number) {
    if (Signer.isSigner(signerOrProvider)) {
      this.readOnly = false
    } else {
      this.readOnly = true
    }

    this.signerOrProvider = signerOrProvider
    this.chainId = chainId

    const network = chainIdToNetworkName(chainId)

    this.vaultFactoryAddress = addresses[network].ERC721VaultFactory
    this.basketFactoryAddress = addresses[network].IndexERC721Factory

    this.vaultFactory = new ethers.Contract(
      this.vaultFactoryAddress,
      VaultFactoryABI,
      this.signerOrProvider
    )

    this.basketFactory = new ethers.Contract(
      this.basketFactoryAddress,
      BasketFactoryABI,
      this.signerOrProvider
    )
  }

  // -------- VAULT FACTORY METHODS --------

  /**
   * Fetches the total number of token vaults
   */
  public async vaultCount(): Promise<BigNumberish> {
    return this.vaultFactory.vaultCount()
  }

  /**
   * Fetches the contract address for a specified vault
   */
  public async vaultAddress(vaultId: number): Promise<BigNumberish> {
    return this.vaultFactory.vaults(vaultId)
  }

  /**
   * Fetches the address of a settings contract controlled by governance
   */
  public async vaultSettings(): Promise<BigNumberish> {
    return this.vaultFactory.settings()
  }

  /**
   * Creates a vault for specified token
   * @experimental for Rinkeby (ie when chainId == 4)
   */
  public async mint(vault: VaultData): Promise<ContractTransaction> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      return Promise.reject(err.message)
    }

    const gasEstimate = await this.vaultFactory.estimateGas.mint(
      vault.name,
      vault.symbol,
      vault.token,
      vault.id,
      vault.supply,
      vault.listPrice,
      vault.fee
    )
    const paddedEstimate = gasEstimate.mul(110).div(100)

    return this.vaultFactory.mint(
      vault.name,
      vault.symbol,
      vault.token,
      vault.id,
      vault.supply,
      vault.listPrice,
      vault.fee,
      {
        gasLimit: paddedEstimate,
      }
    )
  }

  // -------- BASKET FACTORY METHODS --------

  /**
   * Fetches the contract address for a specified basket
   */
  public async basketAddress(id: number): Promise<BigNumberish> {
    return this.basketFactory.baskets(id)
  }

  /**
   * Creates an Index ERC721 basket
   */
  public async createBasket(): Promise<ContractTransaction> {
    const gasEstimate = await this.basketFactory.estimateGas.createBasket()
    const paddedEstimate = gasEstimate.mul(110).div(100)

    return this.basketFactory.createBasket({
      gasLimit: paddedEstimate,
    })
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
