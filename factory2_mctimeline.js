/*//////////////////////////////////////////////////////////////////////////////
   factory2_partlist            
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ                                              
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
  mcplan,
  mctask,
  holidays,
  mcspec,
  mcdays,
  mctimeline
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
  addSaveDay,
  gettoday,
  today_start,
  today_last,
  toDaystr
} = require("./factory2_func");


var data = {
  count: 44640,
  mclist: []
}


////////////////////////////////////////////////////////////////////////////////
//
//                              実行関数
//
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//
//                              専用関数
//
////////////////////////////////////////////////////////////////////////////////

gettimeline()
  .then(starttimeline)

async function starttimeline(rec) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  for (  var i = 2;  i < 32;  i++  ) {
     var dat = await refrashDaylist(rec,i);
  }
 // console.log("partsetDaylist last")
  return dat
}
/*
async function refrashDaylist(day) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  var dd = day + "0:00:00"
  console.log("refrashDaylist:" + dd);
  for (  var r = 0;  r < 288;  r++  ) {
     var mm = r * 5;
     var tt = addDayTimestr(dd,mm)
     console.log("time:" + tt);
     var dat = await settimeline(tt);

  }
 // console.log("partsetDaylist last")
  return data
}
*/

function refrashDaylist(rec, r) {
  // ループ処理の完了を受け取るPrormise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = rec.length -1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {

          var dat = {
            _id: toDoubleDigits(r) + " " + rec[i].timestr,
            daystr: "",
            day: r,
            timestr: rec[i].timestr,
            status: 0,
            plan: 0,
            product: 0
          }    
          mctimeline.updateOne({ _id: dat._id }, 
            { $set: dat }, { upsert: true }
            , function (err, result) {
              if (err) {
                rej(console.log('update! ' + err));
              } else {
              }
              resolve(i + 1); 
          });

      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
              console.log("end")
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

function gettDay(day, i) {
  let date = new Date(day);
  date.setDate(date.getDate() + i);
  var year = date.getFullYear(); // 年
  var month = toDoubleDigits(date.getMonth() + 1); // 月
  var day = toDoubleDigits(date.getDate()); // 日
  var dd = year + "-" + month + "-" + day;

  return dd; 
}

function addDayTimestr(dd, i) {
  var date1 = new Date(dd);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  date1.setMinutes(date1.getMinutes() + i);
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  day + " " + hour + ":" + min; 
}

function settimeline(data) {
  return new Promise(function (res, rej) {
  
    var dat = {
      _id: data,
      daystr: "",
      day: parseInt(data.split(" ")[0]),
      timestr: data.split(" ")[1],
      status: 0,
      plan: 0,
      product: 0
    }

    mctimeline.updateOne({ _id: dat._id }, 
      { $set: dat }, { upsert: true }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
        }
        res(data);
    });
  })
}

function gettimeline(data) {  
  return new Promise(function (resolve, reject) {
    mctimeline.find({}, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}