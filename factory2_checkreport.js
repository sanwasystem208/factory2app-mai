/*//////////////////////////////////////////////////////////////////////////////
   factory2_checkreport            
   検査タブレットのスクリプト                                     
   ver1.0 2022-08-21 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8303;

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
//
//                                Node Start
//
////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var server = express();
var http = require('http').Server(server);

var bodyParser = require('body-parser')
  
  // app.use(express.json());
  server.use(bodyParser.json());
  // app.use(express.urlencoded({ extended: false }));
  server.use(bodyParser.urlencoded({ extended: false }));

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
  
  // 追加
  
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

/*//////////////////////////////////////////////////////////////////////////////
                                                                            
                                  Ajax関数                                   
                                                                            
//////////////////////////////////////////////////////////////////////////////*/

server.get('/getorder', function(req, res1){
  console.log('getworkerlavel_one ' + JSON.stringify(req.query));
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("getorder" + JSON.stringify(req.query));

  req.query.retdata.ipaddress = clientIp;
  req.query.ipaddress = clientIp;

  sqlstart(req.query)
    .then(getorder2)
    .then(sqlclose)  
    .then(getchecklog)
    .then(getlotprogress)
    .then(getcounttotal)
    .then(onSenddata, onRejected);

     function onSenddata(data) {
       console.log('send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  
         mssql.close();
         res1.send([]);
     }   
  
 });

 server.post('/setcheckreport', function(req, res1){
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("setcheckreport" + JSON.stringify(req.body));

  req.body.retdata.ipaddress = clientIp;
  req.body.ipaddress = clientIp;

  if (req.body.retdata.ngjudgment==null) {
    req.body.retdata.ngjudgment=0;
  }

  setcheckreport(req.body)
    .then(sqlstart)
    .then(getorder2)
    .then(sqlclose)  
    .then(getchecklog)
    .then(getlotprogress)
    .then(getcounttotal)
    .then(onSenddata, onRejected);

     function onSenddata(data) {
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  

         res1.send([]);
     }   
  
 });

 server.post('/setcheckreport_all', function(req, res1){

  setcheckreport(req.body)
    .then(getchecklog_all) 
    .then(onSenddata, onRejected);

     function onSenddata(data) {
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  

         res1.send([]);
     }   
  
 });

 server.get('/getcheckreport', function(req, res1){

  console.log("getcheckreport:" + JSON.stringify(req.query))

  getchecklog_all(req.query)
    .then(onSenddata, onRejected);

     function onSenddata(data) {
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
     function onRejected(err) {
       console.log('error '+err);  

         res1.send([]);
     }   
 });

 server.post('/delcheckreport', function(req, res1){

  console.log("delcheckreport:" + JSON.stringify(req.body))

  delcheckreport(req.body)
    .then(getchecklog_all) 
    .then(onSenddata, onRejected);

     function onSenddata(data) {
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  

         res1.send([]);
     }   
 });
////////////////////////////////////////////////////////////////////////////////
//
//                         　　　  個別関数                    
//
////////////////////////////////////////////////////////////////////////////////

function getorder2(data) {
  // ループ処理の完了を受け取るPromise
    return new Promise(function(resolve, reject) {
      csvdata.find({ _id: data.order_no }, function (err, docs) {
        if (err) {
          reject(err);
        } else {
          if (docs > 0) {
            data.retdata = docs;
          } else {
            data.retdata = [];
          }  
          resolve(data);
        }
      });
    });    
}

function setcheckreport(data) {
  return new Promise(function (res, rej) {
      CheckReport.updateOne({ _id: data.retdata._id }, 
        { $set: data.retdata }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          } else {
            data.msg = "登録完了"
          }
          res(data);
        });
  })
}

function getchecklog(data) {
   console.log('onSenddata '+ JSON.stringify(data.retdata));  

  if (data.retdata.daystr == undefined) {
    data.retdata.daystr = getAddDay(new Date(),0);
  }

  return new Promise(function (resolve, reject) {
    CheckReport.find({ daystr: data.daystr }, function (err, docs) {
      if (err) {
        reject(err);
      } else {
        data.checklogs = docs;
        resolve(data);
      }
    }).sort({ workday: -1});
  });
}

function getchecklog_all(data) {
  console.log('onSenddata '+ JSON.stringify(data.retdata));  

 return new Promise(function (resolve, reject) {
   CheckReport.find({ daystr: { $gte: data.start, $lte: data.last } }, function (err, docs) {
     if (err) {
       reject(err);
     } else {
       data.checklogs = docs;
       resolve(data);
     }
   }).sort({ workday: -1});
 });
}

function delcheckreport(data) {

  return new Promise(function (res, rej) {
        var lot = [];
        var en = data.logs.length - 1;
        function loop(i) {
          // 非同期処理なのでPromiseを利用
          return new Promise(function (resolve, reject) {
           if (data.logs.length > 0) {

            CheckReport.deleteOne({ _id: data.logs[i]._id }
              , function (err, result) {
                if (err) {
                  rej(console.log('ftasks! ' + err));
                } else {
               //   console.log("delete " + JSON.stringify(result));
                }
                resolve(i + 1); 
              });    

          } else  {
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

function getlotprogress(data) {

  return new Promise(function (resolve, reject) {

    CheckReport.aggregate([
      { $match: { order_no: parseInt(data.order_no) } },
      {
        $group: {
          _id: { _lotno: "$lotno"}
        }
      },
      {$project: {
        lotno: "$_id._lotno",
      }}
      ],
      function (err, docs) {
        if (err) {
          console.log('getworklog Error!');
          reject(console.log('getworklog! ' + err));
          throw err;
        } else {
              console.log("getlotprogress!" +  data.order_no + " " + JSON.stringify(docs));
          if (docs.length > 0) {
          //  console.log("times.aggregate!" + JSON.stringify(docs));
            //  console.log("times.aggregate2!" + Math.min.apply(0,docs._production));
            data.lots = docs;
          } else {
            data.lots = []
          }
        }
        resolve(data);
      });

  })
}

function getcounttotal(data) {

  return new Promise(function (resolve, reject) {

    CheckReport.aggregate([
      { $match: { order_no: parseInt(data.order_no) } },
      {
        $group: {
          _id: null,
          _sum: { $sum: "$lot_count"}
        }
      }
      ],
      function (err, docs) {
        if (err) {
          console.log('getworklog Error!');
          reject(console.log('getworklog! ' + err));
          throw err;
        } else {
          console.log('getcounttotal!' + JSON.stringify(docs)); 
          if (docs.length > 0) {
            data.total = docs[0]._sum;
          } else {
            data.total = 0;
          }
        }
        resolve(data);
      });

  })
}
