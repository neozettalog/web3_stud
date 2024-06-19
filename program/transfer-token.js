const config = require('../configs/config');
const { Web3 } = require('web3');

var fs = require('fs');
var arrayPath = '../erc-20-abi.json';
var abi = JSON.parse(fs.readFileSync(arrayPath, 'utf8'));

const web3 = new Web3(config.network);

//Goal from Test Account send ERC-20 Token to Main Account
async function transferTokenToWallet() {
    try {
        const nonce = await web3.eth.getTransactionCount(config.wallet.test_to_accounts);

        const contract = new web3.eth.Contract(abi, config.contract.token_address);
        web3.eth.accounts.wallet.add("0x" + config.wallet.test_account_private_key);

        contract.methods.transfer(config.wallet.account, web3.utils.toWei('0.1', 'ether')).send({ from: config.wallet.test_to_account })
            .on('transactionHash', (hash) => {
                console.log('Transfer TX Hash:', hash);
                console.log('Tokens transferred successfully.');
            })
            .catch((error) => {
                console.error('Error transferring tokens:', error);
            });

        // contract.methods.allowance(test_wallet_address, token_address).call()
        //     .then(async (allowance) => {
        //         //check how much token contract allow to send on behalf of sender
        //         console.log('Current Allowance:', allowance);
        //         if (allowance < amount) {
        //             //Less than amount, so approve first before transfer
        //             //allowing another address to spend a specific amount of token on behalf of the owner.
        //             // const approveData = contract.methods.approve(test_wallet_address, amount).encodeABI();
        //             contract.methods.approve(test_wallet_address, amount)
        //                 .send({
        //                     from: test_wallet_address,
        //                     gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
        //                     gasLimit: web3.utils.toHex(2300000),
        //                 })
        //                 .on('receipt', (receipt) => {
        //                     console.log('Approval Transaction Receipt:', receipt);
        //                 })
        //         } else {
        //             //More than amount, mean got sufficient amount to spend, so proceed transfer
        //             console.log('Came in here');
        //         }
        //     })

    } catch (error) {
        console.error('Error encountered:', error);
    }
}

async function main() {
    transferTokenToWallet();
}

main();





































// const wallet_address = config.wallet.account;
// const test_wallet_address = config.wallet.test_to_account;
// const token_address = config.contract.token_address;
// const private_key = config.wallet.private_key;
// const test_account_private_key = config.wallet.test_account_private_key;