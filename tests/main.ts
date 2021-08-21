import { ethers, Wallet } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import * as dotenv from 'dotenv'
import { expect } from 'chai'
import { FDK } from '../src/fdk'
import { constructVaultData } from '../src/utils'

dotenv.config()

const PROJECT_ID = process.env.PROJECT_ID
const PROJECT_SECRET = process.env.PROJECT_SECRET
const WALLET_KEY = process.env.WALLET_SECRET

const PROVIDER = new ethers.providers.InfuraProvider('rinkeby', {
  projectId: PROJECT_ID,
  projectSecret: PROJECT_SECRET,
})

const WALLET = new Wallet(WALLET_KEY, PROVIDER)

describe('FDK', () => {
  describe('Constructor', () => {
    it('should throw an error if the chainId is not supported', () => {
      const wallet = Wallet.createRandom()
      expect(function () {
        new FDK(wallet, 2)
      }).to.Throw(
        `chainId 2 not officially supported by the Fractional Protocol`
      )
    })

    it('should set the FDK instance to readOnly=false if a signer is specified', () => {
      const wallet = Wallet.createRandom()
      const fdk = new FDK(wallet, 4)
      expect(fdk.readOnly).to.equal(false)
    })

    it('should set the FDK instance to readOnly=true if a signer is not provided', () => {
      const provider = new JsonRpcProvider()
      const fdk = new FDK(provider, 4)
      expect(fdk.readOnly).to.equal(true)
    })

    it('should initialize the FDK instance with the specified network address', () => {
      const wallet = Wallet.createRandom()
      const ERC721VaultFactoryRinkeby =
        '0x458556c097251f52ca89cB81316B4113aC734BD1'
      const ERC721VaultFactoryMainnet =
        '0x85aa7f78bdb2de8f3e0c0010d99ad5853ffcfc63'
      const fdkRinkeby = new FDK(wallet, 4)
      const fdkMainnet = new FDK(wallet, 1)
      expect(fdkRinkeby.vaultFactoryAddress).to.equal(ERC721VaultFactoryRinkeby)
      expect(fdkMainnet.vaultFactoryAddress).to.equal(ERC721VaultFactoryMainnet)
    })
  })

  describe('Vault Factory: View Methods', () => {
    const fdk = new FDK(WALLET, 4)

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
      const settings = '0x1C0857f8642D704ecB213A752A3f68E51913A779'
      const fdkSettings = await fdk.vaultSettings()
      expect(fdkSettings).to.equal(settings)
    })
  })

  describe('Vault Factory: Fractionalizing an NFT', () => {
    const fdk = new FDK(WALLET, 4)

    const vaultData = constructVaultData(
      'Robot',
      'ROB',
      '0xa3c784F717EFa8d3A44DF80A5d33E734F5c1A7Ee',
      1,
      100,
      1.5,
      0.1
    )

    it('should mint a token vault', async () => {
      const tx = await fdk.mint(vaultData)
      expect(tx).to.have.a.property('hash')
    })

    it('should raise curator fee error', () => {
      expect(function () {
        constructVaultData(
          'Robot',
          'ROB',
          '0xa3c784F717EFa8d3A44DF80A5d33E734F5c1A7Ee',
          1,
          100,
          1.5,
          0.2 // Invalid curator fee
        )
      }).to.Throw('0.2 is not a valid curator fee. Must be between 0 and 0.1')
    })
  })

  describe('Basket Factory Methods', () => {
    const fdk = new FDK(WALLET, 4)

    it('should fetch the contract address for a specified basket', async () => {
      const address = await fdk.basketAddress(1)
      expect(address.toString().slice(0, 2)).to.equal('0x')
    })

    it('should create an index erc721 basket', async () => {
      const tx = await fdk.createBasket()
      expect(tx).to.have.a.property('hash')
    })
  })
})
