const config = require('../configs/config');
const { Web3 } = require('web3');

//read file
var fs = require('fs');
var arrayPath = '../web3_stud/erc-20-abi.json';
var abi = JSON.parse(fs.readFileSync(arrayPath, 'utf8'));

//web3
const web3 = new Web3(config.network);

function getNative(address) {
    web3.eth.getBalance(address)
        .then(balance => {
            console.log('Native SEI Balance:', web3.utils.fromWei(balance, 'ether'));
            return web3.utils.fromWei(balance, 'ether').toString();
        })
        .catch(error => {
            console.error('Error fetching native balance:', error);
        });
}

function getERC20Token(tokenAddress, address) {
    const contract = new web3.eth.Contract(abi, tokenAddress);
    contract.methods.balanceOf(address).call()
        .then(balance => {
            console.log('ERC-20 Token Balance:', web3.utils.fromWei(balance, 'ether'));
            return web3.utils.fromWei(balance, 'ether').toString();
        })
        .catch(error => {
            console.error('Error fetching token balance:', error);
        });
}

async function getCompleteNative() {
    try {
        const nativeBalance = await web3.eth.getBalance(config.contract.token_address);

        const formattedBalance = parseFloat(web3.utils.fromWei(nativeBalance, 'ether')).toFixed(1);
        return formattedBalance
    } catch (error) {
        return null
    }

}

async function getCompleteERC20() {
    try {
        const contract = new web3.eth.Contract(abi, config.contract.token_address);
        const erc20balance = await contract.methods.balanceOf(config.contract.contract_address).call()
        const formattedBalance = parseFloat(web3.utils.fromWei(erc20balance, 'ether')).toFixed(1);

        return formattedBalance;
    } catch (error) {
        return null
    }

}

module.exports = {
    getCompleteNative,
    getCompleteERC20,
}

















// getNative(config.contract.contract_address);
// getERC20Token(config.contract.token_address, config.contract.contract_address);






// getERC20TokenTotalSupply(token_address);

// const wallet_address = config.wallet.account;
// const test_wallet_address = config.wallet.test_to_account;
// const token_address = config.contract.token_address;
// const contract_address = config.contract.contract_address;

// function getERC20TokenTotalSupply(address) {
//     const contract = new web3.eth.Contract(abi, address);
//     contract.methods.totalSupply().call()
//         .then(totalSupply => {
//             console.log('Total Supply:', web3.utils.fromWei(totalSupply, 'ether'), "XCOIN");
//             return web3.utils.fromWei(totalSupply, 'ether');
//         })
//         .catch(error => {
//             console.error('Error fetching total supply:', error);
//         });
// }

//Pass in wallet or contract address
// getNative(config.contract.contract_address);
//Pass in wallet or contract address, but token address remain for retrieve ERC-20 (this case XCOIN)
// getERC20Token(config.contract.token_address, config.contract.contract_address);