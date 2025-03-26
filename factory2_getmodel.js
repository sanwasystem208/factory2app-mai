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
  
  getmodel()
     .then(getmodelpin)

  function getmodel() {  
    return new Promise(function (resolve, reject) {
      modellist.find({}, function (err, docs) {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

  
function getmodelpin(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        console.log( data[i]._id + "," + data[i].modelname + "," + data[i].pin)
        resolve(i + 1);
      })
        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            res(data);
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