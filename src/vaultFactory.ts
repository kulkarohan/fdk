import { ethers, Signer, Contract, ContractTransaction } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { VaultFactoryABI } from './abi'
import { addresses } from './addresses'
import { VaultData } from './types'
import { chainIdToNetworkName } from './utils'

export class VaultFactory {
  public signerOrProvider: Signer | Provider
  public chainId: number
  public readOnly: boolean

  public vaultFactoryAddress: string
  public vaultFactory: Contract

  constructor(signerOrProvider: Signer | Provider, chainId: number) {
    if (Signer.isSigner(signerOrProvider)) {
      this.readOnly = false
    } else {
      this.readOnly = true
    }

    this.signerOrProvider = signerOrProvider
    this.chainId = chainId

    const network = chainIdToNetworkName(chainId)
    this.vaultFactoryAddress = addresses[network].vaultFactory

    this.vaultFactory = new ethers.Contract(
      this.vaultFactoryAddress,
      VaultFactoryABI,
      this.signerOrProvider
    )
  }

  /****************************
   * Vault Factory View Methods
   ****************************
   */

  /**
   * Fetches the number of ERC721 vaults
   */
  public async getVaultCount(): Promise<number> {
    return this.vaultFactory.vaultCount()
  }

  /**
   * Fetches the vault contract address for a specified vault number
   * @param vaultId
   */
  public async getVault(vaultId: number): Promise<string> {
    return this.vaultFactory.vaults(vaultId)
  }

  /**
   * Fetches the address of a settings contract controlled by governance
   */
  public async getSettings(): Promise<string> {
    return this.vaultFactory.settings()
  }

  /*****************************
   * Vault Factory Write Methods
   *****************************
   */

  /**
   * Fractionalizes an NFT
   * @param vault
   */
  public async mint(vault: VaultData): Promise<ContractTransaction> {
    try {
      this.ensureNotReadOnly()
    } catch (err) {
      Promise.reject(err.message)
    }

    // const gasEstimate = await this.vaultFactory.estimateGas.mint(
    //   vault.name,
    //   vault.symbol,
    //   vault.token,
    //   vault.id,
    //   vault.supply,
    //   vault.listPrice,
    //   vault.fee
    // )
    // const paddedEstimate = gasEstimate.mul(110).div(100)

    return this.vaultFactory.mint(
      vault.name,
      vault.symbol,
      vault.token,
      vault.id,
      vault.supply,
      vault.listPrice,
      vault.fee,
      {
        gasLimit: 250000,
      }
    )
  }

  /******************
   * Private Methods
   ******************
   */

  /**
   * Throws an error if called on a readOnly == true instance of VF
   * @private
   */
  private ensureNotReadOnly() {
    if (this.readOnly) {
      throw new Error(
        'ensureNotReadOnly: readOnly FDK instance cannot call contract methods that require a signer.'
      )
    }
  }
}
