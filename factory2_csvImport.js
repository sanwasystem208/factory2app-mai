/*///////////////////////////////////////////////////////////////////////////////
var:1.0 2024-07-05 新規作成
var:1.1 2024-07-12 日付をデータベースに追加
var:1.2 2024-08-08 MongoDB model名変更 modelList⇒modellist, orderCSV⇒csvdata
var:1.3 2024-08-21 update中止, checkqty追加
///////////////////////////////////////////////////////////////////////////////*/
console.log("var:1.3")
/*///////////////////////////////////////////////////////////////////////////////

                           MongoDB構成

///////////////////////////////////////////////////////////////////////////////*/

var {  
    modellist,
    lotlist,
    lotlog,
    setting,
    lotstock,
    inventlog,
    csvdata
  } = require("./factory2_mongo");

  ////////////////////////////////////////////////////////////////////////////////
//
//                                共通関数
//
////////////////////////////////////////////////////////////////////////////////

var {  
    toDoubleDigits,
    getAddDay,
    getId,
    make_datetime,
    addDaystr,
    make_id,
    addMonth,
    manualUppercase,
    isNumber,
    kanji_comp,
    addDayTimestr,
    addSaveDay,
    gettoday,
    today_start,
    today_last,
    toDaystr,
    getStartDay
  } = require("./factory2_func");
/*///////////////////////////////////////////////////////////////////////////////

                           ファイル監視

///////////////////////////////////////////////////////////////////////////////*/

var csv = require("ya-csv");
var chokidar = require("chokidar");
var fs = require('fs');

var watcher = chokidar.watch("/home/datafile", { //watch対象ディレクトリorファイル
ignored: /[\/\\]\./,  //無視する対象
persistent:true,      //監視を継続するかどうか,
  ignoreInitial:true,
  usePolling: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  },
})  

var oldfile ="";
 
watcher.on('ready', function() { console.log("監視開始"); })
.on('all', function(path) {
//console.log("全体-> " + path); 
})
.on('add', function(path,stats) {  //ファイルが追加された場合
  oldfile = path;   
  console.log("追加ファイル-> " + path); 
  if (path.indexOf("外注加工依頼書") != -1) {//ファイルに外注加工依頼書がついているか確認
    console.log(path + " " +  new Date());   
    file_inport(path)
    .then(setmodel)
    .then(setdata)
    .then(fileDelete)
  }
  if (path.indexOf("ordercsv") != -1) {//ファイルに外注加工依頼書がついているか確認
    console.log(path + " " +  new Date());   
    file_inports(path)
    .then(setmodels)
    .then(fileDelete)
  }   
})

.on('addDir', function(path) { console.log("追加ディレクトリ-> " + path); }) // デレクトリが追加された場合
.on('unlink', function(path) { console.log("削除されました-> " + path); })   // ファイルが削除された場合
.on('unlinkDir', function(path) { console.log("削除されました-> " + path); })// ファイルが更新された場合
.on('change', function(path,stats) { console.log("修正されました-> " + path); })  
.on('error', function(error) { console.log("エラーです-> " + error); })// エラーの発生

/*///////////////////////////////////////////////////////////////////////////////

                           CSVの読み取り(上部データ)

///////////////////////////////////////////////////////////////////////////////*/

// CSVの読み取り
function file_inport(info) {
  console.log(" file_inport !"); 
  return new Promise(function(resolve, reject) { 
    var reader = csv.createCsvFileReader(info);
    var data = [];
    reader.on('data', function(record) {
      data.push(record);
    }).on('end', function(err) {
      if (err) { 
        reject("fileload_err " + err)
      } else {
        if (data.length > 0) { 
          var arry = data;
          var logs=[]; 
          var len = arry.length;
          for(var i = 0; i < len; i++ ) {                  
            var currentrow = arry[i];
            if (currentrow[5] != undefined ) {
              var intid = parseInt(currentrow[0])
              var row = ({ 
                _id:       intid.toString(),
                modelid:   currentrow[1],
                modelname: currentrow[2],
                qty:       parseInt(currentrow[3]),              
                date:      currentrow[4],
                price:     currentrow[5],
                destination: currentrow[6]
              }); 
              logs.push(row); 
            }  
          }
          resolve(logs);    
        } else {
          console.log("データなしエラー")
          resolve([]);            
        }
      }
    });
  });
}

function file_inports(info) {
  console.log(" file_inports !"); 
  return new Promise(function(resolve, reject) { 
    var reader = csv.createCsvFileReader(info);
    var data = [];
    reader.on('data', function(record) {
      data.push(record);
    }).on('end', function(err) {
      if (err) { 
        reject("fileload_err " +err)
      } else {
        if (data.length > 0) { 
          var arry = data;
          var ordercsvlogs=[]; 
          var len = arry.length;
          for(var i = 2; i < len; i++ ) {                  
            var currentrow = arry[i];
            if (currentrow[5] != undefined ) {
              var intid = parseInt(currentrow[0])
              var row = ({ 
                _id:       intid.toString(),
                modelid:   currentrow[4],
                modelname: currentrow[5],
                qty:       parseInt(currentrow[1]),              
                date:      currentrow[3]
              }); 
              ordercsvlogs.push(row); 
            }  
          }
          console.log(ordercsvlogs)
          resolve(ordercsvlogs);    
        }
      }
    });
  });
}

/*///////////////////////////////////////////////////////////////////////////////

                           データベース登録(csvData)

///////////////////////////////////////////////////////////////////////////////*/

function setdata(logs) {//CSVデータを受け取って関数実行
  return new Promise(function(res, rej) {
     // ループ処理（再帰的に呼び出し）
     var en = logs.length-1;
     function loop(i) {
       // 非同期処理なのでPromiseを利用
       return new Promise(function(resolve, reject) {
        if (logs.length > 0) {
          csvdata.find({ _id: logs[i]._id }, function (err, docs) {
            if (err) {
              reject(err)
            } else {
              if (docs.length == 0) {
                var intid = parseInt(logs[i]._id)
                var oc = {
                  _id: intid.toString(),
                  qty: logs[i].qty,
                  modelid: logs[i].modelid,
                  modelname: logs[i].modelname,
                  date: logs[i].date,
                  update_time: addDayTimestr(new Date()),
                  price: logs[i].price ,
                  shipmentqty: 0,
                  checkqty: 0,
                  destination: logs[i].destination,
                  endplan: false,
                  disable: false,
                  makeinstruct: false,
                  makeinstruct2: false,
                  makeinstruct3: false,
                }

                var ml = new csvdata(oc);
                ml.save(function(err){//データベースに保存。
                  if(err){ reject(resolve(i+1));}   
                    resolve(i+1);
                });


              } else {
                var intid = parseInt(logs[i]._id)
                csvdata.updateOne({ _id: intid.toString() }, 
                  { $set: { price: logs[i].price, destination: logs[i].destination } }, { upsert: false }
                  , function (err, result) {
                    if (err) {
                      rej(console.log('update! ' + err));
                    }
                    resolve(i+1) 
                });
              }   
            }    
          });    
        } else {
          resolve(i + 1);
        }       
     }).then(function(count) {
         // ループを抜けるかどうかの判定
         if (count > en) {
           // 抜ける（外側のPromiseのresolve判定を実行）
               res(logs);
         } else {
           // 再帰的に実行
           loop(count);
         }
       });
     }
     // 初回実行
     loop(0);
 })
}

function fileDelete(data) {//CSVデータを受け取って関数実行
    return new Promise(function(res, rej) {
      fs.unlink('/home/datafile/外注加工依頼書408072.csv', (err) => {
        if (err) {
        console.log(err);
        } else {
          console.log("削除完了");
          res(data)
        }
     });
   })
  }

/*///////////////////////////////////////////////////////////////////////////////

                           データベース登録(modelList)

///////////////////////////////////////////////////////////////////////////////*/

function setmodel(logs) {//CSVデータを受け取って関数実行
  return new Promise(function(res, rej) {// ループ処理の完了を受け取るPromise
    // ループ処理（再帰的に呼び出し）
    var en = logs.length-1;
    function loop(i) {
      return new Promise(function(resolve, reject) {// 非同期処理なのでPromiseを利用
        if (logs.length > 0) { 
          modellist.find({ _id: logs[i].modelid }, function (err, docs) {
            if (err) {
              reject(err)
            } else {
              if (docs.length == 0) {
                var intid = parseInt(logs[i]._id)
                var dat = {
                  _id: intid.toString(),
                  modelid: logs[i].modelid,
                  modelname: logs[i].modelname,
                }
                var ml = new modelList(dat);
                ml.save(function(err){//データベースに保存。
                  if(err){ resolve(resolve(i+1));}   
                  resolve(i+1) 
                });
              } else {
                resolve(i+1) 
              } 
            }    
          });    
        } else {
          res(i + 1);
        }
      }).then(function(count) {
        // ループを抜けるかどうかの判定
        if (count > en) {
          res(logs);
        } else {
          // 再帰的に実行
          loop(count);
        }
      });
    }
    // 初回実行
    loop(0);
  })
}
function setmodels(ordercsvlogs) {//CSVデータを受け取って関数実行
  return new Promise(function(res, rej) {// ループ処理の完了を受け取るPromise
    // ループ処理（再帰的に呼び出し）
    var en = ordercsvlogs.length-1;
    function loop(i) {
      return new Promise(function(resolve, reject) {// 非同期処理なのでPromiseを利用
        if (ordercsvlogs.length > 0) { 
          modellist.find({ _id: ordercsvlogs[i].modelid }, function (err, docs) {
            if (err) {
              reject(err)
            } else {
              if (docs.length == 0) {
                var dat = {
                  _id: ordercsvlogs[i].modelid,
                  modelid: ordercsvlogs[i].modelid,
                  modelname: ordercsvlogs[i].modelname
                }
                var ml = new modellist(dat);
                ml.save(function(err){//データベースに保存。
                  if(err){ reject(resolve(i+1));}   
                  resolve(i+1) 
                });
              } else {
                resolve(i+1) 
              } 
            }    
          });    
        } else {
          res(i + 1);
        }
      }).then(function(count) {
        // ループを抜けるかどうかの判定
        if (count > en) {
          res(ordercsvlogs);
        } else {
          // 再帰的に実行
          loop(count);
        }
      });
    }
    // 初回実行
    loop(0);
  })
}
/*///////////////////////////////////////////////////////////////////////////////

                          共通関数



function addid() {
var date1 = new Date();

// Date型を（YYYY/MM/DD）形式へ成型して返却
var year = date1.getFullYear(); // 年
var month = toDoubleDigits(date1.getMonth() + 1); // 月
var day = toDoubleDigits(date1.getDate()); // 日
var hour = toDoubleDigits(date1.getHours()); // 時
var min = toDoubleDigits(date1.getMinutes()); // 分
var sec = toDoubleDigits(date1.getSeconds()); // 秒 

return  year + month + day + "-" + hour + min + sec; 
}

var toDoubleDigits = function(num) {
num += "";
if (num.length === 1) {
 num = "0" + num;
}
return num;     
};
///////////////////////////////////////////////////////////////////////////////*/