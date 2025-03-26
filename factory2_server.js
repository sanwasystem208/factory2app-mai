/******************************************************************************** 
 * factory2_server
 * Mitsuo Andou
 * ver1.0 2024-06-28 初期立ち上げ
 ********************************************************************************/

console.log("ver: 1.0");

var http_port = 8300;

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://172.21.229.250/planinfo');
//メモのスキーマを宣言。

//作業者情報/////////////////////////////////////// 
var WorkerSchema = new mongoose.Schema(
    {
      _id:             { type: String, required: true },
      workerid:         { type: Number, min: 0, default: 0 },
      workername:       { type: String, required: true },
      password:       { type: String, required: true },
      managementlevel:  { type: Number, min: 0, default: 0 }  
    }    
  );
  
  var workers = mongoose.model('workers',WorkerSchema);

//HTML　Start/////////////////////////////////////// 
var express = require('express');
var server = express();
var http = require('http').Server(server);
var router = express.Router();

// index.htmlから読み込まれている静的ファイルを送れるようにしておく
server.use(express.static(__dirname+"/dist"));

server.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html'); 
});

server.get('/getworkerlavel', function(req, res){

    console.log("getworker:" + JSON.stringify(req.query))

    getworker(req.query)
              .then(onSenddata, onRejected);

    function getworker(data) {
        return new Promise(function(resolve, reject) { 

            workers.find({ workerid: parseInt(data.workerid) }, function(err, docs) {
                if(err) {
                // console.log('func_workid_update Error!');
                reject(console.log('setassysn! '+err)); 
                throw err;
                }
                resolve(docs)   
            }); 

        });
    }

    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
  //    console.log('onSenddata '+data); 
      res.send(data);
    }

    function onRejected(err) {
      res.send(err);
    }
      
});

// サーバーをポート3000番で起動
http.listen(http_port, function(){
    console.log('listening on *:'+http_port);
});
 
