const config = require('../configs/config');
const { Web3 } = require('web3');

const web3 = new Web3(config.network);

async function transferToWallet(to_address) {
    try {
        const tx = {
            from: config.wallet.account,
            to: to_address,
            gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
            gasLimit: web3.utils.toHex(2300000),
            value: web3.utils.toWei('0.01', 'ether'),
        };

        const signed_tx = await web3.eth.accounts.signTransaction(tx, config.wallet.private_key);

        await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
            .on('receipt', async receipt => {
                console.log(receipt);
            });
    } catch (error) {
        console.error("Error Encountered : ", error)
    }
}

async function main() {
    transferToWallet(config.wallet.test_to_account);
}

main();







































// const amount = web3.utils.toWei('0.01', 'ether');

// const account = config.wallet.account;
// const to_wallet_address = config.wallet.test_to_account;
// const private_key = config.wallet.private_key;