/*//////////////////////////////////////////////////////////////////////////////
   factory2_task            
   検査数を2時間ごとにcsvdataに反映                                     
   ver1.0 2024-08-21 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

var {  
  modellist,
  lotlist,
  lotlog,
  setting,
  lotstock,
  inventlog,
  csvdata,
  CheckReport
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

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                               スケジュール                                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


   getlotstock()
    .then(setstartday)
 

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 個別関数                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function getlotstock() {
  return  new Promise(function(res, rej) {
     lotstock.aggregate([
       { $match: { $and: [ { month: "2025-03-01" }] } },
      // { $match: { $and: [ { production: 2 }] } },
        { $group: { _id: { _id: "$_id",
                           _ornerid: "$ornerid",
                           _month: "$month"
        }
           }}],
        function(err, docs) {   
         if(err) {
           console.log('err' + err);
         //  reject(console.log('getendlist! '+err)); 
           throw err;
        } else {
          res(docs);   
        }  
     }); 
   });       
}


function setstartday(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.length > 0) {
 
            lotlog.aggregate([
              { $match: { $and: [ { mode: 5 }, { ornerid: data[i]._id._ornerid }, { daystr: { $gt: getAddDay(data[i]._id._month, -10), $lt: getAddDay(data[i]._id._month, 10 ) } }] }},
              { $group: { _id: { _update_time: "$update_time" }
                 }}],
              function(err, docs) {   
               if(err) {
                 console.log('err' + err);
               //  reject(console.log('getendlist! '+err)); 
                 throw err;
              } else {
                if (docs.length > 0) {
 
                  lotstock.updateOne({ _id: data[i]._id._id }, 
                    { $set: { start: docs[0]._id._update_time } }, { upsert: false }
                    , function (err, result) {
                      if (err) {
                        reject(console.log('update! ' + err));
                      }
                      console.log('update! ' + JSON.stringify(result))
                      resolve(i+1);   
                    });
                } else {
                  resolve(i+1);   
                }
              }  
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
