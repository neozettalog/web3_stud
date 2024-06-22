const config = require('../configs/config');
const { Web3 } = require('web3');
// const abi_data = require('../erc-20-abi.json');
const abi_data = require('../erc-20-abi.json');

const web3 = new Web3(config.network);

async function transferWithApprove() {
    try {
        const contract = new web3.eth.Contract(abi_data, config.contract.new_contract_address);
        web3.eth.accounts.wallet.add("0x" + config.approve_transfer.account_3_private_key);
        const amount_transfer = web3.utils.toWei('10', 'ether');


        // const allowance_receipt = await contract.methods.allowance(config.approve_transfer.account_3, config.contract.token_address).call();
        // if (allowance_receipt !== undefined) {
        //     console.log(allowance_receipt);
        // }
        // const approve_receipt = await contract.methods.approve(config.wallet.test_account, amount_transfer)
        //     .send({
        //         from: config.wallet.test_account,
        //         gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
        //         gasLimit: web3.utils.toHex(2300000),
        //     });
        // console.log(approve_receipt);
        // //start transfer
        // if (approve_receipt !== undefined) {
        // const transfer_receipt = await contract.methods.transfer(config.contract.token_address, amount_transfer).send({ from: config.wallet.test_account })
        // console.log(transfer_receipt);
        // }
    } catch (error) {
        console.log(error);
    }
}


transferWithApprove();