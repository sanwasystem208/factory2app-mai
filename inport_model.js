////////////////////////////////////////////////////////////////////////////////
//                           orderview Mitsuo Andou                           //
// ver1.0 2022-06-02 初期立ち上げ
// ver1.1 2023-02-07 JST_注文情報の更新分だけ取得に変更   
// ver1.2 2023-02-14 更新のプロセス変更                                       //
////////////////////////////////////////////////////////////////////////////////

console.log('Version : 1.2');

require('date-utils');

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                MongoDB構成                                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://localhost/factory2',{ useNewUrlParser: true });
//メモのスキーマを宣言。
var ModelSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    modelid:    { type: Number, min: 0, default: 0 },
    modelname:  { type: String },
    typename:   { type: String },
  }
);

var modellist = mongoose.model('modellists', ModelSchema);

////////////////////////////////////////////////////////////////////////////////
//
//                                MS SQL Server
//
////////////////////////////////////////////////////////////////////////////////


var mssql = require("mssql");

var config = {
  user: 'sa',
  password: '',
  server: '172.21.229.200',
  database: 'hingiSQL',
  options: {
    tdsVersion: '7_1',
    encrypt:false
  }
};

function sqlstart(data) {
  return new Promise(function(resolve, reject) {
    mssql.connect(config, function (err) { 
      if(err) {
        // reject:エラー
        reject(console.log("Error-----2:"+err));
      } else { 
        console.log("SQL Start")
        resolve(data);
      }  
    });
  });
}

function sqlclose(data) {
  return new Promise(function(resolve, reject) {
    mssql.close();
  /*  fs.unlink(oldfile, (err) => {
      if (err) throw err;
      console.log('削除しました。');*/
      console.log('SQL CLose!');
      resolve(data)
 //   });
  });
}

function sqlclose2(err) {
  return new Promise(function(resolve, reject) {
    mssql.close();
  /*  fs.unlink(oldfile, (err) => {
      if (err) throw err;
      console.log('削除しました。');*/
      console.log(' Err SQL CLose!' + err);
      resolve(data)
 //   });
  });
}
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 実行関数                                   //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

var schedule = require('node-schedule');
//var j = schedule.scheduleJob('0 0,12 * * *', function(){

  console.log("start:"+addToday());

  getmodel()
    .then(setmodel);

//});


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 個別関数                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


function getmodel() {
  // ループ処理の完了を受け取るPromise
    return new Promise(function(resolve, reject) {
        mssql.connect(config, function (err) { 
            if(err) {
              // reject:エラー
              reject(console.log("Error-----2:"+err));
            } else { 
                var request = new mssql.Request();   
                    var sqlstr="JST_製品名_ALL";
                  //  request.input('ORDER', mssql.VarChar, data.order_no);             
                    request.execute(sqlstr, function(err, result){
                      //  console.log("sql2:" + JSON.stringify(result))
                        if (err) {
                            reject(console.log("err " + err));
                        }
                        var data = result.recordsets[0];
                     //   console.log("sql2:" + JSON.stringify(data))
                        mssql.close();
                        resolve(data)  
                })   
            }  
        });
    })
}


function setmodel(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (en > 0) {
/*
    _id:        { type: String, required: true },
    modelid:    { type: Number, min: 0, default: 0 },
    modelname:  { type: String, required: true },
    typename:   { type: String, required: true },
*/
          var dat = {
            _id:             data[i].code + "",
            model_id:        data[i].code,
            modelname:       data[i].model_name,
            typename:        data[i].品種,
          }

          console.log("loop:" + JSON.stringify(data[i]))

          modellist.find({ _id: dat._id }, function(err, docs) {
            if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('setassysn! '+err)); 
              throw err;
            } else {
              if (docs.length == 0) {
                var md = new modellist(dat);
                md.save(function(err){
                  if(err){ rej(err); }
                    resolve(i + 1);
                 }); 
              } else  {
                resolve(i + 1);        
              }  
            } 
        }); 

      //    var od = new orders(dat);
          //データベースに保存。
        /*   od.save(function(err){
             if(err){ rej(err); }
               resolve(i + 1);
            }); */
      /*      
          orders.updateOne({ _id: dat._id }, { $set: dat }, function (err, result) {
            if (err) {
              rej(console.log('ftasks! ' + err));
            } else {
              console.log("update " + JSON.stringify(result));
            }
            resolve(i + 1);
          });*/
        } else {
          resolve(i + 1);
        }
      })
        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            res(console.log("END" + data.length));

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
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 共通関数                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function toDoubleDigits(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
  return num;
};

function addDaystr2(str) {
  var date1 = new Date(str);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return year + "-" + month + "-" + day;

}

  function getDay3(date1) {

      // var date1 = new Date(str);
      //  date1.setDate(date1.getDate() + i);  
      //   var off = weekday_offset(date1)  
      //   date1.setDays(date1.getDays() + off); 
        // Date型を（YYYY/MM/DD）形式へ成型して返却
        var year = date1.getFullYear(); // 年
        var month = toDoubleDigits(date1.getMonth() + 1); // 月
        var day = toDoubleDigits(date1.getDate()); // 日
        var hour = toDoubleDigits(date1.getHours()); // 時
        var min = toDoubleDigits(date1.getMinutes()); // 分
        var sec = toDoubleDigits(date1.getSeconds()); // 秒   
        return  year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec; 
  }

  function addToday() {
    var date1 = new Date();
  
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = date1.getHours(); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
    return year + "-" + month + "-" + day + " " + hour + ":" + min;
  
  }