const config = require('../configs/config');
const { Web3 } = require('web3');
const abi_data = require('../abi-approve.json');
const abi_approve_data = require('../erc-20-abi.json');

const web3 = new Web3(config.network);

async function transferWithApprove() {
    try {
        const contract = new web3.eth.Contract(abi_data, config.contract.new_contract_address);
        const contract_approve = new web3.eth.Contract(abi_approve_data, config.contract.token_address);
        web3.eth.accounts.wallet.add("0x" + config.approve_transfer.account_3_private_key);

        //Approve 
        const approve_receipt = await contract_approve.methods.approve(
            config.contract.new_contract_address,
            web3.utils.toWei('0.01', 'ether')
        ).send({
            from: config.approve_transfer.account_3,
            gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
            gasLimit: web3.utils.toHex(2300000),
        });
        console.log('Approve Receipt:', approve_receipt);

        //Donate
        const donate_receipt = await contract.methods.donate(
            config.contract.token_address,
            web3.utils.toWei('0.01', 'ether')
        ).send({
            from: config.approve_transfer.account_3,
            gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
            gasLimit: web3.utils.toHex(2300000),
        });
        console.log('Donate Receipt:', donate_receipt);
    } catch (error) {
        console.log(error);
    }
}


transferWithApprove();
