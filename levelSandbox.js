/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const level = require('level');


class LevelSandbox{
  static initialize(dbName) {
    this.db = new level(dbName);
  }

  // Add data to levelDB with key/value pair
  static addLevelDBData(key,value){
    let self = this;
    return new Promise(function (resolve, reject) {
      self.db.put(key, value, function(err) {
        if (err) return reject(err);
        else
          resolve(key);
      })
    });
  }

// Get data from levelDB with key
  static getLevelDBData(key){
    let self = this;
    return new Promise(function (resolve, reject) {
      self.db.get(key, function(err, value) {
        if (err)
          reject(err);
        else
          resolve(value);
      })
    });
  }

// Add data to levelDB with value
  static addDataToLevelDB(value) {
    let i = 0;
    this.db.createReadStream().on('data', function(data) {
      i++;
    }).on('error', function(err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function() {
      console.log('Block #' + i);
      this.addLevelDBData(i, value);
    });
  }

  // get data count
  static getDataHeight(){
    let self = this;
    return new Promise(function (resolve, reject) {
      let height = -1;
      let error;
      let stream = self.db.createReadStream();
      stream.on('data', function (data) {
        height++;
      }).on('error', function (err) {
        error = err;
      }).on('close', function () {
        if(error)
          reject(error);
        else{
          resolve(height);
        }
      });
    });
  }

  // test code
  static getDataArray(){
    let self = this;
    let dataArray = [];
    return new Promise(function (resolve, reject) {
      let error;
      let stream = self.db.createReadStream();
      stream.on('data', function (data) {
        dataArray.push(data);
      }).on('error', function (err) {
        error = err;
      }).on('close', function () {
        if(error)
          reject(error);
        else{
          resolve(dataArray);
        }
      });
    });
  }
}

module.exports = LevelSandbox;
