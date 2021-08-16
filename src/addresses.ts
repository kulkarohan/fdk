interface AddressBook {
  [key: string]: {
    [key: string]: string
  }
}

const mainnetAddresses = {
  vaultFactory: '0x85aa7f78bdb2de8f3e0c0010d99ad5853ffcfc63',
  tokenVault: '0x7b0fce54574d9746414d11367f54c9ab94e53dca',
  settings: '0xE0FC79183a22106229B84ECDd55cA017A07eddCa',
  indexERC721Factory: '0xde771104c0c44123d22d39bb716339cd0c3333a1',
}

const rinkebyAddresses = {
  vaultFactory: '0x458556c097251f52ca89cB81316B4113aC734BD1',
  tokenVault: '0x825f25f908db46daEA42bd536d25f8633667f62b',
  settings: '0x1C0857f8642D704ecB213A752A3f68E51913A779',
  indexERC721Factory: '0xee727b734aC43fc391b67caFd18e5DD4Dc939668',
}

/**
 * Mapping from Network to Officially Deployed Instances of the Fractional Protocol
 */
export const addresses: AddressBook = {
  mainnet: mainnetAddresses,
  rinkeby: rinkebyAddresses,
}
