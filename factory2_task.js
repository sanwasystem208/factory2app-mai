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

var schedule = require('node-schedule');
var j = schedule.scheduleJob('0 10,12,14,16,18,20 * * *', function(){
  console.log("ver:1.0")
  console.log("schedule " + make_id());
 // getorderlist()
   // .then(getcheckcount)
   getcurrentpart()
    .then(getmoisturecount)

});

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 個別関数                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function getorderlist() {
  return  new Promise(function(res, rej) {
    CheckReport.aggregate([
       { $match: { $and: [ { daystr: getAddDay(new Date(), 0) }] } },
      // { $match: { $and: [ { production: 2 }] } },
        { $group: { _id: { _orderno: "$order_no"}
           }}],
        function(err, docs) {   
         if(err) {
           console.log('err' + err);
         //  reject(console.log('getendlist! '+err)); 
           throw err;
        } else {
          console.log('length! '+ docs.length);
          res(docs);   
        }  
     }); 
   });       
}


function getcheckcount(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.length > 0) {
            console.log('loop! ' + data[i]._id._orderno)

            CheckReport.aggregate([
              { $match: { $and: [ { order_no: data[i]._id._orderno }] } },
              { $group: { _id: { _orderno: "$order_no", _production: "$production" },
                          _sum: { $sum: "$lot_count"}
                 }}],
              function(err, docs) {   
               if(err) {
                 console.log('err' + err);
               //  reject(console.log('getendlist! '+err)); 
                 throw err;
              } else {
                if (docs.length > 0) {
                  var str = null;
                  if (docs[0].production==2) {
                    str = { checkqty: docs[0]._sum };
                  } else {
                    str = { shipmentqty: docs[0]._sum };
                  }

                  csvdata.updateOne({ _id: docs[0]._id._orderno }, 
                    { $set: str }, { upsert: false }
                    , function (err, result) {
                      if (err) {
                        reject(console.log('update! ' + err));
                      }
                      console.log('update! ' + JSON.stringify(str))
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


function getcurrentpart() {  
  return new Promise(function (resolve, reject) {
    var start = getStartDay(new Date(), 0);
    console.log("start:" + start)
    lotstock.find({ _id: { $regex: start, $options: "xi"} }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        console.log("TEST:"+docs.length)
        resolve(docs);
      }
    });
  });
}

function getmoisturecount(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.length > 0) {
           // console.log('loop! ' + data[i].ornerid)
            lotlog.aggregate([
              { $match: { $and: [ { ornerid: data[i].ornerid },{ mode: 4 }] } },
              { $group: { _id: { ornerid: "$ornerid" },
                          _sum: { $sum: 1}
                 }}],
              function(err, docs) {   
               if(err) {
                 console.log('err' + err);
               //  reject(console.log('getendlist! '+err)); 
                 throw err;
              } else {
                if (docs.length > 0) {
                  lotstock.updateOne({ _id: data[i]._id }, 
                    { $set: { moisture: docs[0]._sum } }, { upsert: false }
                    , function (err, result) {
                      if (err) {
                        reject(console.log('update! ' + err));
                      }
                      console.log("success:" + data[i].ornerid)
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
            res(console.log("END!moisture "));

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