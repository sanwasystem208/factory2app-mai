/*//////////////////////////////////////////////////////////////////////////////
   factory2_parttable           
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ                                        
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8309;

console.log("ver:1.0");

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

var {  
  partlist,
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

////////////////////////////////////////////////////////////////////////////////
//
//                                Express構成
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


server.post('/getparttable', function (req, res) {
  var data = req.body;
  console.log("getparttable:" + JSON.stringify(data));
  getparttable(data)
  .then((result) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.send(result)
  })
  .catch((err) => {
    console.log("error:" + JSON.stringify(err))
    res.send(err)
  })
})


////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

function getparttable(data) {
  return new Promise(function (res, rej) {
    partlist.find({}, function(err, result){
      if (err) {
        console.log("エラー", err);
      } else {
        res(result); //エラーでなければ処理を抜ける
      }
    });
  })
}
