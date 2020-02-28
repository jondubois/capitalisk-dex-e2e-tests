const axios = require('axios');
const ChainCrypto = require('../chain-crypto');
const config = require('../config.json');

let chainCrypto = new ChainCrypto();

describe('Lisk DEX stress test', () => {
  let latestBlockTimestamp;

  beforeEach(async () => {
    let {data: {data: blocks}} = await axios.get(`${config.baseChain.hostURL}/api/blocks?limit=1`);
    latestBlockTimestamp = blocks[0].timestamp;
  });

  it('should ...', async () => {
    let txn = chainCrypto.prepareTransaction({
      amount: 110000000,
      recipientId: config.baseChain.dexWallet.address,
      timestamp: latestBlockTimestamp,
      message: 'test 2'
    }, config.baseChain.senderWallets[0].passphrase);

    let {data} = await axios.post(`${config.baseChain.hostURL}/api/transactions`, txn);
    console.log('RESULT', data);
  });
});
