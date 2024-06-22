const { Transaction, Receipt } = require('../models');
const config = require('../configs/config');
const { Web3 } = require('web3');
const sequelize = require('../database/db.js');

//read file
var fs = require('fs');
var arrayPath = '../abi.json';

//web3
const web3 = new Web3(config.network);
var abi = JSON.parse(fs.readFileSync(arrayPath, 'utf8'));
const contract = new web3.eth.Contract(abi, config.contract.contract_address);

function bigintReplacer(value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

//Find pending/processing transactions
async function findAllTransactions() {
    try {
        const transactions_data =
            await Transaction.findAll({
                where: {
                    status: 'PROCESSING',
                    is_delete: 0,
                },
            }).catch((error) => {
                console.error('Failed to retrieve data : ', error);
            });

        return transactions_data;
    } catch (error) {
        throw new Error(`Error finding transactions: ${error.message}`);
    }
}

//Recursive function
async function processor(reentry = 0) {
    try {
        const transactions = await findAllTransactions();
        console.log("Reentry on ", reentry, " times.")
        console.log("=================================")

        // this length could also be eliminate, because when no data, just dont care and for loop wont run also, 
        // so its fine no need to do if else here,
        // this can also eliminate the redundant setTimeout.
        // and the call processor() part should also just put outside of try catch, just do it once. 
        if (transactions.length === 0) {
            setTimeout(async function () {
                processor(reentry + 1);
            }, 10000)
        } else {
            for (const transact of transactions) {
                const transaction = await sequelize.transaction();

                //STEP 1. WITHDRAW
                const id = transact.id
                const token = config.contract.token_address;
                const receiver = transact.transfer_address
                const amount = web3.utils.toWei(transact.amount.toString(), 'ether');

                console.log("Transact ID : ", transact.id)
                const tx_data = contract.methods.withdraw(id, token, receiver, amount).encodeABI();
                const nonce = await web3.eth.getTransactionCount(config.wallet.account);

                //STEP 2. SIGN TRANSACTION
                const tx = {
                    from: config.wallet.account,
                    to: config.contract.contract_address,
                    gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
                    gasLimit: web3.utils.toHex(2300000),
                    nonce: nonce,
                    data: tx_data
                };
                const signed_tx = await web3.eth.accounts.signTransaction(tx, config.wallet.private_key);

                //STEP 3. SEND SIGNED TRANSACTION
                try {  //this try catch should be in the "on receipt". Technically, we could have just eliminate on receipt,
                    //instead get the txHash and go to getTransaction / getReceipt to ensure everything, and do it in while loop
                    const receipt = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
                        .on('receipt', async receipt => {
                            console.log("Receipt Data : ", receipt);
                            console.log("=================================")
                            var epochtime = Math.floor(new Date().getTime() / 1000)

                            //STEP 3.1 Update Transaction Table, Completed
                            const updateTransactStatus = await Transaction.update({ status: "COMPLETED", updated_at: epochtime, }, {
                                where: {
                                    id: transact.id,
                                },
                                transaction: transaction
                            });

                            //STEP 3.2 Insert new record to Receipt Table with the TransactionID
                            const logs_json = JSON.stringify(receipt.logs, bigintReplacer);
                            await Receipt.create({
                                transaction_id: transact.id,
                                block_hash: receipt.blockHash,
                                block_number: receipt.blockNumber,
                                cumulative_gas_used: receipt.cumulativeGasUsed,
                                effective_gas_price: receipt.effectiveGasPrice,
                                sender_address: receipt.from,
                                gas_used: receipt.gasUsed,
                                logs: logs_json,
                                status: receipt.status,
                                receiver_address: receipt.to,
                                transaction_hash: receipt.transactionHash,
                                transaction_index: receipt.transactionIndex,
                                type: receipt.type,
                                created_at: epochtime,
                                updated_at: epochtime,
                                is_delete: 0,
                            }, { transaction: transaction });

                            await transaction.commit();
                        })
                    console.log("========================= Finished Cycle ============================")
                } catch (error) {
                    if (transaction) await transaction.rollback();
                    if (error.code.toString() == '429') { //Rate Limit
                        const retryAfter = 60 //seconds
                        setTimeout(() => {
                            processor(reentry + 1);
                        }, retryAfter * 1000);
                        break;
                    }
                    else {
                        console.error("Error in sending Signed Transaction : ", error);
                        console.log("=================================")
                        var epochtime = Math.floor(new Date().getTime() / 1000)
                        let fallbackTransaction;

                        //STEP 3.1 Update Transaction Table, Completed
                        try {
                            fallbackTransaction = await sequelize.transaction();
                            const update_transact_status = await Transaction.update({ status: "FAILED", updated_at: epochtime }, {
                                where: {
                                    id: transact.id,
                                },
                                transaction: fallbackTransaction
                            });
                            console.log(update_transact_status);
                            await fallbackTransaction.commit();
                        } catch (error) {
                            await fallbackTransaction.rollback();
                        }
                        console.log(`Transaction${transact.id} status updated to FAILED.`);
                        continue;
                    }
                }
            }

            //STEP 4 Reentry function
            setTimeout(function () {
                processor(reentry + 1);
            }, 5000)
        }
    } catch (error) {
        console.error(`Error encountered: ${error.message}`);
        console.log("=================================")
        setTimeout(function () {
            processor(reentry + 1);
        }, 10000)
    }
}


//this main in theory only run once, we might as well just run the proccessor() straight away.
async function main() {
    try {
        processor();
    } catch (error) {
        console.error(`Error encountered in main: ${error.message}. Reentry starting in 10 seconds`);
        setTimeout(async function () {
            console.log('================= Reentry Restarted ==================')
            processor();
        }, 10000)
    }
}

main()




































// const transactions = await findAllTransactions();
// if (transactions.length === 0) {
//     console.log("No data");
// } else {
//     console.log(JSON.stringify(transactions, null, 2));
// }



// const receipt_data =
//     await Receipt.findAll({
//         where: {
//             is_delete: 0,
//         },
//     }).catch((error) => {
//         console.error('Failed to retrieve data : ', error);
//     });
// console.log("All Receipt Data : ", JSON.stringify(receipt_data, null, 2));


// else if (error.code.toString() == '402') {
//     console.error("Error in sending Signed Transaction : ", error);
//     continue;
// }

// Unnecessary variable, Maybe?
// const account = config.wallet.account;
// const private_key = config.wallet.private_key;
// const abi = obj;
// const contract_address = config.contract.contract_address;

//PM2 - Logging
//Transaction Commit and Transaction Rollback MySQL Sequelize
//BalanceOf need to be token address not Contract Address
//Config in JSON format
//Research on ABI of ERC-20 Token, instead of our Smart Contract Token