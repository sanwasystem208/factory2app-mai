/*///////////////////////////////////////////////////////////////////////////////
 * xray_report Mitsuo Andou
////////////////////////////////////////////////////////////////////////////////*/
var http_port = 8003;

console.log('Version : 1.0');

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
  }    
);

var mclist = mongoose.model('mclists',McSchema);

var TaskSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    gouki:           { type: String, required: false }, 
    model:           { type: String, required: false }, 
    status:          { type: Number, min: 0, default: 0 }, 
    order:           { type: String, required: false }, 
    updatetime:      Date,
    ipaddress:       { type: String, required: false },
  }    
);

var tasklist = mongoose.model('tasklogs',TaskSchema);

////////////////////////////////////////////////////////////////////////////////
//
//                                MSSQL 
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

var config2 = {
  user: 'sa',
  password: '',
  server: '172.21.229.2',
  database: 'buhinSQL',
  connectionTimeout: 3000,
  requestTimeout: 3000,
  options: {
    tdsVersion: '7_1'
  },
  pool: {
   idleTimeoutMillis: 3000,
   max: 100
}
};

mssql.connect(config, function (err) { 
  console.log("SQL Start")
  if (err) {
     console.log("err main3:" + err);
  }
})

////////////////////////////////////////////////////////////////////////////////
//
//                                Node Start
//
////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var server = express();
var http = require('http').Server(server);

  // 追加
  
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

////////////////////////////////////////////////////////////////////////////////
//
//                              Socket IO
//
////////////////////////////////////////////////////////////////////////////////


const io = require('socket.io')(http);

io.on('connection', function(socket) {

    console.log("connect");

    socket.on('GET_MCLIST', function(data) {

      console.log("GET_MCLIST:" + JSON.stringify(data))  
      getmclist(data)
        .then(onSenddata, onRejected);

   });

   socket.on('SET_MCLIST', function(data) {
 
    setimportance2(data)
      .then(onSenddata, onRejected);

   });

   socket.on('EDIT_MCLIST', function(data) {
 
    setmclist(data)
      .then(getmclist)
      .then(onSenddata, onRejected);

   });

});

function onSenddata(data) {
  console.log("send!:" + JSON.stringify(data));
  io.sockets.emit(data.title, data)
}

/* エラー処理 ************************/ 
function onRejected(err) {
   console.log("err:" + err)
}  

////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

server.get('/getmclist', function(req, res){

  console.log("getmclist:" + JSON.stringify(req.query))

  getmclist(req.query)
    .then(onSenddata, onRejected);
 
      function onSenddata(data) {
         console.log('send2 '+ JSON.stringify(data));  
         res.header('Access-Control-Allow-Origin', '*');
         io.sockets.emit(data.title, data) 
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          res.send(err);
      } 
 
 });

server.post('/getmodel', function(req, res){
 
  console.log("getncname:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
    data.ipaddress = clientIp;

    getmodel(data)
       .then(onSenddata, onRejected);
 
      function onSenddata(data) {
         console.log('send2 '+ JSON.stringify(data));  
         res.header('Access-Control-Allow-Origin', '*'); 
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          res.send(err);
      } 
 
 });

 server.post('/setstatus', function(req, res){
 
  console.log("setstatus:" + JSON.stringify(req.body))

  console.log("recv2:" + JSON.stringify(req.body))

  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 

  var data = req.body;
 
  data.ipaddress = clientIp;
  data.updatetime = new Date();
  data._id = addId() + "-" + data.gouki;

  console.log("recv2:" + JSON.stringify(data))

    settask(data)
      .then(setstatus2)
     // .then(getmclist)
      .then(onSenddata, onRejected);
  //  res.send(data);
 /*
    getmodel(data)
       .then(onSenddata, onRejected);*/
 
      function onSenddata(data) {
         console.log('send3 '+ JSON.stringify(data));  
         res.header('Access-Control-Allow-Origin', '*'); 
         io.sockets.emit(data.title, data)
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          res.send(err);
      } 
 
 });

 server.post('/settask', function(req, res){
 
  console.log("settask:" + JSON.stringify(req.body))
 
  var data = req.body;

  data.ipaddress = clientIp;
  data.updatetime = new Date();
  data._id = makeid() + "-" + data.gouki;

  console.log("recv:" + JSON.stringify(data))

    setstatus(data)
       .then(settask)
       .then(getmclist)
       .then(onSenddata, onRejected);
 
      function onSenddata(data) {
         console.log('send2 '+ JSON.stringify(data));  
         res.header('Access-Control-Allow-Origin', '*'); 
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          res.send(err);
      } 
 
 });

 server.get('/settask', function(req, res){
 
  console.log("settask:" + JSON.stringify(req.query))
 
  var data = req.query;

    settask(data)
       .then(getmclist)
       .then(onSenddata, onRejected);
 
      function onSenddata(data) {
         console.log('send2 '+ JSON.stringify(data));  
         io.sockets.emit("RET_MCLIST", data)
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          res.send(err);
      } 
 
 });

//ポート起動///////////////////////////////////////  
http.listen(http_port, function(){
  console.log('listening on *:' + http_port);
});

process.on('exit', function (){
  console.log('SQL CLose!');
  mssql.close();

});

process.on('SIGINT', function() {
  console.log('End Process');
  process.exit();
});


function getmclist(data) {
  return new Promise(function(resolve, reject) { 
      mclist.find( {}, function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          data.mclist=docs
          resolve(data)   
      }); 
  });
}

function getmodel(data) {
  // ループ処理の完了を受け取るPromise
    return new Promise(function(resolve, reject) {
        var request = new mssql.Request();    
              var sqlstr="JST_製品名取得";
              request.input('ORDER', mssql.VarChar, data.id);      
              request.output('MODELNAME', mssql.VarChar);           
              request.execute(sqlstr, function(err, result){
                 if (err) {
                    reject(console.log("err " + err));
                 } else { 
                    console.log("result:" + JSON.stringify(result))  
                    if (result.output.MODELNAME==null || result.output.MODELNAME=="") {
                      data.model = "";
                      data.msg = data.id + " データ無";
                    } else {
                      data.model = result.output.MODELNAME;   
                      data.msg = data.id;                  
                    }               
                 }
                 resolve(data)  
           })     
  })
}


function setstatus(data) {
  return new Promise(function (res, rej) {
      mclist.updateOne({ _id: data.gouki }, 
        { $set: {     modelname : data.model,
                      status : parseInt(data.status),
                      updatetime : new Date(),} }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
            data.msg = "登録完了"
          }
          res(data);
        });
  })
}

function setstatus2(data) {
  return new Promise(function(resolve, reject) { 
     console.log("save!:" + JSON.stringify(data))
     mclist.findOneAndUpdate({ _id: data.gouki },
         {  modelname : data.model,
            status : parseInt(data.status),
            updatetime : new Date(),}
         ,{upsert: true, new: true },function(err,result){
// マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
            console.log("error " + err);
        } else {
          console.log("setstatus2:"+ JSON.stringify(result));
          data.mclist = result; 
          data.msg = "登録完了"     
          resolve(data);
        }
      }); 
  })
}

function setimportance2(data) {
  return new Promise(function(resolve, reject) { 
     console.log("save!:" + JSON.stringify(data))
     mclist.findOneAndUpdate({ _id: data._id },
         { importance : parseInt(data.importance), status : data.status }
         ,{upsert: true, new: true },function(err,result){
// マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
            console.log("error " + err);
        } else {
          console.log("setstatus2:"+ JSON.stringify(result));
          data.mclist = result;      
          data.msg = "登録完了"
          resolve(data);
        }
      }); 
  })
}

function settask(data) {
  return new Promise(function (res, rej) {
     tasklist.updateOne({ _id: data._id }, 
        { $set:  data }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
          //  console.log("update " + JSON.stringify(result));
          }
          res(data);
        });
  })
}

function setmclist(data) {
  return new Promise(function (res, rej) {
     mclist.updateOne({ _id: data._id }, 
        { $set:  data }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
          //  console.log("update " + JSON.stringify(result));
          }
          res(data);
        });
  })
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