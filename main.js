const Sequelize = require("sequelize");
const sequelize = new Sequelize(
 'web3_test_db',
 'root',
 '12345',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
  },
);

const Transaction = sequelize.define("transaction", {
  id: {
    type: Sequelize.DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_hash: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: true
  },
  contract_address: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  transfer_from_address: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  transfer_address: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  amount: {
    type: Sequelize.DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  created_at: {
    type: Sequelize.DataTypes.INTEGER, // INT
    allowNull: false
  },
  updated_at: {
    type: Sequelize.DataTypes.INTEGER, // INT
    allowNull: false
  },
  is_delete: {
    type: Sequelize.DataTypes.TINYINT,
    allowNull: false
  }
}, {
  timestamps: false  // Disable createdAt and updatedAt
});

sequelize.authenticate()
    .then(() => console.log('Successfully connected to `web3_test_db`!'))
    .catch((error) => console.log('Failed to connect `web3_test_db`:', error))

const { Web3 } = require('web3');

var fs = require('fs');
var arrayPath = './abi.json';
var obj = JSON.parse(fs.readFileSync(arrayPath, 'utf8'));

const web3 = new Web3("https://evm-rpc.arctic-1.seinetwork.io");

const account = '0xA56F15CdDf8183DB31F7F150287Fd8213A426A45';
const privateKey = '445b41e93a2fbf818a17a4282cac7de521bbd765ed7c4070dd7695ac6b635aba'; 

const abi = obj;
const contractAddress = '0x506424296aFd0C28a8A94058EC08624Db52e8c5A';

const contract = new web3.eth.Contract(abi, contractAddress);

setInterval(async () => { 
  //run queue / transactions
  // const result = await sequelize.query('SELECT * FROM transactions WHERE status = $status AND is_delete = $is_delete', {
  //   bind: { status: "processing", is_delete: 0 },
  //   type: Sequelize.QueryTypes.SELECT,
  // });
  // console.log(result);

  sequelize.sync().then(async () => {
    const transactionsData = await Transaction.findAll(
      // {
      //   where: {
      //     status: 'processing',
      //     is_delete: 0,
      //   },
      // }
  ).catch((error) => {
        console.error('Failed to retrieve data : ', error);
    });

    if (transactionsData.length === 0) {
      console.log('No transactions found.');
    } else {
      // console.log('All transactions:', JSON.stringify(transactionsData, null, 2));
      // console.log('==========================================');

      //LOOP THROUGH RECORDS THAT ARE IN "PROCESSING" STATUS
      for (const transact of transactionsData) {  
        console.log(`ID ${transact.id} with Status : ${transact.status}, Withdrawal Amount : ${transact.amount}`)
        console.log('----------------')


        //STARTING HERE
        //TODO : PROCEED TO WITHDRAW >> SIGN TRANSACTION >> SEND SIGN TRANSACTION
        //TODO : HANDLE ANY ERROR scenerio 

        //AFTER PROCESS SEND SIGN TRANSACTION
        //TODO : SEND SIGN TRANSACTION SUCCESS >> UPDATE DB


        //STEP 1. WITHDRAW
        const id = transact.id
        const token = '0x99c845DE7F67398dA6710bbD47d76A81746C1949';
        const receiver = transact.transfer_address
        const amount = web3.utils.toWei(transact.amount.toString(), 'ether');

        const txData = contract.methods.withdraw(id, token, receiver, amount).encodeABI();
        const nonce = await web3.eth.getTransactionCount(account);

        
        //STEP 2. SIGN TRANSACTION
        const tx = {
          from: account,
          to: contractAddress,
          gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
          gasLimit: web3.utils.toHex(2300000),
          nonce: nonce,
          data: txData
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        

        //STEP 3. SEND SIGNED TRANSACTION
        // - if success / receipt >> UPDATE DB status to COMPLETED, do it in "RECEIPT" status
        // - if error >> UPDATE DB status to FAILED, probably in try catch, probably added on more column for storing error type


        


      }
      console.log('------------------------END--------------------------')
    }
  }).catch((error) => {
      console.error('Unable to create table : ', error);
  });
}, 8000); 




// setTimeout(async function () {
//   // const transactionDetails = await web3.eth.getTransaction("0xcc7136d6bbe5bcd024215b656bd9f467d55c3c69fdd8a10d027b658403ef6453");
//   // console.log(transactionDetails);
//   const smartContractBalance = await web3.eth.getBalance("0x99c845DE7F67398dA6710bbD47d76A81746C1949");
//   console.log(smartContractBalance);
// }, 2000)

// (async () => {
//   const id = 9998;
//   const token = '0x99c845DE7F67398dA6710bbD47d76A81746C1949';
//   const receiver = '0xf614b9b2883CE942f684532D2744495696944F3E';
//   const amount = web3.utils.toWei('0.1', 'ether');

//   const txData = contract.methods.withdraw(id, token, receiver, amount).encodeABI();

//   console.log(txData);
//   console.log("======================")

//   const nonce = await web3.eth.getTransactionCount(account);
//   console.log(nonce);

//   const tx = {
//     from: account,
//     to: contractAddress,
//     // value: web3.utils.toWei('0.2', 'ether'),
//     gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
//     gasLimit: web3.utils.toHex(2300000),
//     nonce: nonce,
//     data: txData
//   };

//   // Sign transaction
//   const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

//   console.log(signedTx);
//   // setTimeout(async function () {
//   //   const transactionDetails = await web3.eth.getTransaction(signedTx.transactionHash);
//   //   console.log(transactionDetails);
//   // }, 5000)

//   // Send transaction
//   const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//   .on('sending', transactionToBeSent => console.log("Transaction To Be Sent: ",transactionToBeSent))
//   .on('sent', sentTransaction => console.log("Sent Transaction: ",sentTransaction))
//   .on('transactionHash', transactionHash => console.log("Transaction Hash: ", transactionHash))
//   .on('receipt', receipt => console.log("Receipt: ", receipt))
//   .catch(console.error);
  
//   // Save transaction receipt to DB for record keeping
//   console.log(receipt);
// })();