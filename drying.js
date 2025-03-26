/*///////////////////////////////////////////////////////////////////////////////
 * xray_report Mitsuo Andou
////////////////////////////////////////////////////////////////////////////////*/
var http_port = 8006;

require('date-utils');

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://localhost/factory2');
//メモのスキーマを宣言。
//require('mongoose-currency').loadType(mongoose);
//var Currency = mongoose.Types.Currency;

//require('mongoose-double')(mongoose);
//メモのスキーマを宣言。
var SchemaTypes = mongoose.Schema.Types;

var McSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    type:            { type: Number, min: 0, default: 0 }, 
    mcno:            { type: Number, min: 0, default: 0 }, 
    modelname:       { type: String, required: false }, 
    status:          { type: Number, min: 0, default: 0 }, 
    updatetime:      Date,
    boardpos:        { type: Number, min: 0, default: 0 },
    importance:      { type: Number, min: 0, default: 0 },
    mcname:       { type: String, required: false }, 
    timedata:        []
  }    
);

var mclist = mongoose.model('mclists',McSchema);

/*
var TaskSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    gouki:           { type: String, required: false }, 
    model:           { type: String, required: false }, 
    status:          { type: Number, min: 0, default: 0 }, 
    status_name :    { type: String, required: false }, 
    order:           { type: String, required: false }, 
    updatetime:      Date,
    ipaddress:       { type: String, required: false },
    starttime:       { type: String, required: false },
    lasttime:       { type: String, required: false }
  }    
);
*/
var TaskSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    machineid:   { type: Number, min: 0, default: 0 },
    machinename: { type: String, required: true },
    workerid:    { type: Number, default: 0 },
    workername:  { type: String, required: true },
    modelname:   { type: String, required: true },
    productno:   { type: String, required: true },
    lotpice:     { type: Number, default: 0 },
    lotno:       { type: Number, default: 0 },
    catno:       { type: String, required: true },  
    qty:         { type: Number, default: 0 },
    lotno2:      { type: String, required: true },  
    qrcode1:     { type: String, required: true }, 
    qrcode2:     { type: String, required: true },
    mcname:      { type: String, required: true }, 
    timestr:     { type: String, required: true }, 
    flg:         { type: Number, default: 0 },
    status:      { type: Number, default: 0 },
    color:       { type: String, required: true },
  }    
);
var tasklist2 = mongoose.model('task2logs',TaskSchema);

var ReportSchema = new mongoose.Schema(
  {
    _id:           { type: String, required: true },
    machine:       { type: String, required: false },
    model:         {},
    start:         { type: String, required: false },
    last:          { type: String, required: false }, 
    daystr:        { type: String, required: false },
    rank:          { type: Number, min: 0, default: 0 },
    comment:       { type: String, required: false },
    lotno:         { type: Number, min: 0, default: 0 },
    plancount:     { type: Number, min: 0, default: 0 },
    productcount:  { type: Number, min: 0, default: 0 },
    productno:     { type: String, required: false },
    productpice:   { type: Number, min: 0, default: 0 },
    modelno:       { type: String, required: false },
    tasklog:        []
  }    
);

var report1 = mongoose.model('reportdatas',ReportSchema);

var DryingSchema = new mongoose.Schema(
    {
      _id:             { type: String, required: true },
      worker:          { type: String, required: true },
      humidityTime:    { type: String, required: true },  
      startTime:       { type: String, required: true },
      finishTime:      { type: String, required: true },    
      productName:     { type: String, required: true },
      lot:             { type: String, required: true },
    }    
  );  
  
  var Drying = mongoose.model('dryingdatas',DryingSchema);

////////////////////////////////////////////////////////////////////////////////
//
//                                Node Start
//
////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var server = express();
var http = require('http').Server(server);

  // 追加
  
var bodyParser = require('body-parser');
//const { mixin } = require('vue/types/umd');
  
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

////////////////////////////////////////////////////////////////////////////////
//
//                              SQL Server
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
        console.log("SQL Start")
        workflg = true;
        if(err) {
          // reject:エラー
          reject(console.log("Error-----2:"+err));
        } else { 
  
        }  
         resolve(data);
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
   //   });
      resolve(data)
    });
  }

////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

server.get('/getdryinglist', function(req, res1){

  console.log("getdryinglist:" + JSON.stringify(req.query));

  sqlstart(req.query)
     .then(getdryinglist)
     .then(setmodelname)
     .then(sqlclose)
     .then(onSenddata, onRejected);

     function onSenddata(data) {
      //  console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }

     function onRejected(err) {
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

//ポート起動///////////////////////////////////////  
http.listen(http_port, function(){
  console.log('listening on *:' + http_port);
});

/*///////////////////////////////////////////////
                    専用関数
///////////////////////////////////////////////*/

function getdryinglist(data) {
  return new Promise(function(resolve, reject) { 
      Drying.find({ _id: { $regex: data.start, $options: "xi"}}, function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          data.retdata=docs
          resolve(data)   
      }).sort({mcname: 1}); 
  });
}

function setmodelname(data) {
    // ループ処理の完了を受け取るPromise  
   return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.retdata.length-1; 
  
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
 
        //console.log("loop:" + data.retdata[i].productName)
        data.retdata[i].modelName = "";

        if (data.retdata[i].productName != undefined) {
          if (data.retdata[i].productName.length == 8) {
        //  console.log("work--" + data.customer + " " + JSON.stringify(data.retdata[i]))
            var request = new mssql.Request();
            var sqlstr="JST_製品名取得_3"; 
            request.input('ORDER', mssql.VarChar, data.retdata[i].productName);
            request.output('MODELNAME', mssql.VarChar);               
            request.execute(sqlstr, function(err, result){
                    if (err) {
                    rej(console.log("err " + err));
                    } else { 
                      if (result.output.MODELNAME != null) {
                        data.retdata[i].modelName = result.output.MODELNAME;
                      }
                      console.log("work:" +  result.output.MODELNAME);
                    }
                resolve(i + 1);
            }) 
          } else {
            resolve(i + 1);
         }  
       } else {
          resolve(i + 1);
       }  
     
        })       
        .then(function(count) {
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

function compare( a, b ){
  var r = 0;
  if( a.text < b.text ){ r = -1; }
  else if( a.text > b.text ){ r = 1; }

  return r;
}

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function addDaystr(str) {
   var date1 = new Date(str);

    // Date型を（YYYY/MM/DD）形式へ成型して返却
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日
   var hour = toDoubleDigits(date1.getHours()); // 時
   var min = toDoubleDigits(date1.getMinutes()); // 分
   var sec = toDoubleDigits(date1.getSeconds()); // 秒 

   return  day + "-" + month + "-" + year + " " + hour + ":" + min + ":" + sec; 

}

function addId() {
  var date1 = new Date();

   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  year + month + day + hour + min + sec; 

}

function ganttDay(str) {
  var date1 = new Date(str);

   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  day + "-" + month + "-" + year; 

}

function getDay(str) {
  var date1 = new Date(str);

   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  year + "-" + month + "-" + day; 

}

function makeid() {
  var date = new Date();
   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date.getFullYear(); // 年
  var month = date.getMonth() + 1; // 月
  var day = date.getDate(); // 日
  var hour = date.getHours(); // 時
  var min = date.getMinutes(); // 分
  var sec = date.getSeconds(); // 秒 

  return  year +  month + day + hour + min + sec; 
}


function getDay3(str,i) {
     var date1 = new Date(str);
     date1.setDate(date1.getDate() + i);  
   //   var off = weekday_offset(date1)  
   //   date1.setDays(date1.getDays() + off); 
      // Date型を（YYYY/MM/DD）形式へ成型して返却
     var year = date1.getFullYear(); // 年
     var month = toDoubleDigits(date1.getMonth() + 1); // 月
     var day = toDoubleDigits(date1.getDate()); // 日 
     return  year + "-" + month + "-" + day; 
}

   function getId(str) {
    var date1 = new Date(str); 
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日  
    return  year + month + day; 
  }

function gettime(str,i) {
    var date1 = new Date(str);
    date1.setMinutes(date1.getMinutes() + i);  

    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
    return  year + "-" + month + "-" + day + " " + hour + ":" + min; 
}

function gettime2(str) {
  var date1 = new Date(str);

  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  hour + min; 
}