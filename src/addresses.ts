interface AddressBook {
  [key: string]: {
    [key: string]: string
  }
}

const mainnetAddresses = {
  ERC721VaultFactory: '0x85aa7f78bdb2de8f3e0c0010d99ad5853ffcfc63',
  IndexERC721Factory: '0xde771104c0c44123d22d39bb716339cd0c3333a1',
}

const rinkebyAddresses = {
  ERC721VaultFactory: '0x458556c097251f52ca89cB81316B4113aC734BD1',
  IndexERC721Factory: '0xee727b734aC43fc391b67caFd18e5DD4Dc939668',
}

/**
 * Mapping from Network to Officially Deployed Instances of the Fractional Protocol
 */
export const addresses: AddressBook = {
  mainnet: mainnetAddresses,
  rinkeby: rinkebyAddresses,
}
