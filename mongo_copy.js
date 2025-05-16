/*///////////////////////////////////////////////////////////////////////////////
 * worklog_receiver Mitsuo Andou
 * ver1.0 2017-08-16 初期立ち上げ
 * ver1.1 2017-08-30 templistの文字数表示制限
 * ver1.2 2019-11-21 流動表枝番対応
 * ver1.3 2019-11-23 流動表枝番＋納期＋台数取り込み
 * ver1.4 2019-11-23 
 * ver1.5 2019-11-26
////////////////////////////////////////////////////////////////////////////////*/

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

console.log('Version : 1.6');

http_port = 8007;

require('date-utils');

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://localhost/factory2');
var db1 = mongoose.createConnection('mongodb://172.21.229.251/enegate',{useNewUrlParser: true, useUnifiedTopology: true});
//メモのスキーマを宣言。

//require('mongoose-double')(mongoose);
//メモのスキーマを宣言。

////////////////////////////////////////////////////////////////////////////////
//
//                              PostgreSQL構成
//
////////////////////////////////////////////////////////////////////////////////
/*
var pg = require("pg");
var conString = "pg://postgres:postgres@172.21.229.246:5432/worklogSQL";
var client = new pg.Client(conString);
client.connect();
*/

var timesSchema = new mongoose.Schema(
  {
     _id:        { type: String, required: true },
     timestr:     { type: String, required: true },
     flg    :     { type: Number, default: 0 },
     shift:     { type: Number, default: 0 },
     shiftstr:   { type: String, required: true }
  }
);

var times = db1.model('breaktimes',timesSchema);
var btimes = mongoose.model('breaktimes',timesSchema);

gettime()
   .then(settime)

function gettime() {  
  return new Promise(function (resolve, reject) {
    times.find({}, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        console.log("TEST:"+docs.length)
        resolve(docs);
      }
    }).sort({ _id: 1});
  });
}


function settime(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.length > 0) {

            var dat = {
                "_id" : data[i]._id,
                "timestr" : data[i].timestr,
                "shiftstr" : data[i].shiftstr,
                "shift" : data[i].shift,
                "flg" : data[i].flg,
            }

            btimes.updateOne({ _id: dat._id }, 
              { $set: dat }, { upsert: true }
              , function (err, result) {
                if (err) {
                  reject(console.log('update! ' + err));
                }
                resolve(i+1);   
            });
        } else {
          resolve(i+1);
        }
      })
        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            res(console.log("END!"));

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