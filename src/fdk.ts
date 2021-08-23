import {
  ethers,
  Signer,
  Contract,
  ContractTransaction,
  BigNumber,
} from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { VaultFactoryABI, BasketFactoryABI, VaultABI, BasketABI } from './abi'
import { addresses } from './addresses'
import { VaultData } from './types'
import { chainIdToNetworkName, validateAndParseAddress } from './utils'

export class FDK {
  public signerOrProvider: Signer | Provider
  public chainId: number
  private readOnly: boolean

  private vaultFactoryAddress: string
  private basketFactoryAddress: string

  private vaultFactory: Contract
  private basketFactory: Contract
  // private vault?: Contract
  // private basket?: Contract

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

  /**************
   * Connectors
   **************
   */

  // /**
  //  * Enables interaction with a deployed token vault
  //  */
  // public connectVault(vaultAddress: string) {
  //   const parsedAddress = validateAndParseAddress(vaultAddress)

  //   this.vault = new ethers.Contract(
  //     parsedAddress,
  //     VaultABI,
  //     this.signerOrProvider
  //   )
  // }

  // /**
  //  * Enables interaction with a deployed Index ERC721 basket
  //  */
  // public connectBasket(basketAddress: string) {
  //   const parsedAddress = validateAndParseAddress(basketAddress)

  //   this.basket = new ethers.Contract(
  //     parsedAddress,
  //     BasketABI,
  //     this.signerOrProvider
  //   )
  // }

  /************************
   * Vault Factory Methods
   ************************
   */

  /**
   * Fetches the total number of token vaults
   */
  public async vaultCount(): Promise<BigNumber> {
    return this.vaultFactory.vaultCount()
  }

  /**
   * Fetches the contract address for a specified vault
   */
  public async vaultAddress(vaultId: number): Promise<string> {
    return this.vaultFactory.vaults(vaultId)
  }

  /**
   * Fetches the address of a settings contract controlled by governance
   */
  public async vaultSettingsAddress(): Promise<string> {
    return this.vaultFactory.settings()
  }

  /**
   * Creates a vault for specified token
   * @experimental for Rinkeby (ie chainId == 4)
   */
  public async mint(vault: VaultData): Promise<ContractTransaction> {
    this.ensureNotReadOnly()

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

  /*************************
   * Basket Factory Methods
   *************************
   */

  /**
   * Creates an Index ERC721 basket
   */
  public async createBasket(): Promise<ContractTransaction> {
    return this.basketFactory.createBasket()
  }

  /**
   * Fetches the contract address for a specified basket
   */
  public async basketAddress(id: number): Promise<string> {
    return this.basketFactory.baskets(id)
  }

  // /******************
  //  * Basket Methods
  //  ******************
  //  */

  // /**
  //  * Deposit an ERC721 token from another contract into an ERC721 in this contract
  //  */
  // public async depositERC721(
  //   tokenAddress: string,
  //   tokenId: number
  // ): Promise<ContractTransaction> {
  //   if (!this.basket) {
  //     throw new Error(
  //       'BasketNotConnected: FDK instance cannot call basket methods without a connected basket.'
  //     )
  //   }
  //   const parsedAddress = validateAndParseAddress(tokenAddress)
  //   return this.basket.depositERC721(parsedAddress, tokenId)
  // }

  // /**
  //  * Withdraw an ERC721 token from this contract into your wallet
  //  */
  // public async withdrawERC721(
  //   tokenAddress: string,
  //   tokenId: number
  // ): Promise<ContractTransaction> {
  //   if (!this.basket) {
  //     throw new Error(
  //       'BasketNotConnected: FDK instance cannot call basket methods without a connected basket.'
  //     )
  //   }
  //   const parsedAddress = validateAndParseAddress(tokenAddress)
  //   return this.basket.withdrawERC721(parsedAddress, tokenId)
  // }

  // /**
  //  * Withdraw ETH in the case a held NFT earned ETH (ie. euler beats)
  //  */
  // public async withdrawETH(): Promise<ContractTransaction> {
  //   if (!this.basket) {
  //     throw new Error(
  //       'BasketNotConnected: FDK instance cannot call basket methods without a connected basket.'
  //     )
  //   }
  //   return this.basket.withdrawETH()
  // }

  // /**
  //  * Withdraw ERC20 in the case a held NFT earned ERC20
  //  */
  // public async withdrawERC20(
  //   tokenAddress: string
  // ): Promise<ContractTransaction> {
  //   if (!this.basket) {
  //     throw new Error(
  //       'BasketNotConnected: FDK instance cannot call basket methods without a connected basket.'
  //     )
  //   }
  //   const parsedAddress = validateAndParseAddress(tokenAddress)
  //   return this.basket.withdrawERC20(parsedAddress)
  // }

  // /****************
  //  * Vault Methods
  //  ****************
  //  */

  // // -------- TOKEN INFORMATION --------

  // /**
  //  * Fetches the ERC721 address of a vault's token
  //  */
  // public async tokenAddress(): Promise<string> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.token()
  // }

  // /**
  //  * Fetches the ERC721 token ID of a vault's token
  //  */
  // public async tokenId(): Promise<string> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.id()
  // }
  // // -------- AUCTION INFORMATION --------

  // // -------- VAULT INFORMATION --------

  // /**
  //  * Fetches the governance contract which gets paid in ETH
  //  */
  // public async settings(): Promise<string> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.settings()
  // }

  // /**
  //  * Fetches the address who initially deposited the NFT
  //  */
  // public async curator(): Promise<string> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.curator()
  // }

  // /**
  //  * Fetches the AUM fee paid to the curator yearly. 3 decimals. ie. 100 = 10%
  //  */
  // public async fee(): Promise<number> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.fee()
  // }

  // /**
  //  * Fetches the last timestamp where fees were claimed
  //  */
  // public async lastClaimed(): Promise<BigNumber> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.lastClaimed()
  // }

  // /**
  //  * Fetches a boolean to indicate if the vault has closed
  //  */
  // public async isClosed(): Promise<boolean> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.vaultClosed()
  // }

  // /**
  //  * Fetches the number of ownership tokens voting on the reserve price at any given time
  //  */
  // public async votingTokens(): Promise<BigNumber> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.votingTokens()
  // }

  // /**
  //  * Fetches a mapping of users to their desired token price
  //  */
  // public async userPrices(address: string): Promise<BigNumber> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   const parsedAddress = validateAndParseAddress(address)
  //   return this.vault.userPrices(parsedAddress)
  // }

  // // -------- VIEW METHODS --------

  // // public async reservePrice(): Promise<BigNumber> {
  // //   if (!this.vault) {
  // //     throw new Error(
  // //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  // //     )
  // //   }
  // //   return this.vault.reservePrice()
  // // }

  // // -------- GOVERNANCE METHODS --------

  // /**
  //  * Allows governance to remove a curator who is acting maliciously in some way.
  //  */
  // // public async kickCurator(newCurator: string): Promise<void> {
  // //   if (!this.vault) {
  // //     throw new Error(
  // //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  // //     )
  // //   }
  // //   const parsedAddress = validateAndParseAddress(newCurator)
  // //   return this.vault.kickCurator(parsedAddress)
  // // }

  // /**
  //  * Allow governance to remove a bad reserve price
  //  */
  // // public async removeReserve(userAddress: string): Promise<void> {
  // //   if (!this.vault) {
  // //     throw new Error(
  // //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  // //     )
  // //   }
  // //   const parsedAddress = validateAndParseAddress(userAddress)
  // //   return this.vault.removeReserve(parsedAddress)
  // // }

  // // -------- CURATOR METHODS --------

  // /**
  //  * Allows the curator to update their curator address
  //  */
  // public async updateCurator(address: string): Promise<void> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   const parsedAddress = validateAndParseAddress(address)
  //   return this.vault.updateCurator(parsedAddress)
  // }

  // /**
  //  * Allows the curator to update the length of an auction for the NFT.
  //  */
  // public async updateAuctionLength(days: number): Promise<void> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   const parsedDays = this.parseDays(days)
  //   return this.vault.updateCuratorLength(parsedDays)
  // }

  // /**
  //  * Allows the curator to update their fee.
  //  */
  // public async updateFee(fee: number): Promise<void> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.updateFee(fee)
  // }

  // /**
  //  * Can be called by anyone but claims fees for the curator and governance.
  //  */
  // public async claimFees(): Promise<void> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   return this.vault.claimFees()
  // }

  // // -------- PRICING METHODS --------

  // /**
  //  * Allows a user to update their desired reserve price.
  //  * Updates the full reserve price as well.
  //  */
  // public async updateUserPrice(price: number): Promise<void> {
  //   if (!this.vault) {
  //     throw new Error(
  //       'VaultNotConnected: FDK instance cannot call vault methods without a connected token vault.'
  //     )
  //   }
  //   const parsedPrice = ethers.utils.parseUnits(String(price), 'ether')
  //   return this.vault.updateUserPrice(parsedPrice)
  // }

  // -------- AUCTION METHODS --------

  /******************
   * Private Methods
   ******************
   */

  /**
   * Throws an error if called on a readOnly == true instance
   * @private
   */
  private ensureNotReadOnly() {
    if (this.readOnly) {
      throw new Error(
        'ensureNotReadOnly: readOnly FDK instance cannot call contract methods that require a signer.'
      )
    }
  }

  /**
   * Converts days from canonical units to Solidity's native 'days' time unit.
   * Enables intuitive interaction with eg.`updateAuctionLength`
   */
  private parseDays(days: number): number {
    // 86400 is the uint256 representation of `1 days`
    return days * 86400
  }
}
