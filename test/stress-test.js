const axios = require('axios');
const ChainCrypto = require('../chain-crypto');
const config = require('../config.json');

const ORDER_ROUNDS = 15;

// Full blocks
const ORDERS_PER_ROUND = 25;

const MIN_QUOTE_PRICE = .01;
const MAX_QUOTE_PRICE = .1;
const ORDER_AMOUNT_QUOTE = 1000000000;

const ORDER_AMOUNT_BASE = 1000000000;

let chainCrypto = new ChainCrypto();

describe('Lisk DEX stress test', () => {

  it('should send orders to the DEX address on the blockchain', async () => {
    console.log('------- Start sending orders');

    for (let i = 0; i < ORDER_ROUNDS; i++) {
      let lastBlock = await getLastBlock();
      let lastBlockTimestamp = lastBlock.timestamp;

      for (let j = 0; j < ORDERS_PER_ROUND; j++) {
        let price = (Math.random() * (MAX_QUOTE_PRICE - MIN_QUOTE_PRICE) + MIN_QUOTE_PRICE).toFixed(2);
        let orderIndex = (i * ORDERS_PER_ROUND) + j;
        let askTxn = chainCrypto.prepareTransaction(
          {
            amount: ORDER_AMOUNT_QUOTE + orderIndex,
            recipientId: config.quoteChain.dexWallet.address,
            timestamp: lastBlockTimestamp + 1,
            message: `${config.baseChain.symbol},limit,${price},${config.baseChain.userWallets[0].address}`
          },
          config.quoteChain.userWallets[0].passphrase
        );
        console.log(`Sending quote chain order ${orderIndex}:`, askTxn);
        try {
          let {data} = await axios.post(`${config.quoteChain.hostURL}/api/transactions`, askTxn);
          console.log(`Quote chain order ${orderIndex} result:`, data);
        } catch (error) {
          console.error(`Quote chain failed to post order ${orderIndex}:`, error);
        }
      }

      let bidTxn = chainCrypto.prepareTransaction(
        {
          amount: ORDER_AMOUNT_BASE + i,
          recipientId: config.baseChain.dexWallet.address,
          timestamp: lastBlockTimestamp + 1,
          message: `${config.quoteChain.symbol},market,${config.quoteChain.userWallets[0].address}`
        },
        config.baseChain.userWallets[0].passphrase
      );
      console.log(`Sending base chain order ${i}:`, bidTxn);
      try {
        let {data} = await axios.post(`${config.baseChain.hostURL}/api/transactions`, bidTxn);
        console.log(`Base chain order ${i} result:`, data);
      } catch (error) {
        console.error(`Base chain failed to post order ${i}:`, error);
      }

      await wait(10000);
    }
    console.log('------- Done sending orders');
  });
});

async function getLastBlock() {
  let {data: {data: blocks}} = await axios.get(`${config.quoteChain.hostURL}/api/blocks?limit=1`);
  return blocks[0];
}

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
