let LevelSandbox = require("./levelSandbox");
/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const chainDB = './chaindata';

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
  constructor(data){
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    LevelSandbox.initialize(chainDB);
    // Verify if the Genesis Block is in the storage, if not you can add it.
    let height = -1;
    let self = this;
    this.getBlockHeight().then(function (height) {
      if(height == -1){
        self.addBlock(new Block("First block in the chain - Genesis block"));
      }
    });
  }

  // Get block height
  getBlockHeight(){
      return LevelSandbox.getDataHeight();
  }

  addBlock(newBlock){
    return this.getBlockHeight().then((height)=>{
      // Block height
      newBlock.height = parseInt(height, 10) + 1;
      // UTC timestamp
      newBlock.time = new Date().getTime().toString().slice(0,-3);
      if(height >= 0){
        return LevelSandbox.getLevelDBData(height);
      }
    }).then(function (preBlockJson) {
      // previous block hash
      if ( typeof preBlockJson !== 'undefined' && preBlockJson ){
        console.log(preBlockJson);
        let preBlock = JSON.parse(preBlockJson);
        newBlock.previousBlockHash = preBlock.hash;
      }

      // Block hash with SHA256 using newBlock and converting to a string
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      // Adding block object to chain
      return LevelSandbox.addLevelDBData(parseInt(newBlock.height, 10), JSON.stringify(newBlock));
    });
  }

  // get block
  getBlock(blockHeight){
    // return object as a single string
    return LevelSandbox.getLevelDBData(blockHeight);
  }

  // validate block
  validateBlock(blockHeight){
    return this.getBlock(blockHeight).then(function (blockJson) {
      // get block object
      let block = JSON.parse(blockJson);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      return new Promise(function (resolve) {
        // Compare
        if (blockHash === validBlockHash) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  validatePreHash(blockHeight){
    let self = this;
    return self.getBlock(blockHeight).then(function (blockJson) {
      let block = JSON.parse(blockJson);
      return new Promise(function (resolve) {
        resolve(block);
      });
    }).then(function (block) {
      let blockHash = block.hash;
      return self.getBlock(blockHeight + 1).then(function (blockJson) {
        let previousHash  = JSON.parse(blockJson).previousBlockHash;
        return new Promise(function (resolve) {
          if (blockHash!==previousHash) {
            resolve(false);
          }else{
            resolve(true);
          }
        });
      });
    });
  }

  // Validate blockchain
  validateChain(){
    let self = this;
    return LevelSandbox.getDataHeight().then(function (height) {
      let promiseList = [];
      for(var i = 0; i < height; i++){
          promiseList.push(self.validateBlock(i));
          promiseList.push(self.validatePreHash(i));
      }
      promiseList.push(self.validateBlock(height));
      Promise.all(promiseList).then(function (values) {
        console.log(values);
      })
    });
  }
}

let myBlockChain = new Blockchain();
(function theLoop (i) {
  setTimeout(function () {
    let blockTest = new Block("Test Block - " + (i + 1));
    myBlockChain.addBlock(blockTest).then((result) => {
      console.log(result);
      i++;
      if (i < 10) theLoop(i);
    });
  }, 10000);
})(0);