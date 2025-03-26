/*//////////////////////////////////////////////////////////////////////////////
   factory2_orderview            
   注文表示のスクリプト                                     
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
  CheckReport,
  mcspec,
  mcplan
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
  toDaystr
} = require("./factory2_func");

var data = {
  retdata: []
}
getorderlist(data)
   .then(setproduct)
   .then(setdisable)
   

function getorderlist() {
  return  new Promise(function(res, rej) {


    var obj = { $and: [{disable: false},{endplan: false}] };

    csvdata.find(obj, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        console.log("docs:"+docs.length);
        data.retdata = docs;
        res(data);
      }
    }).sort({date: 1, modelname: 1}); 
   });       
}

function getmodellist(data) {
  return  new Promise(function(res, rej) {
    modellist.aggregate([
      {$group: { _id: { 
      _id: "$_id", 
      _modelname: "$modelname"  
      }}},
      { $project: {"value": "$_id._id", 
                   "text": "$_id._modelname", }},
      { $sort: {"text": 1} }
      ],
      function(err, docs) {   
         if(err) {
          console.log('err' + err);
            rej(console.log('workerid! '+err)); 
            throw err;
          } else {
            data.modellist = docs;
            res(data);  
          }   
    });
   });       
}

function setorderdata(data) {
  return new Promise(function (res, rej) {
    csvdata.updateOne({ _id: data.value._id }, 
      { $set: data.value }, { upsert: true }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
        }
        res(data);
    });
  })
}

function setproduct(data) {
  return new Promise(function (res, rej) {
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.retdata.length > 0) {
          data.retdata[i].checkqty = 0;
          data.retdata[i].shipmentqty = 0;
          CheckReport.aggregate([   
            { $match: { order_no: parseInt(data.retdata[i]._id) }}, 
            { $group: { _id: {"_production": "$production",
                              "_lotno": "$lotno",
                              "_lot_count": "$lot_count"
            },
            }}
          ],
            function(err, docs) {   
            if(err) {
                console.log('err' + err);
                rej(console.log('getholiday! '+err)); 
                throw err;
            }
            //console.log("length:" + JSON.stringify(docs));

            if (docs.length > 0) {
              docs.forEach((item, index) => {
                if (item._id._production==1) {
                  data.retdata[i].checkqty += item._id._lot_count;            
                }
                if (item._id._production==2) {
                  data.retdata[i].shipmentqty += item._id._lot_count;           
                }
              });
            }
            resolve(i + 1)
          });

        } else {
          resolve(i + 1);
        }
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


function setdisable(data) {
  return new Promise(function (res, rej) {
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.retdata.length > 0) {
          if (data.retdata[i].qty <= data.retdata[i].checkqty) {
              csvdata.updateOne({ _id: data.retdata[i]._id }, 
                { $set: { disable: true }}, { upsert: false }
                , function (err, result) {
                  if (err) {
                    rej(console.log('update! ' + err));
                  } else {
                  }
                  resolve(i + 1);
              });
            } else {
              resolve(i + 1);
            }  
        } else {
          resolve(i + 1);
        }
      })
        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            console.log("END")
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