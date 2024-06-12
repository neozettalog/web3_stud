// Import web3
const { Web3 } = require('web3');

var fs = require('fs');
var arrayPath = './abi.json';
var obj = JSON.parse(fs.readFileSync(arrayPath, 'utf8'));

const web3 = new Web3("https://evm-rpc.arctic-1.seinetwork.io");

const abi = obj;
const contractAddress = '0x506424296aFd0C28a8A94058EC08624Db52e8c5A';

// Create contract instance
const contract = new web3.eth.Contract(abi, contractAddress);

async function withdraw() {
    try {
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to call Owner method
async function getOwner() {
    try {
        const result = await contract.methods.owner().call();
        console.log('Owner Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getLatestBlock() {
    try {
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('Latest block number:', blockNumber);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getEstimateGas() {
    try {
        const estimateGas = await web3.eth.estimateGas();
        console.log('Estimate Gas:', estimateGas);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getAccount() {
    try {
        const account = await web3.eth.getAccounts();
        console.log('Account:', account);
    } catch (error) {
        console.error('Error:', error);
    }
}

// getLatestBlock();
// getOwner();
// getEstimateGas();
// getAccount();