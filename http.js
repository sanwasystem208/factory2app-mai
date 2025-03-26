/******************************************************************************** 
 * factory2_server
 * Mitsuo Andou
 * ver1.0 2024-06-28 初期立ち上げ
 ********************************************************************************/
///

console.log("ver: 1.0");

var http_port = 8300;

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

// サーバーをポート3000番で起動
http.listen(http_port, function(){
    console.log('listening on *:'+http_port);
});
 