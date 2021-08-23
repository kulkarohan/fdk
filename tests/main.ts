import { ethers, Wallet } from 'ethers'
import * as dotenv from 'dotenv'
import { expect } from 'chai'
import { Factory, Vault } from '../src'
import { constructVaultData } from '../src'

dotenv.config()

const PROJECT_ID = process.env.PROJECT_ID
const PROJECT_SECRET = process.env.PROJECT_SECRET

const NETWORK = process.env.NETWORK
const WALLET_KEY = process.env.WALLET_SECRET

const VAULT_NAME = process.env.VAULT_NAME
const VAULT_SYMBOL = process.env.VAULT_SYMBOL
const VAULT_TOKEN = process.env.VAULT_TOKEN

const PROVIDER = new ethers.providers.InfuraProvider(NETWORK, {
  projectId: PROJECT_ID,
  projectSecret: PROJECT_SECRET,
})

const WALLET = new Wallet(WALLET_KEY, PROVIDER)

describe('Factory', () => {
  describe('Constructor', () => {
    it('should throw an error if the chainId is not supported', () => {
      expect(function () {
        new Factory(WALLET, 2)
      }).to.Throw(
        `chainId 2 not officially supported by the Fractional Protocol`
      )
    })

    it('should set the Factory instance to readOnly=false if a signer is specified', () => {
      const fdk = new Factory(WALLET, 1)
      expect(fdk.readOnly).to.equal(false)
    })

    it('should set the Factory instance to readOnly=true if a signer is not provided', () => {
      const fdk = new Factory(PROVIDER, 4)
      expect(fdk.readOnly).to.equal(true)
    })

    it('should initialize the Factory instance with the specified network address', () => {
      const ERC721VaultFactoryRinkebyAddress =
        '0x458556c097251f52ca89cB81316B4113aC734BD1'
      const ERC721VaultFactoryMainnetAddress =
        '0x85aa7f78bdb2de8f3e0c0010d99ad5853ffcfc63'

      const fdkRinkeby = new Factory(WALLET, 4)
      const fdkMainnet = new Factory(WALLET, 1)

      expect(fdkRinkeby.vaultFactoryAddress).to.equal(
        ERC721VaultFactoryRinkebyAddress
      )
      expect(fdkMainnet.vaultFactoryAddress).to.equal(
        ERC721VaultFactoryMainnetAddress
      )
    })
  })

  describe('View Methods', () => {
    const fdk = new Factory(WALLET, 1)

    it('should get the total vault count', async () => {
      const vaultCount = await fdk.vaultCount()
      expect(vaultCount).to.have.a.property('_hex')
    })

    it('should get a vault address when provided an id', async () => {
      const vaultId = 5
      const vaultAddress = await fdk.vaultAddress(vaultId)
      expect(vaultAddress.toString().slice(0, 2)).to.equal('0x')
    })

    it('should return a zero address when provided an id that does not exist yet', async () => {
      const vaultIdThatDoesNotExistYet = 9999
      const zeroAddress = '0x0000000000000000000000000000000000000000'

      const vaultAddress = await fdk.vaultAddress(vaultIdThatDoesNotExistYet)
      expect(vaultAddress).to.equal(zeroAddress)
    })

    it('should get the vault factory settings address', async () => {
      const settingsAddress = '0x1C0857f8642D704ecB213A752A3f68E51913A779'
      const factorySettings = await fdk.vaultSettings()
      expect(factorySettings).to.equal(settingsAddress)
    })

    it('should fetch the contract address for a specified basket', async () => {
      const address = await fdk.basketAddress(1)
      expect(address.toString().slice(0, 2)).to.equal('0x')
    })
  })

  describe('Write methods', () => {
    const fdk = new Factory(WALLET, 4)

    it('should mint a token vault', async () => {
      const vaultData = constructVaultData(
        VAULT_NAME,
        VAULT_SYMBOL,
        VAULT_TOKEN,
        1,
        100,
        1.5,
        0.1
      )

      const tx = await fdk.mint(vaultData)
      expect(tx).to.have.a.property('hash')
    })

    it('should raise curator fee error', () => {
      expect(function () {
        constructVaultData(
          VAULT_NAME,
          VAULT_SYMBOL,
          VAULT_TOKEN,
          1,
          100,
          1.5,
          0.2 // Invalid curator fee
        )
      }).to.Throw('0.2 is not a valid curator fee. Must be between 0 and 0.1')
    })

    it('should create an index erc721 basket', async () => {
      const tx = await fdk.createBasket()
      expect(tx).to.have.a.property('hash')
    })
  })
})

describe('Token Vault', () => {
  const vaultAddress = '0x0bde53dE4A00c0631978aF174287BddB859F468f' // Factory.getVaultAddress(24)
  const vault = new Vault(WALLET, vaultAddress)

  describe('Constructor', () => {
    it('should throw an error if provided an invalid address', () => {
      const invalidAddress = 'foobar'

      expect(function () {
        new Vault(WALLET, invalidAddress)
      }).to.Throw(`${invalidAddress} is not a valid address.`)
    })

    it('should set the Vault instance to readOnly=false if a signer is specified', () => {
      const vaultWithSigner = new Vault(WALLET, vaultAddress)
      expect(vaultWithSigner.readOnly).to.equal(false)
    })

    it('should set the Vault instance to readOnly=true if a signer is not provided', () => {
      const vaultOnlyProvider = new Vault(PROVIDER, vaultAddress)
      expect(vaultOnlyProvider.readOnly).to.equal(true)
    })
  })

  describe('Token information', async () => {
    it("should get the ERC721 address of a vault's token", async () => {
      const tokenAddress = await vault.tokenAddress()
      expect(tokenAddress.toString().slice(0, 2)).to.equal('0x')
    })

    it("should get the ERC721 id of a vault's token", async () => {
      const tokenId = await vault.tokenId()
      expect(tokenId).to.have.a.property('_hex')
    })
  })

  describe('Auction information', async () => {
    it('should get the unix timestamp end time of the token auction', async () => {
      const end = await vault.auctionEnd()
      expect(end).to.have.a.property('_hex')
    })

    it('should get the length of auctions', async () => {
      const length = await vault.auctionLength()
      expect(length).to.have.a.property('_hex')
    })

    it('should get the reserve total (reservePrice * votingTokens)', async () => {
      const reserveTotal = await vault.reserveTotal()
      expect(reserveTotal).to.have.a.property('_hex')
    })

    it('should get the current price of the token during an auction', async () => {
      const price = await vault.livePrice()
      expect(price).to.have.a.property('_hex')
    })

    it('should get the current price of the token during an auction', async () => {
      const state = await vault.auctionState()
      expect(state.toString()).to.contain.oneOf(['0', '1', '2', '3'])
    })
  })

  describe('Vault information', async () => {
    it('should get the governance contract which gets paid in ETH', async () => {
      const contract = await vault.settings()
      expect(contract.toString().slice(0, 2)).to.equal('0x')
    })

    it('should get the address who initially deposited the NFT', async () => {
      const curator = await vault.curator()
      expect(curator.toString().slice(0, 2)).to.equal('0x')
    })

    it('should get the AUM fee paid to the curator yearly', async () => {
      const fee = await vault.fee()
      expect(fee).to.have.a.property('_hex')
    })

    it('should get the last timestamp where fees were claimed', async () => {
      const timestamp = await vault.lastClaimed()
      expect(timestamp).to.have.a.property('_hex')
    })

    it('should get a boolean to indicate if the vault has closed', async () => {
      const closed = await vault.isClosed()
      expect(closed).to.be.a('boolean')
    })

    it('should get the number of ownership tokens voting on the reserve price at any given time', async () => {
      const tokens = await vault.votingTokens()
      expect(tokens).to.have.a.property('_hex')
    })

    it("should get vault token's reserve price", async () => {
      const price = await vault.reservePrice()
      expect(price).to.have.a.property('_hex')
    })
  })
})
