/*//////////////////////////////////////////////////////////////////////////////
   factory2_partlist            
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8308;

console.log("ver:1.1")

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
  mcgrid,
  btimes,
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
  getshortday
} = require("./factory2_func");

////////////////////////////////////////////////////////////////////////////////
//
//                                ライブラリ
//
////////////////////////////////////////////////////////////////////////////////

const math = require('mathjs');
const clone = require('lodash/clone');
const clonedeep = require('lodash/cloneDeep');


////////////////////////////////////////////////////////////////////////////////
//
//                                Express構成
//
////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var server = express();
var http = require('http').Server(server);

  var bodyParser = require('body-parser');

  
  //server.use(express.urlencoded({ extended: true, limit: '10mb' }));
  // app.use(express.json());
  server.use(bodyParser.json());
  // app.use(express.urlencoded({ extended: false }));
  server.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));

  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    next();
  });
  
   // Optionsも必要
   server.options('*', (req, res) => {
    res.sendStatus(200);
  });

  // app.use(express.json());
  server.use(bodyParser.json());
  // app.use(express.urlencoded({ extended: false }));
  server.use(bodyParser.urlencoded({ extended: false }));

// index.htmlから読み込まれている静的ファイルを送れるようにしておく
server.use(express.static(__dirname));

 //ポート起動///////////////////////////////////////  
 http.listen(http_port, function(){
  console.log('listening on *:' + http_port);
});

////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

  server.get('/getchecklist', function (req, res) {

    console.log("getchecklist:"+JSON.stringify(req.query));

    getchecklist(req.query)
       .then(getcsvinfo)
       .then(onSenddata,onRejected)

    function onSenddata(data) {
     // console.log("send:" + data.plandata.length)
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  })

////////////////////////////////////////////////////////////////////////////////
//
//                              Script関数
//
////////////////////////////////////////////////////////////////////////////////
  

  function getchecklist(data) {
    return  new Promise(function(res, rej) { 
      var obj = { $and: [{daystr: { $gte: data.start, $lte: data.last }}] };

      var arr = [];
      if (data.filterstr != "" && data.filterstr != null) {
         arr.push({ modelname: { $regex: data.filterstr, $options: "xi"}});
         arr.push({ _id: { $regex: data.filterstr, $options: "xi"}});       
      } 
  
      if (arr.length > 0){
        //console.log("getorderdata--str1-- :" + JSON.stringify(arr));  
        var tmp2 = { $or: arr};
       // obj = Object.assign(obj, tmp2);
         obj["$and"].push(tmp2);
      }

      CheckReport.aggregate([
        {$match: obj },
        {$group: { _id: { _orderno: "$order_no",
                          _qty: "$qty",
                          _modelname: "$modelname",
                          _qty: "$qty"
                        },
                        _sum: { $sum: "$lot_count" }
        }},
        { $project: {"orderno": "$_id._orderno",              
                     "modelname": "$_id._modelname", 
                     "qty": "$_id._qty",
                     "sum": "$_sum",
                     "price": "0",
                     "totalprice": "0"
                    }},
        { $sort: {"orderno": 1, } }
        ],
        function(err, docs) {   
           if(err) {
            console.log('err' + err);
              rej(console.log('workerid! '+err)); 
              throw err;
            } else {
              data.retdata = docs;
              res(data);  
            }   
        });
     });       
  }

  
function getcsvinfo(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.retdata.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.retdata.length > 0){
          //  console.log("loop: " + data.retdata[i].orderno)
            csvdata.find( { _id: data.retdata[i].orderno + "" }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                if (docs.length > 0) {
                //  console.log("loop: " + docs[0].price + " " + data.retdata[i].sum)
                  var price = docs[0].price;
                  data.retdata[i].price = price;
                 // console.log("loop: " + price) 
                  data.retdata[i].totalprice = price * data.retdata[i].sum ;
                 // data.retdata[i].totalprice = sum;
                } else {
                  data.retdata[i].price = 0;
                  data.retdata[i].totalprice = 0;
                }
                resolve(i + 1); 
           });
        } else {
          resolve(i + 1); 
        }   
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            //console.log("getcsvinfo:" + data.retdata.length)
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
