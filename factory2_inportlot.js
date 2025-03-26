/*///////////////////////////////////////////////////////////////////////////////
 * factory2_handy Mitsuo Andou
 ver1.0 2024-06-30 新規作成
////////////////////////////////////////////////////////////////////////////////*/
var http_port = 8301;

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

var {  
  modellist,
  lotlist,
  lotlog
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
  toSevenDigits
} = require("./factory2_func");

////////////////////////////////////////////////////////////////////////////////
//
//                                MSSQL 
//
////////////////////////////////////////////////////////////////////////////////


var mssql = require("mssql");

var config = {
  user: 'user',
  password: 'SSPDB_user',
  server: '172.21.229.192',
  database: 'ZKO',
  options: {
    tdsVersion: '7_1',
    encrypt:false
  }
};


////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

select_lot()
  .then(setlot)

function select_lot() {
  // 成功:resolve 失敗:reject
  return new Promise(function(resolve, reject) {
     // DB接続
     mssql.connect(config, function(err) {
        var request = new mssql.Request();
        // SQL発行  ↓  err = [Connection is closed.]  接続出来ない
        // request.query('SELECT * FROM testDB.dbo.SampleTB;', function(err, recordset) {
        request.query("SELECT * FROM ZKO_NKO;", function(err, recordset) {
         //  console.log("Error-----:"+err);
       //  console.log(JSON.stringify(recordset.recordsets[0]));
           // 結果
         //  console.log("return: " + JSON.stringify(recordset))
           if (recordset.recordsets[0].length == 0) {
           // if (0 == 0) {
              // reject:データ無し
              reject(console.log('データ無し ' + err));
           } else {
              if(err) {
                 // reject:エラー
                 reject(console.log("Error-----2:"+err));
              } else {
                 // resolve:次は追加
                 resolve(recordset.recordsets[0]);
                 // resolve('0');
              }
           }
           // 閉じる
            mssql.close();
        });
     });
  });
}


function setlot(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (en > 0) {

          var lot = data[i].LotNo;
          var modelid = data[i].BuhinCode;
          var qty = ('0000000' + data[i].IriSu).slice(-7);
          var x = lot + "          ";
          var worker = data[i].UpdTantoID;
          var dat = {
            _id:        data[i].KanriNo,
            modelid:    modelid,
            modelname:  null,
            workerid:   worker,
            workername: null,
            oldid:      data[i].KanriNo,
            qty:        parseInt(qty), 
            lot:        lot, 
            stock:      parseInt(qty), 
            lotend:     0,
            daystr:     null,
          }

          modellist.find({ _id: modelid }, function(err, docs) {
            if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('setassysn! '+err)); 
              throw err;
            } else {
              if (docs.length > 0) {
                 dat.modelname = docs[0].modelname;       
              } 
                lotlist.updateOne({ _id: dat._id }, 
                  { $set: dat }, { upsert: true }
                  , function (err, result) {
                    if (err) {
                      rej(console.log('update! ' + err));
                    } else {
                      data.msg = "登録完了"
                    }
                    resolve(i + 1);
                  }); 
            } 
        }); 

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