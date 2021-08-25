import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import { getAddress } from '@ethersproject/address'
import { VaultData } from './types'
import { BigNumber, ethers } from 'ethers'

/**
 * Constructs a VaultData type
 */
export function constructVaultData(
  name: string,
  symbol: string,
  token: string,
  id: number,
  supply: number,
  listPrice: number,
  fee: number
): VaultData {
  const _token = validateAndParseAddress(token)

  const _id = ethers.utils.parseUnits(String(id), 0)
  const _supply = ethers.utils.parseUnits(String(supply))
  const _listPrice = ethers.utils.parseEther(String(listPrice))

  const _fee = validateCuratorFee(fee)

  return {
    name: name,
    symbol: symbol,
    token: _token,
    id: _id,
    supply: _supply,
    listPrice: _listPrice,
    fee: _fee,
  }
}

/**
 * Returns the proper network name for the specified chainId
 */
export function chainIdToNetworkName(chainId: number): string {
  switch (chainId) {
    case 4: {
      return 'rinkeby'
    }
    case 1: {
      return 'mainnet'
    }
  }
  invariant(
    false,
    `chainId ${chainId} not officially supported by the Fractional Protocol`
  )
}

/**
 * Validates and returns the checksummed address
 */
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch (error) {
    invariant(false, `${address} is not a valid address.`)
  }
}

/**
 * Validates the fee set by the curator
 */
export function validateCuratorFee(fee: number): BigNumber {
  if (fee >= 0 && fee <= 0.1) {
    return ethers.utils.parseUnits(String(fee), 3)
  } else {
    invariant(
      false,
      `${fee} is not a valid curator fee. Must be between 0 and 0.1`
    )
  }
}
