const HDWalletProvider = require('@truffle/hdwallet-provider');
// ***** changing IS_KARDIACHAIN Then Change in truffle config also *****
var onKardiaChain = true;

if (!onKardiaChain) {
  module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",     // Localhost (default: none)
        port: 7545,            // Standard Ethereum port (default: none)
        network_id: "*"       // Any network (default: none)
      }
    },
    mocha: {
      timeout: 100000
    },
    compilers: {
      solc: {
        version: "0.8.7"      // Fetch exact version from solc-bin (default: truffle's version)
      }
    }
  };

} else {
  const mnemonic = "spell kidney notable arrow machine elegant crumble random knee furnace produce bargain";
  module.exports = {
    networks: {
      development: {
        provider: () => new HDWalletProvider(mnemonic, `https://dev.kardiachain.io`),
        network_id: "69",       // KardiaChain Testnet network id
        gas: 5500000,           // Default gas limit
        confirmations: 1,       // # of confs to wait between deployments. (default: 0)
        timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
        skipDryRun: true       // Skip dry run before migrations? (default: false for public nets )
      }
    },
    mocha: {
      enableTimeouts: false,
      before_timeout: 240000 // Here is 2min but can be whatever timeout is suitable for you.
    },
    // Configure your compilers
    compilers: {
      solc: {
        version: "0.8.12",      // Fetch exact version from solc-bin (default: truffle's version)
        settings: {             // See the solidity docs for advice about optimization and evmVersion
          optimizer: {
            enabled: false,
            runs: 200
          }
        }
      }
    }
  };
}
