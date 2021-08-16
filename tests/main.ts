import { ethers, Wallet } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import * as dotenv from 'dotenv'
import { expect } from 'chai'
import { VaultFactory } from '../src/vaultFactory'
import { constructVaultData } from '../src/utils'

dotenv.config()

const PROJECT_ID = process.env.PROJECT_ID
const PROJECT_SECRET = process.env.PROJECT_SECRET
const WALLET_KEY = process.env.WALLET_SECRET

const PROVIDER = new ethers.providers.InfuraProvider('rinkeby', {
  projectId: PROJECT_ID,
  projectSecret: PROJECT_SECRET,
})

//@ts-ignore
const WALLET = new Wallet(WALLET_KEY, PROVIDER)

describe('Vault Factory', () => {
  describe('Constructor', () => {
    it('should throw an error if the chainId is not supported', () => {
      const wallet = Wallet.createRandom()
      expect(function () {
        new VaultFactory(wallet, 2)
      }).to.Throw(
        `chainId 2 not officially supported by the Fractional Protocol`
      )
    })
    it('should set the VaultFactory instance to readOnly=false if a signer is specified', () => {
      const wallet = Wallet.createRandom()
      const vf = new VaultFactory(wallet, 4)
      expect(vf.readOnly).to.equal(false)
    })
    it('should set the VaultFactory instance to readOnly=true if a signer is not provided', () => {
      const provider = new JsonRpcProvider()
      const vf = new VaultFactory(provider, 4)
      expect(vf.readOnly).to.equal(true)
    })
    it('should initialize the VaultFactory instance with the specified network address', () => {
      const wallet = Wallet.createRandom()
      const vaultFactoryRinkeby = '0x458556c097251f52ca89cB81316B4113aC734BD1'
      const vaultFactoryMainnet = '0x85aa7f78bdb2de8f3e0c0010d99ad5853ffcfc63'
      const rinkebyVF = new VaultFactory(wallet, 4)
      const mainnetVF = new VaultFactory(wallet, 1)
      expect(rinkebyVF.vaultFactoryAddress).to.equal(vaultFactoryRinkeby)
      expect(mainnetVF.vaultFactoryAddress).to.equal(vaultFactoryMainnet)
    })
  })
  describe('View Functions', () => {
    const vf = new VaultFactory(WALLET, 4)
    it('should get the total vault count', async () => {
      const vaultCount = await vf.getVaultCount()
      expect(vaultCount).to.have.a.property('_hex')
    })
    it('should get a vault address when provided an id', async () => {
      const vaultId = 7
      const vaultAddress = await vf.getVault(vaultId)
      expect(vaultAddress.toString().slice(0, 2)).to.equal('0x')
    })
    it('should return a zero address when provided an id that does not exist yet', async () => {
      const vaultIdThatDoesNotExistYet = 9999
      const zeroAddress = '0x0000000000000000000000000000000000000000'
      const vaultAddress = await vf.getVault(vaultIdThatDoesNotExistYet)
      expect(vaultAddress).to.equal(zeroAddress)
    })
    it('should get the vault factory settings address', async () => {
      const settings = '0x1C0857f8642D704ecB213A752A3f68E51913A779'
      const vaultFactorySettings = await vf.getSettings()
      expect(vaultFactorySettings).to.equal(settings)
    })
  })
  describe('Fractionalizing an NFT', () => {
    const vf = new VaultFactory(WALLET, 4)
    const vaultData = constructVaultData(
      'TestFDK',
      'FDK',
      '0xa3c784F717EFa8d3A44DF80A5d33E734F5c1A7Ee',
      0,
      100,
      1.5,
      0.1
    )

    it('should mint a token vault', async () => {
      const tx = await vf.mint(vaultData)

      expect(tx).to.have.a.property('hash')
    })

    it('should raise curator fee error', () => {
      expect(function () {
        constructVaultData(
          'TestFDK',
          'FDK',
          '0xa3c784F717EFa8d3A44DF80A5d33E734F5c1A7Ee',
          0,
          100,
          1.5,
          0.2 // Invalid curator fee
        )
      }).to.Throw('0.2 is not a valid curator fee. Must be between 0 and 0.1')
    })
  })
})
