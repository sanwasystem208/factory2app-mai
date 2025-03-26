/*///////////////////////////////////////////////////////////////////////////////
 * worklog_receiver Mitsuo Andou
 * ver1.0 2017-08-16 初期立ち上げ
 * ver1.1 2017-08-30 templistの文字数表示制限
 * ver1.2 2019-11-21 流動表枝番対応
 * ver1.3 2019-11-23 流動表枝番＋納期＋台数取り込み
 * ver1.4 2019-11-23 
 * ver1.5 2019-11-26
////////////////////////////////////////////////////////////////////////////////*/

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

console.log('Version : 1.6');

http_port = 8007;

require('date-utils');

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://localhost/factory2');
var db1 = mongoose.createConnection('mongodb://172.21.229.250/planinfo',{useNewUrlParser: true, useUnifiedTopology: true});
//メモのスキーマを宣言。

//require('mongoose-double')(mongoose);
//メモのスキーマを宣言。

var McSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    type:            { type: Number, min: 0, default: 0 }, 
    mcno:            { type: Number, min: 0, default: 0 }, 
    modelname:       { type: String, required: false }, 
    mcname:          { type: String, required: false }, 
    status:          { type: Number, min: 0, default: 0 }, 
    updatetime:      Date,
    boardpos:        { type: Number, min: 0, default: 0 },
    importance:      { type: Number, min: 0, default: 0 },

  }    
);

var mclist = mongoose.model('mclists',McSchema);

var WorkerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    workerid: { type: Number, min: 0, default: 0 },
    workername: { type: String, required: true },
    password: { type: String, required: true },
    managementlevel: { type: Number, min: 0, default: 0 }
  }
);

var workers = db1.model('workers', WorkerSchema);

var TaskSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    machineid:   { type: Number, min: 0, default: 0 },
    machinename: { type: String, required: true },
    workerid:    { type: Number, default: 0 },
    workername:  { type: String, required: true },
    modelname:   { type: String, required: true },
    mcname:      { type: String, required: true },
    productno:   { type: String, required: true },
    lotpice:     { type: Number, default: 0 },
    lotno:       { type: Number, default: 0 },
    catno:       { type: String, required: true },  
    qty:         { type: Number, default: 0 },
    lotno2:      { type: String, required: true },  
    qrcode1:     { type: String, required: true }, 
    qrcode2:     { type: String, required: true },
    timestr:     { type: String, required: true },  
    flg:         { type: Number, default: 0 },
    status:     { type: Number, default: 0 },
    color:     { type: String, required: true }, 
  }
);

var tasklist2 = mongoose.model('task2logs', TaskSchema);
////////////////////////////////////////////////////////////////////////////////
//
//                              PostgreSQL構成
//
////////////////////////////////////////////////////////////////////////////////
/*
var pg = require("pg");
var conString = "pg://postgres:postgres@172.21.229.246:5432/worklogSQL";
var client = new pg.Client(conString);
client.connect();
*/

////////////////////////////////////////////////////////////////////////////////
//
//                                MS SQL Server
//
////////////////////////////////////////////////////////////////////////////////

/*
var Connection = require('tedious').Connection;

var config = {
    userName: 'sa',
    password: '',
    server: '172.21.229.200',
    options:{
      database:"hingiSQL",
      tdsVersion: '7_1',
      encrypt: false
  }
}
*/
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
      if(err) {
        // reject:エラー
        reject(console.log("Error-----2:"+err));
      } else { 
        console.log("SQL Start")
        resolve(data);
      }  
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
      resolve(data)
 //   });
  });
}

function sqlclose2(err) {
  return new Promise(function(resolve, reject) {
    mssql.close();
  /*  fs.unlink(oldfile, (err) => {
      if (err) throw err;
      console.log('削除しました。');*/
      console.log(' Err SQL CLose!' + err);
      resolve(data)
 //   });
  });
}

/*

sql2.connect(config, function (err) {
  //var request2 = new sql2.Request();
     //  sql.close();
}); */
////////////////////////////////////////////////////////////////////////////////
//
//                                Node Start
//
////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);

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
//var getIP = require('ipware')().get_ip;

// index.htmlから読み込まれている静的ファイルを送れるようにしておく
server.use(express.static(__dirname));


////////////////////////////////////////////////////////////////////////////////
//
//                                SocketIO構成
//
////////////////////////////////////////////////////////////////////////////////

const request = require('request');


io.on('connection', function (socket) {

  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  clientIp = clientIp.replace("::ffff:", "");
  
  onsole.log('Connetct ' + clientIp + ":" + socketId);

  //io.emit("display_flg", { ipaddress: clientIp, flg: 0 })

  var dat = {
    ipaddress: clientIp,
    name: "display",
    flg: 1,
    socketid: socketId,
    deviceinfo: "",
    devicelist: "",
    customerlist: ""
  }
  setipsignal(dat)
    .then(getiplist4)
    .then(setlastpart)
    .then(getpclist)
    .then(getcustomer)
    .then(onSenddata_start)
    .then(onSenddata_all, onRejected)

  socket.on('disconnect', function () {
    console.log('user disconnected');
    socketId = socket.id;
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    var dat = {
      ipaddress: clientIp,
      name: "display",
      flg: 0,
      socketid: socketId
    }
    setipsignal(dat)
      .then(getiplist4)
      .then(setlastpart)
      .then(onSenddata_all, onRejected);
  })

  // socket.emit("ret_fllowid", { name: "12345"});

  //流動表取り込み処理 /////////////////////////////////////// 
  socket.on('get_fllowlist', function (message, remote) {
    //   console.log('get_fllow '+ JSON.stringify(message));  
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    message.ipaddress = clientIp;

    getbranchlist(message)
      .then(onSenddata, onRejected)
  });

  //流動表取り込み処理 /////////////////////////////////////// 
  socket.on('get_fllow', function (message, remote) {
    //   console.log('get_fllow '+ JSON.stringify(message));  
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    message.deviceinfo.ipaddress = clientIp;

    getbranch(message)
      .then(getworklist)
      /*  .then(get_checksum)*/
      .then(set_iplist)
      .then(onSenddata, onRejected)
  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('set_task', function (message, remote) {
    //  console.log('set_task '+ JSON.stringify(message));  
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 

    message.temp = "";

    set_task(message)
      .then(reset_basicprocess)
      .then(reset_checkinfo)
      .then(set_taskcount)
      .then(set_counter)
      .then(set_counter2)
      .then(getbranch_ornerid)
      .then(onSenddata, onRejected)
  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('set_newtasks', function (message, remote) {

    console.log('set_newtask ' + JSON.stringify(message));

    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 

    message.ipaddress = clientIp;

    settasks(message)
      .then(deltasklog)
      .then(gettaskvalue)
      .then(settaskvalue)
      .then(gettasklist3)
      .then(settasklist4)
      .then(onSenddata_all, onRejected);


  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_currenttasks', function (message, remote) {

    console.log('set_currenttasks ' + JSON.stringify(message));

    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 

    message.ipaddress = clientIp;

    gettasklist3(message)
      .then(settasklist4)
      .then(onSenddata_all, onRejected);


  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_iplist', function (message, remote) {
    //  console.log('set_task '+ JSON.stringify(message));  
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 

    getiplist4(message)
      .then(setlastpart)
      .then(onSenddata, onRejected);

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('set_process', function (message, remote) {
    //  console.log('set_task '+ JSON.stringify(message));  
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 

    setipprocess(message)
      .then(onSenddata, onRejected);

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('set_worker', function (message, remote) {
    console.log('set_worker ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    message.ipaddress = clientIp;

    setipworker(message)
      .then(onSenddata_all, onRejected);

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_pclist', function (message, remote) {
    console.log('set_worker ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    message.ipaddress = clientIp;

    getpclist(message)
      .then(onSenddata_all, onRejected);

  });


  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('set_status', function (message, remote) {
    console.log('set_status ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    message.ipaddress = clientIp;

    setipstatus(message)
      .then(onSenddata_all, onRejected);

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_gantt', function (message, remote) {
    console.log('set_gantt ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    //  message.ipaddress = clientIp;

    gettimes(message)
      .then(setganttdata_dhk)
      .then(onSenddata_all, onRejected);

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_plans', function (message, remote) {
    console.log('get_plans ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    //  message.ipaddress = clientIp;

    getplans(message)
      //  .then(settasklist4)
      .then(set_branch)
      .then(set_plans)
      .then(onSenddata, onRejected);

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_process', function (message, remote) {
    console.log('get_process ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    //  message.ipaddress = clientIp;
    console.log(JSON.stringify(message))

  });

  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('get_checkinfo', function (message, remote) {
    console.log('get_checkinfo ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    //  message.ipaddress = clientIp;
    var data = message;
    data.ipaddress = clientIp;

    console.log("get_checkinfo:" + data);

    gettasklist4(data)
      .then(set_iplist2)
      .then(onSenddata, onRejected);

  });


  //作業追加＆更新 /////////////////////////////////////// 
  socket.on('set_tasklog', function (message, remote) {
    console.log('set_tasklog ' + JSON.stringify(message));
    clientIp = socket.request.connection.remoteAddress;
    clientIp = clientIp.replace("::ffff:", "");
    //   message.tasks.ipaddress = clientIp; 
    //  message.ipaddress = clientIp;
    var data = message;
    data.ipaddress = clientIp; data

    console.log("get_checkinfo:" + data);

    settasklog(data)
      .then(onSenddata, onRejected);

  });

  //Ajax送信///////////////////////////////////////    

  function onSenddata_start(data) {
    // console.log('onSenddata '+ JSON.stringify(data.retdata.basicprocess));  
    return new Promise(function (resolve, reject) {
      iplist.find({ _id: data.ipaddress }, function (err, docs) {
        if (err) {
          reject(err);
        } else {
          data.deviceinfo = docs;
          socket.emit("device_start", data);
          console.log("emit:" + JSON.stringify(data.customerlist))
          resolve(data);
        }
      });
    });
  }

  function onSenddata(data) {
    console.log('onSenddata ' + JSON.stringify(data.retdata));
    if (data.name != "") {
      socket.emit(data.name, data);
    }
  }

  function onSenddata2(data) {
    console.log('onSenddata ' + JSON.stringify(data));
    socket.emit(data.name, data);
  }

  function onSenddata_all(data) {
    console.log('onSenddata_all ' + JSON.stringify(data));
    io.emit(data.name, data);
  }
  //Ajaxエラー処理///////////////////////////////////////  
  function onRejected(err) {
    console.log(err);
  }

});

server.get('/getworkerlavelone', function (req, res) {
  console.log('getworkerlavel_one ' + JSON.stringify(req.query));
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  var param = {
    ipaddress: clientIp,
    senddata: req.query.workerid,
    retdata: ""
  }

  getworker_one(param)
    .then(onSenddata, onRejected);

  function getworker_one(data) {
    return new Promise(function (resolve, reject) {

      data.ret = [];
      workers.find({ workerid: parseInt(data.senddata) }, function (err, docs) {
        if (err) {
          // console.log('func_workid_update Error!');
          reject(console.log('setassysn! ' + err));
          throw err;
        }
        if (docs.length > 0) {
          data.retdata = docs;
        } else {
          data.retdata = [];
        }
        resolve(data)
      });

    });
  }

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
     console.log('onSenddata '+data.retdata[0]); 
    res.send(data.retdata[0]);
  }

  function onRejected(err) {
    res.send(err);
  }

});
////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////


server.get('/getworkerlavel', function (req, res) {
  console.log('getworkerlavel ' + JSON.stringify(req.query));
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  var param = {
    ipaddress: clientIp,
    senddata: req.query.workerid,
    retdata: ""
  }

  getworker(param)
    .then(onSenddata, onRejected);

  function getworker(data) {
    return new Promise(function (resolve, reject) {

      data.ret = [];
      workers.find({ workerid: parseInt(data.senddata) }, function (err, docs) {
        if (err) {
          // console.log('func_workid_update Error!');
          reject(console.log('setassysn! ' + err));
          throw err;
        }
        if (docs.length > 0) {
          data.workername = docs[0].workername;
          data.managementlevel = docs[0].managementlevel;
        }
        resolve(data)
      });

    });
  }

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    // console.log('onSenddata '+data); 
    res.send(data.retdata[0]);
  }

  function onRejected(err) {
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


server.post('/savetask', function(req, res) {

  // console.log("recv2:" + JSON.stringify(req.body.params))
  
    var data = req.body;

    savetask(data)
      .then(onSenddata,onRejected) 
  
    function onSenddata(data) {
    //  console.log('send2 '+JSON.stringify(data));  
      res.header('Access-Control-Allow-Origin', '*'); 
      res.send(data);
    }
  
    /* エラー処理 ************************/ 
    
    function onRejected(err) {
        res.send(err);
    } 
  
});

server.post('/getmachine', function(req, res){
 
  console.log("getmachine:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
    data.ipaddress = clientIp;

    getmclist(data)
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

 server.post('/getmachine2', function(req, res){
 
  console.log("getmachine2:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
    data.ipaddress = clientIp;

    getmclist2(data)
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

 server.post('/getmodelname', function(req, res){
 
  console.log("getncnamename:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
  data.productno = data.qrcode1.substr(0,8);
  data.lotno = data.qrcode1.substr(8,4);
  data.modelcode = data.qrcode1.substr(12,8);

    sqlstart(data)
       .then(getmodelname)
       .then(onSenddata, onRejected);
 
      function onSenddata(data) {
         console.log('send2 '+ JSON.stringify(data));  
         res.header('Access-Control-Allow-Origin', '*'); 
         mssql.close();
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          mssql.close();
          res.send(err);
      } 
 
 });

 server.post('/setproduct', function(req, res){
 
  console.log("setproduct:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
    data.ipaddress = clientIp;

    data.productno = data.qrcode1.substr(0,8);
    data.lotno = data.qrcode1.substr(8,4);
    data.lotpice = data.qrcode1.substr(8,4);
    data.modelcode = data.qrcode1.substr(12,10);
    data.timestr = getDay3(new Date(),0); 
    data.daystr = addDaystr2(new Date()); 

    setproduct(data)
       .then(setstatus2)
       .then(setrequest)
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

 server.post('/gettaskdata', function(req, res){
 
  console.log("gettaskdata:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
    data.ipaddress = clientIp;

    gettaskdata(data)
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

 server.post('/deltaskdata', function(req, res){
 
  console.log("gettaskdata:" + JSON.stringify(req.body))
 
  var ip = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");
 
  var data = req.body;
 
    data.ipaddress = clientIp;

    deltaskdata(data)
       .then(gettaskdata)
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

//ポート起動///////////////////////////////////////  
http.listen(http_port, function () {
  console.log('listening on *:' + http_port);
});

////////////////////////////////////////////////////////////////////////////////
//
//                              Socketio応答関数
//
////////////////////////////////////////////////////////////////////////////////


function setproduct(data) {

  return new Promise(function(resolve, reject) { 

    if (data._id == null) {
      data._id = data.productno + "-" + data.machineid + "-" + addTimeid();
    }


    var cl = [//内容
      { value: 0, text: '計画無', color: "silver"  },
      { value: 1, text: '稼動OK', color: "skyblue" },
      { value: 2, text: '調整待', color: "yellow"  },
      { value: 3, text: '組替待', color: "yellow"  },
      { value: 4, text: '検査待', color: "yellow"  },
      { value: 5, text: '材料待', color: "yellow"  },   
      { value: 6, text: '指示待', color: "yellow"  },
      { value: 7, text: '人待ち', color: "yellow"  },
      { value: 8, text: 'ポスト待', color: "yellow"  },
      { value: 9, text: 'ﾊｳｼﾞﾝｸﾞ待', color: "yellow"  },      
      { value: 10, text: '稼働中', color: "green"  },  
    ];

    var newLine = cl.filter(function(item, index){
      if (item.value == data.status) return true;
    });

    data.color = newLine[0].color;

    tasklist2.updateOne({ _id: data._id }, { $set: data }, { upsert: true }, function (err, result) {
      if (err) {
        reject(console.log('ftasks! ' + err));
      } else {
         data.msg = "登録できました";
         data.flg = result.ok;
      }
      resolve(data);
    });

  });
}


function getinventdata(data) {

  return new Promise(function(resolve, reject) { 
    //1  sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
        // console.log("nenbi " + addNenbi() + " lotid " + data.lotid);
         request.query("SELECT * FROM Q_DOWN_LOT_在庫数_CT_HANDY WHERE NENBI = '" + addNenbi() + "' AND PARt_CODE = '" + data.partname + "';", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
                  // sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
               // sql.close();
                 if (recordset.recordsets[0].length > 0) {
                    var rtotal = 0;
                    var jtotal = 0;
                    for (var g in recordset.recordsets[0]) {
                      rtotal += recordset.recordsets[0][g].棚在庫;
                      jtotal += recordset.recordsets[0][g].棚卸数; 
                    }   
                    data.rtotal = rtotal;
                    data.jtotal = jtotal;
                    data.data = recordset.recordsets[0];
   
                    resolve(data); 
                   } else  {

                    resolve(data);
                   }
                 } 
           //    }
             });
      //1  }); 
     }); 
}

function getinventdata2(data) {

  return new Promise(function(resolve, reject) { 
    //1  sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
       //  console.log("nenbi " + addNenbi() + " lotid " + data.lotid);
         request.query("SELECT * FROM Q_DOWN_LOT_在庫数_CT_HANDY WHERE NENBI = '" + addNenbi() + "' AND TANA_LOT = " + data.lotid + ";", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {

                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
                  // sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
               // sql.close();
                 if (recordset.recordsets[0].length > 0) {
                    var rtotal = 0;
                    var jtotal = 0;
                    for (var g in recordset.recordsets[0]) {
                      rtotal += recordset.recordsets[0][g].棚在庫;
                      jtotal += recordset.recordsets[0][g].棚卸数; 
                    }   
                    data.rtotal = rtotal;
                    data.jtotal = jtotal;
                    data.data = recordset.recordsets[0];
   
                    resolve(data); 
                   } else  {

                    resolve(data);
                   }
                 } 
           //    }
             });
      //1  }); 
     }); 
}

function getseriallabel(data) {

  return new Promise(function(resolve, reject) { 
     // sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
         // console.log("sql " + str);
         request.query("SELECT * FROM Q_DOWN_LOT_在庫数_CT_20191126 WHERE NENBI = '20191101' AND TANA_LOT = " + data.lotid + ";", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
                 //1  sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
              //1  sql.close();
                 if (recordset.recordsets[0].length > 0) {
                 //   console.log("recordset " + JSON.stringify(recordset))
                    data.stock = recordset.recordsets[0][0].棚在庫;
                    data.total = recordset.recordsets[0][0].棚卸数;
                    data.partname = recordset.recordsets[0][0].PART_CODE;
                    resolve(data); 
                   } else  {

                    resolve(data);
                   }
                 } 
           //    }
             });
   //    }); 
     }); 
}

function getseriallabel3(data) {
  return  new Promise(function(res, rej) {
//1  sql.connect(config2, function (err) { 
       var request = new sql.Request();
     
          console.log("----@@" + JSON.stringify(data));
          /*
          @BC VARCHAR(23),
          @QTY INT,
          @WORK INT,
          @WORKDAY DATETIME,
          @STAFF VARCHAR(7),
          @MC INT,
          @EDIT INT,
          @CUSTMOER VARCHAR(10) OUTPUT,
          @FLG INT OUTPUT
          )
          */
          //  var pos = data.position.split(":")

              var sqlstr="S_INVENT_QTY_CHECK";
           
              request.input('lot', sql.Int, parseInt(data.lotid));
              request.input('reel', sql.Int, parseInt(data.partid));
              request.output('stock', sql.Int);
              request.output('stock2', sql.Int);
              request.output('part', sql.VarChar);
              request.output('total', sql.Int);
              request.output('total2', sql.Int);

              request.execute(sqlstr, function(err, result){
                  if (err) {
                  //1    sql.close();
                      rej(console.log("err " + err));
                  } else { 
                      console.log("success " + JSON.stringify(result.output));
                   //   if (result.output.==1) {
                        data.stock = result.output.stock;
                        data.stock2 = result.output.stock2;
                        data.partname = result.output.part;
                        data.total = result.output.total;
                        data.total2 = result.output.total2;
                  /*    } else {
                        data.stock = 0;
                        data.total = 0;
                        data.partname = "ERR!";
                      }*/
                  }
              //1   sql.close();
                 res(data);
           })
     //1   })  
   });       
}

function getstock(data) {
 return new Promise(function (resolve, reject) {
  stocks.find({ $and: [{ _id: data.lotid }] }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        if (docs.length > 0) {
          data.stock = docs[0].stock;
          data.partname = docs[0].partname;     
        } else {
          data.stock = 0;
          data.partname = "---";   
        }
        //  console.log('branch! ' + JSON.stringify(docs));
        resolve(data);
      }
    });
  });
}

function getstock2(data) {
  return new Promise(function (resolve, reject) {
   // if (data.disp == 90 || data.disp == 270) { 
      stocks.find({$and: [{ partname: data.partname,  },{ stock: { $gt: 0 }}]}, function (err, docs) {
          if (err) {
            console.log('get_branch Error!');
            reject(console.log('branch! ' + err));
            throw err;
          } else {
            data.temp = docs; 
          //  console.log('branch! ' + JSON.stringify(docs));
            resolve(data);
          }
        });
   });
 }

 function getstock21(data) {
  return new Promise(function (resolve, reject) {
    console.log('getstock21! ' + JSON.stringify(data));
    if (data.disp == "2") { 
      stocks.find({$and: [{ partname: data.partname,  }]}, function (err, docs) {
          if (err) {
            console.log('get_branch Error!');
            reject(console.log('branch! ' + err));
            throw err;
          } else {
            if (docs.length > 0) {
              data.temp = docs; 
            } else {
              data.temp = []; 
            }
            data.temp = docs; 
          //  console.log('branch! ' + JSON.stringify(docs));
            resolve(data);
          }
        });
      } else {
        resolve(data);
      }  
   });
 }

 function getstock3(data) {
  return new Promise(function (resolve, reject) {
   if (data.disp == "2") { 
      stocks.find({$and: [{ _id: data.lotid },{ stock: { $gt: 0 }}]}, function (err, docs) {
          if (err) {
            console.log('get_branch Error!');
            reject(console.log('branch! ' + err));
            throw err;
          } else {
            if (docs.length > 0) {
              data.temp = docs; 
            } else {
              data.temp = []; 
            }
          //  console.log('branch! ' + JSON.stringify(docs));
            resolve(data);
          }
        });
      } else {
        resolve(data);
      }  
   });
 } 

 function getinventsum2(data) {

  return new Promise(function (res, rej) {
        var lot = [];
        var en = data.temp.length - 1;
        function loop(i) {
          // 非同期処理なのでPromiseを利用
          return new Promise(function (resolve, reject) {
           if (data.temp.length > 0) {
              var dat = {
                _id:        data.temp[i]._id,
                lotid:      parseInt(data.temp[i]._id),
                partname:   data.temp[i].partname,
                bc:         "",
                qty2:        data.temp[i].stock,
                qty:       0,
                worker:     "",
                position:   "",
                inventno:   0,
                check:      false,
                ipaddress:  "",
                printer:    "",
                time:       
                null
              }

            //  console.log("lot:"+ JSON.stringify(data.temp[i]));

              partinvent.aggregate([
                { $match: { lotid: dat.lotid} },
                {
                  $group: {
                    _id: null,
                    _sum: { $sum: "$qty" }
                  }
                }],
                function (err, docs) {
                  if (err) {
                    console.log('getworklog Error!');
                    reject(console.log('getworklog! ' + err));
                    throw err;
                  } else {
                    console.log("times.aggregate2!" + JSON.stringify(docs));
                    if (docs.length > 0) {
                      dat.qty= docs[0]._sum;
                    } else {
                      data.sum= "0";
                    }
                  }
                  resolve(i + 1);
                }); 
              
            lot.push(dat); 
          } else  {
            resolve(i + 1);      
          }
      })

        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            data.data = lot
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

function getinventsum3(data) {

  return new Promise(function (res, rej) {
        var lot = [];
        var en = data.temp.length - 1;
        function loop(i) {
          // 非同期処理なのでPromiseを利用
          return new Promise(function (resolve, reject) {
           if (data.temp.length > 0) {

              var part = "";

              if (parseInt(data.temp[i]._id) == parseInt(data.lotid)) {
                part = "*"
              }

              part += data.temp[i].partname;

              var dat = {
                _id:        data.temp[i]._id,
                lotid:      parseInt(data.temp[i]._id),
                partname:   part,
                bc:         "",
                qty2:        data.temp[i].stock,
                qty:       0,
                worker:     "",
                position:   "",
                inventno:   0,
                check:      false,
                ipaddress:  "",
                printer:    "",
                time:       
                null
              }

            //  console.log("lot:"+ JSON.stringify(data.temp[i]));

              partinvent.aggregate([
                { $match: { lotid: dat.lotid} },
                {
                  $group: {
                    _id: null,
                    _sum: { $sum: "$qty" }
                  }
                }],
                function (err, docs) {
                  if (err) {
                    console.log('getworklog Error!');
                    reject(console.log('getworklog! ' + err));
                    throw err;
                  } else {
                        console.log("times.aggregate2!" + JSON.stringify(docs));
                    if (docs.length > 0) {
                      dat.qty= docs[0]._sum;
                    } else {
                      data.sum= "0";
                    }
                  }
                  resolve(i + 1);
                }); 
              
            lot.push(dat); 
          } else  {
            resolve(i + 1);      
          }
      })

        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            data.data = lot
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

function getseriallabel2(data) {

  return new Promise(function(resolve, reject) { 
     if (data.partname == "" ) {
  //1    sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
          console.log("sql " + data.lotid);
         request.query("SELECT * FROM T_SCAN_LOT WHERE LOT_ID = " + data.lotid + ";", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
                //   sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
               // sql.close();
                 if (recordset.recordsets[0].length > 0) {
                 //   console.log("recordset " + JSON.stringify(recordset))
                    data.stock = 0;
                    data.total = 0;
                    data.partname = recordset.recordsets[0][0].TRACE;
                    resolve(data); 
                   } else  {

                    resolve({});
                   }
                 } 
           //    }
           //  });
        }); 
      } else {
        resolve(data); 
      } 
     }); 
}


function set_inventpart(data) {
  return  new Promise(function(res, rej) {
 // sql.connect(config2, function (err) { 
       var request = new sql.Request();
     
           console.log("----@@" + JSON.stringify(data));
          /*
          @BC VARCHAR(23),
          @QTY INT,
          @WORK INT,
          @WORKDAY DATETIME,
          @STAFF VARCHAR(7),
          @MC INT,
          @EDIT INT,
          @CUSTMOER VARCHAR(10) OUTPUT,
          @FLG INT OUTPUT
          )
          */
              var pos = data.position.split(":")

              var sqlstr="Q_COUNT_SAVE_TEMP";

              request.input('BC', sql.VarChar, data.bc);
              request.input('IPADDRESS', sql.VarChar, data.ipaddress);            
              request.input('QTY', sql.Int, parseInt(data.qty));
              request.input('WORK', sql.Int, parseInt(data.worker.workerid));
              request.input('STAFF', sql.Int, parseInt(data.worker.workerid));
              request.input('MC', sql.Int, data.inventno);
              request.input('POSITION', sql.VarChar, pos[0]);
              request.input('INVENTNO', sql.Int, parseInt(data.inventno));           
              request.input('WORKDAY', sql.DateTime, new Date());
              request.output('CUSTMOER', sql.VarChar);
              request.output('FLG', sql.Int);
              
              request.execute(sqlstr, function(err, result){
                  if (err) {
                //1      sql.close();
                      rej(console.log("err " + err));
                  } else { 
                      console.log("success " + result.output.FLG);
                      if (result.output.FLG==1) {
                        data.result = "OK!"
                      } else {
                        data.result = "ERR!"
                      }
                  }
               //1  sql.close();
                 res(data);
          })
        })  
 //1  });       
}

function set_inventpart2(data) {
  return  new Promise(function(res, rej) {
 //1 sql.connect(config2, function (err) { 
       var request = new sql.Request();
     
           console.log("----@@" + JSON.stringify(data));
          /*
          @BC VARCHAR(23),
          @QTY INT,
          @WORK INT,
          @WORKDAY DATETIME,
          @STAFF VARCHAR(7),
          @MC INT,
          @EDIT INT,
          @CUSTMOER VARCHAR(10) OUTPUT,
          @FLG INT OUTPUT
          )
          */
              var pos = data.position.split(":")

          //    var sqlstr="Q_COUNT_SAVE_TEMP3_TEST";
              var sqlstr="Q_COUNT_SAVE_TEMP3";

              request.input('BC', sql.VarChar, data.bc);
              request.input('IPADDRESS', sql.VarChar, data.ipaddress);            
              request.input('QTY', sql.Int, parseInt(data.qty));
              request.input('WORK', sql.Int, parseInt(data.worker.workerid));
              request.input('STAFF', sql.Int, parseInt(data.worker.workerid));
              request.input('MC', sql.Int, data.inventno);
              request.input('POSITION', sql.VarChar, pos[0]);
              request.input('INVENTNO', sql.Int, parseInt(data.inventno));           
              request.input('WORKDAY', sql.DateTime, new Date());
              request.output('CUSTMOER', sql.VarChar);
              request.output('FLG', sql.Int);
              
              request.execute(sqlstr, function(err, result){
                  if (err) {
                   //1   sql.close();
                      rej(console.log("set_inventpart2 err " + err));
                  } else { 
                    if (result.recordsets[0].length > 0) {
                      console.log("result " + JSON.stringify(result));
                      data.stock = result.recordsets[0][0].棚在庫;
                      data.partname = result.recordsets[0][0].PART_CODE;
                      data.total = result.recordsets[0][0].棚卸数;
                      data.data = result.recordsets[0];
                    }

                  }
               //1  sql.close();
                 res(data);
          })
        })  
 //1  });       
}

function set_noinventpart2(data) {
  return  new Promise(function(res, rej) {
 //1 sql.connect(config2, function (err) { 
       var request = new sql.Request();
     
           console.log("----@@" + JSON.stringify(data));
          /*
          @BC VARCHAR(23),
          @QTY INT,
          @WORK INT,
          @WORKDAY DATETIME,
          @STAFF VARCHAR(7),
          @MC INT,
          @EDIT INT,
          @CUSTMOER VARCHAR(10) OUTPUT,
          @FLG INT OUTPUT
          )
          */
              var pos = data.position.split(":")

              var sqlstr="Q_COUNT_noSAVE_TEMP3";

              request.input('BC', sql.VarChar, data.bc);
              request.input('IPADDRESS', sql.VarChar, data.ipaddress);            
              request.input('QTY', sql.Int, parseInt(data.qty));
              request.input('WORK', sql.Int, parseInt(data.worker.workerid));
              request.input('STAFF', sql.Int, parseInt(data.worker.workerid));
              request.input('MC', sql.Int, data.inventno);
              request.input('POSITION', sql.VarChar, pos[0]);
              request.input('INVENTNO', sql.Int, parseInt(data.inventno));           
              request.input('WORKDAY', sql.DateTime, new Date());
              request.output('CUSTMOER', sql.VarChar);
              request.output('FLG', sql.Int);
              
              request.execute(sqlstr, function(err, result){
                  if (err) {
                  //1    sql.close();
                      rej(console.log("err " + err));
                  } else { 
                    if (result.recordsets[0].length > 0) {
                      console.log("result " + JSON.stringify(result));
                      data.stock = result.recordsets[0][0].棚在庫;
                   //   data.stock2 = result.output.stock2;
                      data.partname = result.recordsets[0][0].PART_CODE;
                      data.total = 0;
                      data.data = result.recordsets[0];
                   //   data.total2 = result.output.total2;

                    }

                  }
               //1  sql.close();
                 res(data);
          })
        })  
  //1 });       
}

function setinventpart2(data) {
  return new Promise(function(resolve, reject) { 
     console.log("save!:" + JSON.stringify(data))
    partinvent.findOneAndUpdate({ _id: data._id },
        data ,{upsert: true, new: true },function(err,result){
// マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
            console.log("error " + err);
        } else {
          console.log("getsplitid"+ JSON.stringify(result));
        //  data.retdata = result       
          resolve(data);
        }
      }); 
  })
}

function getinventqty(data) {

  return new Promise(function (resolve, reject) {

    partinvent.aggregate([
      { $match: { $and: [{ lotid: data.lotid }] } },
      {
        $group: {
          _id: null,
          _qty: { $sum: "$qty" }
        }
      }],
      function (err, docs) {
        if (err) {
          console.log('getworklog Error!');
          reject(console.log('getworklog! ' + err));
          throw err;
        } else {
          //    console.log("times.aggregate!" + data.retdata.basicprocess[i].processno + " - " + JSON.stringify(docs));
          if (docs.length > 0) {
          //  console.log("times.aggregate!" + JSON.stringify(docs));
            //  console.log("times.aggregate2!" + Math.min.apply(0,docs._production));
            data.total = docs[0]._qty
          } 
        }
        resolve(data);
      });

  })
}


function getinventpartdata(data) {

  return new Promise(function(resolve, reject) { 
    //1  sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
          console.log("sql " + JSON.stringify(data));
         request.query("SELECT PARTNAME as partname," +
                      " LOT_ID as lotid," + 
                      " CONVERT (varchar, UPDATE_TIME, 108) as time," +
                      " POSITION as address," +
                      " ID as _id," +
                      " QTY as qty," +
                      " INVENTNO as inventno   FROM T_CARRYOVER_LOG WHERE IPADDRESS = '" + data.ipaddress + "';", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
             //1      sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
              //1  sql.close();
                 if (recordset.recordsets[0].length > 0) {
                    console.log("test " + JSON.stringify(recordset));
                    data.data = recordset.recordsets[0];
                    resolve(data); 
                   } else  {

                    resolve({});
                   }
                 } 
           //    }
             });
        }); 
   //1  }); 
}

function getinventlist(data) {
  // console.log("branch!" + data.barcode);
   return new Promise(function (resolve, reject) {
     partinvent.find({ lotid: data.lotid }, function (err, docs) {
       if (err) {
         console.log('get_branch Error!');
         reject(console.log('branch! ' + err));
         throw err;
       } else {
         data.data = docs;
         console.log('branch! ' + JSON.stringify(docs));
         resolve(data);
       }
     });
   });
 }

 function getstocksum(data) {

  return new Promise(function (res, rej) {

    var en = data.data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

        stocks.find({ _id: data.data[i].lotid.toString() }, function (err, docs) {
          if (err) {
            console.log('get_branch Error!');
            reject(console.log('branch! ' + err));
            throw err;
          } else {
            if (docs.length > 0) {
              data.data[i].qty2 = docs[0].stock;
            }
          //  console.log('branch! ' + JSON.stringify(docs));
          }
          resolve(i + 1);
        }); 
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

function delinventpart(data) {
  return  new Promise(function(res, rej) {
 // sql.connect(config2, function (err) { 
       var request = new sql.Request();
     
           console.log("----@@" + JSON.stringify(data));
          /*
          @BC VARCHAR(23),
          @QTY INT,
          @WORK INT,
          @WORKDAY DATETIME,
          @STAFF VARCHAR(7),
          @MC INT,
          @EDIT INT,
          @CUSTMOER VARCHAR(10) OUTPUT,
          @FLG INT OUTPUT
          )
          */
     
              var sqlstr="Q_CARRYOVER_LOG_DELETE";
            
              request.input('ID', sql.Int, parseInt(data.id));
              request.output('FLG', sql.Int);
              
              request.execute(sqlstr, function(err, result){
                  if (err) {
                  //1    sql.close();
                      rej(console.log("err " + err));
                  } else { 
                      console.log("success " + result.output.FLG);
                      if (result.output.FLG==1) {
                        data.result = "OK!"
                      } else {
                        data.result = "ERR!"
                      }
                  }
               //1  sql.close();
                 res(data);
          })
        })  
 //1  });       
}

function getbranchlist(data) {
 // console.log("branch!" + data.barcode);
  return new Promise(function (resolve, reject) {
    branchs.find({ $and: [{ customerid: 5 }, { workdate: { $gte: new Date("2018-10-10") } }] }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        data.retdata = docs;
      //  console.log('branch! ' + JSON.stringify(docs));
        resolve(data);
      }
    });
  });
}

//流動表内容取得１/////////////////////////////////////// 
function getbranch(data) {
 // console.log("branch!" + data.barcode);
  return new Promise(function (resolve, reject) {
    branchs.find({ _id: data.barcode }, function (err, docs) {

      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        data.retdata = docs[0];
        //   console.log('branch! '+ JSON.stringify(docs[0]));
        resolve(data);
      }
    });
  });
}

function getworklist(data) {
  return new Promise(function (resolve, reject) {
    times.find({ $and: [{ ornerid: data.barcode }, { updateflg: { "$gt": -1 } }] }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        data.taskdata = docs;
        //    console.log('work! '+ JSON.stringify(docs));
        resolve(data);
      }
    });
  });
}

function getproduction(data) {
  return new Promise(function (resolve, reject) {
    branchs.find({ _id: data.taskdata.ornerid }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        data.fllowdata = docs;
        resolve(data);
      }
    });
  });
}

function get_checksum(data) {

  return new Promise(function (res, rej) {

    var en = data.retdata.basicprocess.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

        times.aggregate([
          { $match: { $and: [{ "ornerid": data.retdata._id }, { "processno": data.retdata.basicprocess[i].processno }, { "readyflg": 0 }, { updateflg: { "$gt": -1 } }] } },
          { $unwind: '$checklist' },
          {
            $group: {
              _id: {
                _ornerid: "$ornerid",
                _processno: "$processno",
                _checkid: "$checklist.checkid",
                _checkname: "$checklist.checkname",
                _sortno: "$checklist.sortno",
                _workno: "$checklist.workno"
              },
              _production: { $sum: "$checklist.production" }
            }
          }],
          function (err, docs) {
            if (err) {
              console.log('getworklog Error!');
              reject(console.log('getworklog! ' + err));
              throw err;
            } else {
              //    console.log("times.aggregate!" + data.retdata.basicprocess[i].processno + " - " + JSON.stringify(docs));
              if (docs.length > 0) {
              //  console.log("times.aggregate!" + JSON.stringify(docs));
                //  console.log("times.aggregate2!" + Math.min.apply(0,docs._production));
                let values = docs.map(function (v) {
                  return v._production;
                });
             //   console.log("times.aggregate!" + JSON.stringify(values));
                data.retdata.basicprocess[i].production = Math.min.apply(0, values);
                data.retdata.basicprocess[i].checksum = docs;
              }
            }

            resolve(i + 1);
          });

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

function set_iplist(data) {

  return new Promise(function (res, rej) {

    iplist.updateMany({ _id: data.deviceinfo.ipaddress },
      { $set: { fllowid: data.retdata.fllowid, fllowstr: data.barcode, modelname: data.retdata.modelname } }
      , function (err, result) {
        if (err) {
          rej(console.log('ftasks! ' + err));
        } else {
          //console.log("update " + JSON.stringify(result));             
        }
        res(data);
      });
  })
}

function set_task(data) {

  return new Promise(function (res, rej) {

    //   console.log("setdata " + data.tasks[i]._id)
    if (data.tasks.updateflg == -1) {
      times.deleteOne({ _id: data.tasks._id }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
         //   console.log("delete " + JSON.stringify(result));
          }
          res(data);
        });
    } else {
      times.updateOne({ _id: data.tasks._id }, { $set: data.tasks }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
          //  console.log("update " + JSON.stringify(result));
          }
          res(data);
        });
    }
  })
}

function settasks(data) {
  return new Promise(function (res, rej) {
    console.log("update2 " + data.id);
    data.value = parseInt(data.value);
    plans.updateOne({ _id: data.ornerid }, { $push: { tasks: data } }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
     //   console.log("update " + JSON.stringify(result));
        // data.return = result;
      }
      res(data);
    });
  })
}
/*
function gettasks(data) {
  return new Promise(function(resolve, reject) { 
    console.log("processno:" + data.result.processno)
    plans.find({_id: data.result.id}, function(err, docs) {
          if(err) {
              console.log('get_branch Error!');
              reject(console.log('branch! '+err)); 
              throw err;
              } else { 
                console.log("length:" + docs.length)
              resolve(docs);  
              }  
          }); 
      });
} */

function settasks2(data) {

  return new Promise(function (res, rej) {

    var en = data.idgroup.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (en > 0) {
          data.result.value = parseInt(data.result.value);
          plans.updateOne({ _id: data.idgroup }, { $push: { tasks: data.result } }, function (err, result) {
            if (err) {
              rej(console.log('ftasks! ' + err));
            } else {
           //   console.log("update " + JSON.stringify(result));
            }
            resolve(i + 1);
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

function gettasks(data) {
  return new Promise(function (resolve, reject) {
    //console.log("processno:" + data.processno)
    plans.find({ $and: [{ fllowid: data.fllowid }, { processno: data.processno }] }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
      //  console.log("length:" + docs.length)
        resolve(docs);
      }
    });
  });
}

function reset_basicprocess(data) {

  return new Promise(function (res, rej) {

    branchs.updateMany({ _id: data.tasks.ornerid, "basicprocess.processno": data.tasks.processno },
      { $set: { "basicprocess.$.production": 0 } }, { upsert: true }
      , function (err, result) {
        if (err) {
          rej(console.log('ftasks! ' + err));
        } else {
          //console.log("update " + JSON.stringify(result));             
        }
        res(data);
      });
  })
}

function reset_checkinfo(data) {

  return new Promise(function (res, rej) {

    branchs.updateMany({ _id: data.tasks.ornerid, "checkinfo.processno": data.tasks.processno },
      { $set: { "checkinfo.$.production": 0 } }
      , function (err, result) {
        if (err) {
          rej(console.log('ftasks! ' + err));
        } else {
          //console.log("update " + JSON.stringify(result));             
        }
        res(data);
      });
  })
}

function set_taskcount(data) {

  return new Promise(function (resolve, reject) {

    times.aggregate([
      { $match: { $and: [{ "ornerid": data.tasks.ornerid }, { "processno": data.tasks.processno }, { "readyflg": 0 }] } },
      { $unwind: '$checklist' },
      {
        $group: {
          _id: {
            _ornerid: "$ornerid",
            _processno: "$processno",
            _checkid: "$checklist.checkid",
            _checkname: "$checklist.checkname",
            _sortno: "$checklist.sortno",
            _workno: "$checklist.workno"
          },
          _production: { $sum: "$checklist.production" }
        }
      }],
      function (err, docs) {
        if (err) {
          console.log('getworklog Error!');
          reject(console.log('getworklog! ' + err));
          throw err;
        } else {
          //    console.log("times.aggregate!" + data.retdata.basicprocess[i].processno + " - " + JSON.stringify(docs));
          if (docs.length > 0) {
          //  console.log("times.aggregate!" + JSON.stringify(docs));
            //  console.log("times.aggregate2!" + Math.min.apply(0,docs._production));
            data.temp = docs
          }
        }
        resolve(data);
      });

  })
}

function set_counter(data) {

  return new Promise(function (resolve, reject) {

    //.log("set_counter!" + JSON.stringify(data.temp));

    if (data.temp != "") {
      let values = data.temp.map(function (v) {
        return v._production;
      });

      branchs.updateMany({ _id: data.tasks.ornerid, "basicprocess.processno": data.tasks.processno },
        { $set: { "basicprocess.$.production": Math.min.apply(0, values) } }
        , function (err, result) {
          if (err) {
            reject(console.log('ftasks! ' + err));
          } else {
            //console.log("update " + JSON.stringify(result));             
          }
          resolve(data);
        });
    } else {
      branchs.updateMany({ _id: data.tasks.ornerid, "basicprocess.processno": data.tasks.processno },
        { $set: { "basicprocess.$.production": 0 } }
        , function (err, result) {
          if (err) {
            reject(console.log('ftasks! ' + err));
          } else {
            //console.log("update " + JSON.stringify(result));             
          }
          resolve(data);
        });
    }

  })
}

function set_counter2(data) {

  return new Promise(function (res, rej) {

    var en = data.temp.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (en > 0) {
          branchs.updateMany({ _id: data.tasks.ornerid, "checkinfo.checkid": data.temp[i]._id._checkid },
            { $set: { "checkinfo.$.production": data.temp[i]._production } }
            , function (err, result) {
              if (err) {
                reject(console.log('ftasks! ' + err));
              } else {
            //    console.log("update " + JSON.stringify(result));
              }
              resolve(i + 1);
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

function getbranch_ornerid(data) {
  //     console.log("branch!" + data.barcode);  
  return new Promise(function (resolve, reject) {
    branchs.find({ _id: data.tasks.ornerid }, function (err, docs) {

      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        data.retdata = docs[0];
        //   console.log('branch! '+ JSON.stringify(docs[0]));
        resolve(data);
      }
    });
  });
}

function set_tasks(data) {

  return new Promise(function (res, rej) {

    console.log("setdata " + JSON.stringify(data))

    var en = data.tasks.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

    //    console.log("setdata " + data.tasks[i]._id)

        times.updateMany({ _id: data.tasks[i]._id }, { $set: data.tasks[i] }, { upsert: true }
          , function (err, result) {
            if (err) {
              reject(console.log('ftasks! ' + err));
            } else {
           //   console.log("update " + JSON.stringify(result));
            }
            resolve(i + 1);
          });

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

function getiplist3(data) {
  // ループ処理の完了を受け取るPromise
  var dat = [];
  return new Promise(function (resolve, reject) {
    iplist.find({}, function (err, docs) {
      if (err) {
        reject(err);
      } else {

        resolve({ info: data, data: docs });
      }
    });
  });
}

function getcheckinfo(data) {
  // ループ処理の完了を受け取るPromise
  return new Promise(function (resolve, reject) {
    plans.find({ $and: [{ fllowid: data.fllowid }, { processno: data.processno }, { start: data.start }] }, function (err, docs) {
      if (err) {
        reject(err);
      } else {
        data.retdata = docs;
        resolve(data);
      }
    });
  });
}

//端末工程NO更新///////////////////////////////////////  
function setipsignal(data) {
  return new Promise(function (resolve, reject) {
    iplist.update({ _id: data.ipaddress },
      { $set: { signalflg: data.flg, socketid: data.socketid } }, function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log("result " + err);
        } else {
          console.log("process update ");

          resolve(data);

        }
      });

  });
}

//端末工程NO更新///////////////////////////////////////  
function setipprocess(data) {
  return new Promise(function (resolve, reject) {
    iplist.updateOne({ _id: data.deviceinfo.ipaddress },
      { $set: { processno: data.processno, processname: data.processname } }, function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log("result " + err);
        } else {
          console.log("setipprocess ");
          resolve(data);
        }
      });

  });
}

function getiplist4(data) {
  // ループ処理の完了を受け取るPromise
  var dat = [];
  return new Promise(function (resolve, reject) {
    iplist.find({ devicetype: 1 }, function (err, docs) {
      if (err) {
        reject(err);
      } else {
        data.retdata = docs
        resolve(data);
      }
    });
  });
}

function setlastpart(data) {
  // ループ処理の完了を受け取るPromise
  return new Promise(function (res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length - 1;
    var rows = [];
    var currentx = 0;
    var currenty = 0;
    var sizew = 2;
    var sizeh = 2;
    var picex = 10;
    function loop(i) {
      //     // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        var cls = ""

        if (data.retdata[i].signalflg == 0) {
          cls = "nomalclass";
        } else if (data.retdata[i].signalflg == 1) {
          cls = "blueclass";
        } else if (data.retdata[i].signalflg == 2) {
          cls = "orangeclass";
        } else if (data.retdata[i].signalflg == 3) {
          cls = "redclass";
        }
        //{"x":0,"y":0,"w":2,"h":2,"i":"0"},
        var row = {
          "x": currentx,
          "y": currenty,
          "w": sizew,
          "h": sizeh,
          "i": i.toString(),
          "workername": data.retdata[i].worker[0].workername || "-",
          "processname": data.retdata[i].processname || "-",
          "modelname": data.retdata[i].modelname || "-",
          "ipaddress": data.retdata[i].ipaddress,
          "class": cls
        }

        if (currentx == picex) {
          currentx = 0;
          currenty += sizeh;
        } else {
          currentx += sizew;
        }

        rows.push(row);

        resolve(i + 1);

      })

        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
           // console.log(JSON.stringify(rows));
            data.retdata = rows
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

//端末工程NO更新///////////////////////////////////////  
function setipworker(data) {
  return new Promise(function (resolve, reject) {
    iplist.update({ _id: data.ipaddress },
      { $set: { worker: data.worker } }, function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log("result " + err);
        } else {
          console.log("process update ");

          resolve(data);

        }
      });

  });
}

function getpclist(data) {
  return new Promise(function (resolve, reject) {

    iplist.find({ devicetype: 2 }, function (err, docs) {
      if (err) {
        // console.log('func_workid_update Error!');
        reject(console.log('setassysn! ' + err));
        throw err;
      }
    //  console.log("getpclist " + JSON.stringify(docs));
      data.devicelist = docs
      resolve(data)
    });
  });
}

//端末工程NO更新///////////////////////////////////////  
function setipstatus(data) {
  return new Promise(function (resolve, reject) {
    iplist.update({ _id: data.ipaddress },
      { $set: { signalflg: data.value } }, function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log("result " + err);
        } else {
        //  console.log("process update ");

          var cls = ""

          if (data.value == 0) {
            cls = "nomalclass";
          } else if (data.value == 1) {
            cls = "blueclass";
          } else if (data.value == 2) {
            cls = "orangeclass";
          } else if (data.value == 3) {
            cls = "redclass";
          }

          data.field = "class";
          data.value = cls;
       //   console.log("setipstatus " + JSON.stringify(data));
          resolve(data);

        }
      });

  });
}

function gettimes(data) {
  return new Promise(function (resolve, reject) {
   // console.log("find :" + data.ipaddress)
    times.find({
      $and: [{ "deviceinfo.ipaddress": data.ipaddress },
      { startdate: { "$gt": new Date(data.start) } },
      { startdate: { "$lt": new Date(data.end) } },
      { updateflg: { "$gt": -1 } }]
    }, function (err, docs) {
      if (err) {
        // console.log('func_workid_update Error!');
        reject(console.log('setassysn! ' + err));
        throw err;
      }
   //   console.log("getpclist " + JSON.stringify(docs));
      data.retdata = docs
      resolve(data)
    });
  });
}

function setganttdata(data) {
  // ループ処理の完了を受け取るPromise
  return new Promise(function (res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length - 1;
    var rows = [];
    var array = {
      "rows": [],
      "legendHelp": "Help"
    };
    function loop(i) {
      //     // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        //   console.log("rowdata: " + JSON.stringify(data.retdata[i]));
        var title = "";
        var cl = ""
        if (data.retdata[i].readyflg == 0) {
          title = "生産作業";
          var cl = "#ff7f50"
        } else {
          title = "準備作業";
          var cl = "#6090ef"
        }
        var dat = {
          "name": data.retdata[i]._id,
          "link": "#" + i,
          "values": [
            {
              "desc": title,
              "from": new Date(data.retdata[i].startdate).getTime(),
              "to": new Date(data.retdata[i].enddate).getTime(),
              "color": cl
            }
          ]
        }

        array.rows.push(dat);
        resolve(i + 1);
      })

        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            data.retdata = array
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

function setganttdata_dhk(data) {
  // ループ処理の完了を受け取るPromise
  return new Promise(function (res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length - 1;
    var array = {
      "data": [],
      "links": []
    };

    function loop(i) {
      //     // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        //   console.log("rowdata: " + JSON.stringify(data.retdata[i]));
        //{id: 1, text: 'Task #1', start_date: '15-04-2017', duration: 3, progress: 0.6},
        if (en > 0) {
          var dat = {
            id: i + 1,
            text: data.retdata[i].modelname,
            text2: data.retdata[i].ornerid,
            start_date: addDaystr(data.retdata[i].startdate),
            end_date: addDaystr(data.retdata[i].enddate),
            progress: 0,
            duration: 0,
          }

          array.data.push(dat);
          resolve(i + 1);
        } else {
          resolve(i + 1);
        }
      })

        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            data.retdata = array
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


function getcustomer(data) {
  // ループ処理の完了を受け取るPromise
  return new Promise(function (resolve, reject) {
    plans.aggregate([{ $match: { $or: [{ start: data.day }, { "splits.start": data.day }] } },
    {
      $group: {
        _id: {
          _customername: "$customername",
          _customerid: "$customerid",
          count: { $sum: 1 }
        }
      }
    },
    { $sort: { _id: 1 } }],
      function (err, docs) {
        if (err) {
          console.log('err' + err);
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
       //   console.log("customerlist:" + JSON.stringify(docs))
          data.customerlist = docs;
          resolve(data);
        }
      });
  });
}

function getplans(data) {
  // ループ処理の完了を受け取るPromise
  //     // 非同期処理なのでPromiseを利用
  // console.log("getplans:" + data.customerid + " " + data.processno + " " + data.start)
  //  var query = { $and: [{ "customerid": data.customerid }, { "processno": data.processno }, { "splits.start": data.start }, { "splits.flg": 1 }] }
  var query = { $and: [{ "splits.start": data.start }, { "splits.flg": 1 }] }
  return new Promise(function (resolve, reject) {
    plans.aggregate([{ $unwind: '$splits' },
    { $match: query },
    {
      $group: {
        _id: {
          _start: "$splits.start",
          _number: "$splits.number",
          //  _worker: "$splits.worker",
          //  _duration: "$splits.duration",
          //     _worktime:"$splits.worktime",
          //     _flg:"$splits.flg", 
          _processno: "$processno",
          _processname: "$processname",
          //     _setting: "$setting",
          _planid: "$splits.planid",
          _fllowid: "$fllowid",
          _flg2: "$flg",
          _modelname: "$modelname",
          _customerid: "$customerid",
          _customername: "$customername",
          _workers: "$workers"
        },
        _production: { $min: "$production" }
      }
    },
    { $sort: { _id: 1 } }],
      function (err, docs) {
        if (err) {
          // console.log('func_workid_update Error!');
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
          console.log(docs.length);
          if (docs.length > 0) {
         //   console.log("getplans--:" + JSON.stringify(docs))
            var ret = [];
            for (var i in docs) {
              for (var s in docs[i]._id._workers) {
                if (data.workerid == docs[i]._id._workers[s]._id._workerid) {
                  ret.push(docs[i])
                }
              }
            }

            data.retdata = ret;
            //  data.retdata = docs;
          }
      //    console.log("resolve:" + JSON.stringify(docs))
          resolve(data);
        }
      });
  });
}

function set_branch(data) {

  return new Promise(function (res, rej) {

    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

     //   console.log("set_branch4:" + data.retdata)
        if (data.retdata != "") {
          branchs.find({ _id: data.retdata[i]._id._fllowid }, function (err, docs) {

            if (err) {
              console.log('get_branch Error!');
              reject(console.log('branch! ' + err));
              throw err;
            } else {
              data.retdata[i]._fllowdata = docs[0];
              //   console.log('branch! '+ JSON.stringify(docs[0]));
            }
            resolve(i + 1);
          });
        } else {
          data.retdata = [];
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

function set_plans(data) {

  return new Promise(function (res, rej) {

    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

     //   console.log("set_branch3:" + JSON.stringify(data))
        if (data.retdata.length > 0) {
          plans.find({ $and: [{ fllowid: data.retdata[i]._id._fllowid }, { processno: data.retdata[i]._id._processno }, { start: data.retdata[i]._id._start }] }, function (err, docs) {
            if (err) {
              reject(err);
            } else {
              data.retdata[i]._plans = docs;
            }
            resolve(i + 1);
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

function getprocess(data) {
  // ループ処理の完了を受け取るPromise
  return new Promise(function (resolve, reject) {
    plans.aggregate([{ $match: { customerid: data.customerid } },
    {
      $group: {
        _id: {
          _sortno: "$sortno",
          _processnoid: "$processno",
          _processnoname: "$processname",
          count: { $sum: 1 }
        }
      }
    },
    { $sort: { _id: 1 } }],
      function (err, docs) {
        if (err) {
          console.log('err' + err);
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
      //    console.log("customerlist:" + JSON.stringify(docs))
          data.customerlist = docs;
          resolve(data);
        }
      });
  });
}

function gettasklist(data) {
  return new Promise(function (resolve, reject) {
    plans.find({ _id: data.id }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        resolve(docs);
      }
    });
  });
}

function settasklist(data) {
  return new Promise(function (res, rej) {
  //  console.log("update2 " + data.id);
    data.value = parseInt(data.value);
    plans.updateOne({ _id: data.id }, { $push: { tasks: data } }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
     //   console.log("update " + JSON.stringify(result));
        data.data;
      }
      res(result);
    });
  })
}

function updatetasklist(data) {
  return new Promise(function (res, rej) {
  ////  console.log("update2 " + data.id);
    data.value = parseInt(data.value);
    plans.updateOne({ _id: data.ornerid, "tasks.id": data.id }, { $set: { "tasks.$": data } }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
     //   console.log("update4 " + JSON.stringify(result));
      }
      res(data);
    });
  })
}

function gettaskvalue(data) {
  // ループ処理の完了を受け取るPromise
 // console.log("gettaskvalue:" + JSON.stringify(data));
  return new Promise(function (resolve, reject) {
    plans.aggregate([{ $unwind: '$tasks' },
    { $match: { $and: [{ _id: data.ornerid }] } },
    {
      $group: {
        _id: null,
        _values: { $sum: "$tasks.value" }
      }
    }],
      function (err, docs) {
        if (err) {
          console.log('err' + err);
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
    //     console.log("gettaskvalue return:" + JSON.stringify(docs));
          if (docs.length > 0) {
            data.return = docs[0];
          } else {
            data.return = { _value: 0};
          }
          resolve(data);
        }
      });
  });
}

function settaskvalue(data) {
  // ループ処理の完了を受け取るPromise
 // console.log("ornerid:" + JSON.stringify(data));
  return new Promise(function (res, rej) {
    plans.updateOne({ _id: data.ornerid }, { $set: { production: data.return._values, flg: 0 } }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
    //    console.log("update " + JSON.stringify(result));
      }
      res(data);
    });

  });
}

function gettasklist2(data) {
  return new Promise(function (resolve, reject) {
  //  console.log("id:" + data.ornerid);
    plans.find({ _id: data.ornerid }, function (err, docs) {
      if (err) {
        console.log('get_branch Error!');
        reject(console.log('branch! ' + err));
        throw err;
      } else {
        resolve(docs);
      }
    });
  });
}

function gettasklist4(data) {
  // ループ処理の完了を受け取るPromise
  //     // 非同期処理なのでPromiseを利用
 // console.log("gettasklist3:" + JSON.stringify(data))
  var ft = {};
  /* if (data.processno > 0) {
     ft = { processno: parseInt(data.processno) };
   }*/
  //console.log("filter:" + JSON.stringify(parseInt(data.processno)))
  //var query = { $and: [{ fllowid: data.fllowid }, { processno: parseInt(data.processno) }, { "tasks.planid": parseInt(data.planid) }] }
  //var query1 = { "tasks.planid": parseInt(data.planid) };
  var query2 = ""
  if (data.planid == -1) {
    if (data.processno==0) {
      query2 = { $and: [{ fllowid: data.fllowid }, { "splits.flg": 1 }] }
    } else {
      query2 = { $and: [{ fllowid: data.fllowid }, { processno: parseInt(data.processno) }, { "splits.flg": 1 }] }
    }
  } else {
    query2 = { $and: [{ fllowid: data.fllowid }, { processno: parseInt(data.processno) }, { "splits.flg": 1 }, { "splits.planid": parseInt(data.planid) }] }
  }
  return new Promise(function (resolve, reject) {
    plans.aggregate([
      { $unwind: '$splits' },
      { $match: query2 },
      {
        $group: {
          _id: {
            _sort: "$sortno",
            _start: "$splits.start",
            _number: "$splits.number",
            _worker: "$splits.worker",
            _duration: "$splits.duration",
            _worktime: "$splits.worktime",
            _flg: "$splits.flg",
            _processno: "$processno",
            _processname: "$processname",
            _setting: "$setting",
            _planid: "$splits.planid",
            _fllowid: "$fllowid",
            _flg2: "$flg",
            _modelname: "$modelname",
            _customername: "$customername",
            _customerid: "customerid",
            _taskstart: "$taskstart",
            _production: "$production",
            _checkname: "$checkname",
            _ornerid: "$_id",
            _selected: "$selected",
            _tasks: "$tasks",
            _workers: "$workers",
            _color: "$color",
            _ipaddress: data.ipaddress
          }
        }
      },
      { $sort: { _id: 1 } }],
      function (err, docs) {
        if (err) {
          // console.log('func_workid_update Error!');
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
       //   console.log("getplans4----------------:" + JSON.stringify(docs))
          if (docs.length > 0) {
            //   console.log("getplans4:" + JSON.stringify(docs))
            data.retdata = docs;
          } else {
            data.retdata = [];
          }
          resolve(data)
        }
      });
  });
}

function settasklist4(data) {

  return new Promise(function (res, rej) {
    //console.log("settasklog:" + JSON.stringify(data))
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

        if (data.retdata.length > 0) {
          var production = 0;
          for (var t in data.retdata[i]._id._tasks) {
            if (data.retdata[i]._id._planid == data.retdata[i]._id._tasks[t].planid) {
              production += data.retdata[i]._id._tasks[t].value;
            }
          }
          data.retdata[i]._id._tasks = null;
          data.retdata[i]._id._production = production;
        }
        resolve(i + 1);

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

function setworkername(data) {

  return new Promise(function (res, rej) {
   // console.log("settasklog:" + JSON.stringify(data))
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

        if (data.retdata.length > 0) {
          var worker = "";
          for (var t in data.retdata[i]._id._workers) {
            worker += data.retdata[i]._id._workers[t]._id._workername + " ";
          }
        }
        data.retdata[i]._id._workername = worker;
        resolve(i + 1);

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

function gettasklist3(data) {
  // ループ処理の完了を受け取るPromise
  //     // 非同期処理なのでPromiseを利用
 // console.log("gettasklist3:" + JSON.stringify(data))
  var query = { $and: [{ _id: data.ornerid }, { "splits.planid": parseInt(data.planid) }, { "splits.flg": 1 }] }
  return new Promise(function (resolve, reject) {
    plans.aggregate([{ $unwind: '$splits' },
    { $match: query },
    {
      $group: {
        _id: {
          _start: "$splits.start",
          _number: "$splits.number",
          _worker: "$splits.worker",
          _duration: "$splits.duration",
          _worktime: "$splits.worktime",
          _flg: "$splits.flg",
          _processno: "$processno",
          _processname: "$processname",
          _setting: "$setting",
          _planid: "$splits.planid",
          _fllowid: "$fllowid",
          _flg2: "$flg",
          _modelname: "$modelname",
          _customername: "$customername",
          _taskstart: "$taskstart",
          _production: "$production",
          _checkname: "$checkname",
          _ornerid: "$_id",
          _selected: "$selected",
          _tasks: "$tasks"
        }
      }
    },
    { $sort: { _id: 1 } }],
      function (err, docs) {
        if (err) {
          // console.log('func_workid_update Error!');
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
      //    console.log(docs.length);
          if (docs.length > 0) {
            //  console.log("getplans:" + JSON.stringify(docs))
            data.retdata = docs;
          }
          resolve(data)
        }
      });
  });
}

function setdoneqty(data) {
  // ループ処理の完了を受け取るPromise
  //     // 非同期処理なのでPromiseを利用
 // console.log("setdoneqty:" + JSON.stringify(data))

  var tid = data.ornerid.split("-");
  var fllowid = tid[0] + "-" + tid[1];

  var query = { fllowid: fllowid };
  return new Promise(function (resolve, reject) {
    plans.aggregate([
      { $match: query },
      {
        $group: {
          _min: { $min: "$production" }
        }
      },
      { $sort: { _id: 1 } }],
      function (err, docs) {
        if (err) {
          // console.log('func_workid_update Error!');
          reject(console.log('workerid! ' + err));
          throw err;
        } else {
        //  console.log(docs.length);
          if (docs.length > 0) {
            //  console.log("getplans:" + JSON.stringify(docs))
            data.retdata = docs;
          }
          resolve(data)
        }
      });
  });
}

function removetasklist(data) {
  //?id=' + id + "&day=" + day + "&duration=" + duration + "&number=" + number) 
  //console.log("settasksplit:" + JSON.stringify(data));
  return new Promise(function (resolve, reject) {
    plans.updateOne({ _id: data.ornerid },
      { $pull: { tasks: { id: data.id } } }, function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log("error " + err);
        } else {
          resolve(data);
        }
      });

  })
}

function set_iplist2(data) {
  /*
      $group: {
        _id: {
          _sort: "$sortno",
          _start: "$splits.start",
          _number: "$splits.number",
          _worker: "$splits.worker",
          _duration: "$splits.duration",
          _worktime: "$splits.worktime",
          _flg: "$splits.flg",
          _processno: "$processno",
          _processname: "$processname",
          _setting: "$setting",
          _planid: "$splits.planid",
          _fllowid: "$fllowid",
          _flg2: "$flg",
          _modelname: "$modelname",
          _customername: "$customername",
          _taskstart: "$taskstart",
          _production: "$production",
          _checkname: "$checkname",
          _ornerid: "$_id",
          _selected: "$selected",
          _ipaddress: data.ipaddress
  */

  return new Promise(function (res, rej) {

    // console.log("set_iplist:" + JSON.stringify(data))
    if (data.retdata.length > 0) {
      iplist.updateMany({ _id: data.retdata[0]._id._ipaddress },
        {
          $set: {
            fllowstr: data.retdata[0]._id._fllowid,
            modelname: data.retdata[0]._id._modelname,
            processno: data.retdata[0]._id._processno,
            processname: data.retdata[0]._id._processname,
            customerid: data.retdata[0]._id._customerid,
            customername: data.retdata[0]._id._customername,
            checkname: data.retdata[0]._id._checkname
          }
        }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
            //console.log("update " + JSON.stringify(result));             
          }
          res(data);
        });
    } else {
      res(data);
    }
  })
}

function settasklog(data) {

  return new Promise(function (res, rej) {
  //  console.log("settasklog:" + JSON.stringify(data))
    var en = data.senddata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

        iplist.updateOne({ _id: data.ipaddress }, { $push: { tasks: data.senddata[i] } }, function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
        //    console.log("update " + JSON.stringify(result));
          }
          resolve(i + 1);
        });
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

function deltasklog(data) {
  return new Promise(function (res, rej) {
    iplist.updateOne({ _id: data.ipaddress }, { $pull: { tasks: { "_id._ornerid": data.ornerid } } }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
     //   console.log("update " + JSON.stringify(result));
      }
      res(data);
    });
  })
}

function deltasklog2(data) {
  return new Promise(function (res, rej) {
    iplist.updateOne({ _id: data.ipaddress }, { $set: { tasks: [] } }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
     //   console.log("update " + JSON.stringify(result));
      }
      res(data);
    });
  })
}

function setinvent(data) {
  return new Promise(function (res, rej) {
      invent.updateOne({ _id: data._id }, { $set: data }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
         //   console.log("update " + JSON.stringify(result));
          }
          res(data);
      });
  })
}

function checkinvent(data) {
  return new Promise(function (res, rej) {
      invent.updateOne({ _id: data.id }, { $set: { check: data.check} }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
         //   console.log("update " + JSON.stringify(result));
          }
          res(data);
      });
  })
}

function group_process(arr) {
  //   console.log(JSON.stringify("arr " + JSON.stringify(arr)));
  var group = arr.reduce(function (result, current) {
    var element = result.find(function (p) {
      return p.processno === current.processno //p.mcname === current.mcname && p.stageno === current.stageno && p.posno === current.posno && p.partno === current.partno
      //  return p.mcname === current.mcname && p.stageno === current.stageno && p.groupkey === current.groupkey && p.posno === current.posno && p.partno === current.partno
    });
    if (element) {
      element.count++; // count
      element.processname = current.processname2; // sum
      //  element.partno = current.partno;
    } else {
      result.push({
        processno: current.processno,
        processname: current.processname2,
      });
    }
    return result;
  }, []);
  return group;
}

function main3_reader(data) {

    return new Promise(function(resolve, reject) { 
   //1     sql.connect(config, function (err) {
            var request = new sql.Request();
          //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
           // console.log("sql " + str);
           request.query("SELECT id,機種id,機種名,[order],台数,顧客名1 as 顧客名 FROM PHP_生産計画管理 WHERE id = '" + data.fllowid + "'", function (err, recordset) {
         //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
          //  request.query(str, function (err, recordset) {
            //   console.log("test " + JSON.stringify(recordset));
              /*  if (recordset.recordsets[0].length == 0) {
                    reject(console.log('NODATA'));  
                } else {*/
 
                  if (err) {
                    // console.log(err);
                //1     sql.close();
                     reject(console.log("Error: " + err));  
                  } else {   
                  //    data.logs=recordset;
               //1   sql.close();
                   if (recordset.recordsets[0].length > 0) {
                   //   console.log("recordset " + JSON.stringify(recordset))
                      recordset.recordsets[0][0].code=data.code;
                      resolve(recordset.recordsets[0][0]); 
                     } else  {

                      resolve({});
                     }
                   } 
             //    }
               });
          }); 
     //1  }); 
 }

 function main3_customer(data) {

  return new Promise(function(resolve, reject) { 
  //1    sql.connect(config, function (err) {
          var request2 = new sql.Request2();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
         // console.log("sql " + str);
         request2.query("SELECT 顧客名 as customername FROM 顧客リスト order by 顧客名", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
           //1        sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
           //1     //    data.logs=recordset;
           //1   sql.close();
                 if (recordset.recordsets[0].length > 0) {
                  //  console.log("recordset " + JSON.stringify(recordset))
                    resolve(recordset.recordsets[0]); 
                   } else  {

                    resolve({});
                   }
                 } 
           //    }
             });
        }); 
   //1  }); 
}

function main3_model(data) {

  return new Promise(function(resolve, reject) { 
  //1   sql.connect(config, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
         // console.log("sql " + str);
         request.query("SELECT 顧客名 as customername, 機種名 as modelname FROM PHP_機種名一覧 where 顧客名 = '" + data.customerid + "' order by 機種名", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
            //1       sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
            //1    sql.close();
                 if (recordset.recordsets[0].length > 0) {
                 //   console.log("recordset " + JSON.stringify(recordset))
                    resolve(recordset.recordsets[0]); 
                   } else  {

                    resolve({});
                   }
                 } 
           //    }
             });
        }); 
   //1  }); 
}

function main2_pcbinfo(data) {

  return new Promise(function(resolve, reject) { 
   //1   sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
         // console.log("sql " + str);
         request.query("SELECT ETS1 as fllowid FROM T_PCBLABEL_PRG WHERE pid = '" + data.pcbserial + "'", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
           //1        sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
          //1      sql.close();
                 if (recordset.recordsets[0].length > 0) {
                 //   console.log("recordset " + JSON.stringify(recordset))
                    data.fllowid = recordset.recordsets[0][0].fllowid;
                    resolve(data); 
                   } else  {

                    resolve({});
                   }
                 } 
           //    }
             });
        }); 
   //1  }); 
}

 function setinventdata(data) {
    return new Promise(function (res, rej) {

        var log = new invent(data);
        //データベースに保存。
         log.save(function(err){
           if(err){ rej(err); }
             res(data); 
          });         
    })
  }

  function setinventsum(data) {

    return new Promise(function (resolve, reject) {
  
    //  console.log("times.aggregate!" + JSON.stringify(data));
        
      invent.aggregate([
        { $match: { fllowid: parseInt(data.id)} },
        {
          $group: {
            _id: {
              _fllowid: "$fllowid",
            },
            _sum: { $sum: "$qty" }
          }
        }],
        function (err, docs) {
          if (err) {
            console.log('getworklog Error!');
            reject(console.log('getworklog! ' + err));
            throw err;
          } else {
           //     console.log("times.aggregate2!" + JSON.stringify(docs));
            if (docs.length > 0) {
              data.sum= docs[0]._sum;
            } else {
                data.sum= "0";
            }
          }
          resolve(data);
        });
  
    })
  } 

  function getinvent(data){
    // ループ処理の完了を受け取るPromise
  // console.log("getinvent:" + invent)
   return new Promise(function(resolve, reject) { 
      // ループ処理（再帰的に呼び出し）

      var tmp = "000" + data.inventno;
      var no = tmp.substr(tmp.length-3,3)

      var query  = { $and: [{ "workday" : { "$gt" : new Date(data.starttime), "$lt" : new Date(data.lasttime) } }, { inventno: no }] };
            invent.find(query, function(err, docs) {     
                if (err) {
                reject(err);  
                } else {     
                  if (docs.length > 0) {
                    data.retdata = docs; 
                  } else {
                    data.retdata = []; 
                  }
             //  console.log("docs:" + JSON.stringify(docs))               
                resolve(data);                     
                }    
        }).sort({workday:-1});
               
   });
} 

function getpcblogs(data) {

  return new Promise(function(resolve, reject) { 

    pcbs.find({ _id: data.pcbserial }, function(err, docs) {
        if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('setassysn! '+err)); 
          throw err;
        } else {

          if (docs.length > 0) {  
           //   console.log('getpcblogs! '+ JSON.stringify(docs));

             data.fllowid = docs[0].fllowid;
          } else {
            data.fllowid = 0;
          }           
          // data.ret = docs;     
        } 
        resolve(data)   
    });      
  });
}

function getstock(data) {
  return new Promise(function (resolve, reject) {
   stocks.find({ $and: [{ _id: data.lotid }] }, function (err, docs) {
       if (err) {
         console.log('get_branch Error!');
         reject(console.log('branch! ' + err));
         throw err;
       } else {
         if (docs.length > 0) {
           data.stock = docs[0].stock;
           data.partname = docs[0].partname;     
         } else {
           data.stock = 0;
           data.partname = "---";   
         }
       //  console.log('branch! ' + JSON.stringify(docs));
         resolve(data);
       }
     });
   });
 }


 function setstock22(data) {

  return new Promise(function(resolve, reject) { 
  //1    sql.connect(config2, function (err) {
          var request = new sql.Request();
        //  var str = "select * from Q_PCBLABEL_PRG_NODE where ID > " + parseInt(id)
         console.log("nenbi " + addNenbi() + " lotid " + data.lotid);
         request.query("SELECT * FROM Q_DOWN_LOT_在庫数_CT_SMT_20181108 WHERE NENBI = '" + addNenbi() + "' AND TANA_LOT = " + data.lotid + ";", function (err, recordset) {
       //   request.query("select * from Q_PCBLABEL_PRG_NODE where ID ="+ parseInt(id), function (err, recordset) {
        //  request.query(str, function (err, recordset) {
          //   console.log("test " + JSON.stringify(recordset));
            /*  if (recordset.recordsets[0].length == 0) {
                  reject(console.log('NODATA'));  
              } else {*/

                if (err) {
                  // console.log(err);
               //1    sql.close();
                   reject(console.log("Error: " + err));  
                } else {   
                //    data.logs=recordset;
              //1  sql.close();
                 if (recordset.recordsets[0].length > 0) {

                  console.log("棚在庫:" + recordset.recordsets[0][0].棚在庫);

                    if (recordset.recordsets[0].length > 0) {
                      data.stock = recordset.recordsets[0][0].棚在庫;
                      data.total = recordset.recordsets[0][0].棚卸数;
                      data.partname = recordset.recordsets[0][0].PART_CODE;     
                      data.data = recordset.recordsets[0];
                      data.qtyrangep = recordset.recordsets[0][0].棚在庫 * 1.3;
                      data.qtyrangem = recordset.recordsets[0][0].棚在庫 * 0.7;
                    } else {
                      data.stock = 0;
                      data.total = 0;
                      data.partname = "---";   
                      data.qtyrangep = 0;
                      data.qtyrangem = 0;
                    }    
                 //   console.log("recordset " + JSON.stringify(recordset))
                /*    data.stock = recordset.recordsets[0][0].棚在庫;
                    data.total = recordset.recordsets[0][0].棚卸数;
                    data.partname = recordset.recordsets[0][0].PART_CODE;
                    data.temp = recordset.recordsets[0][0]*/
                    resolve(data); 
                   } else  {

                    resolve(data);
                   }
                 } 
           //    }
             });
        }); 
   //1  }); 
}

function setstock23(data) {
    
  console.log('last--------------: '+JSON.stringify(data));  
   
  return new Promise(function(resolve, reject) {

  //1  sql.connect(config2, function (err) {
        var request = new sql.Request();

        request.input('LOT', sql.Int, parseInt(data.lotid)); 
        request.input('NENBI', sql.VarChar, addNenbi());

            request.execute('Q_DOWN_LOT_在庫数CT_HANDY', function(err, result){
                if (err) {
                console.log("err " + err);
                data.result = "NONE"; 
                resolve(data);
                } else {
                  if (result.recordsets[0] != undefined ) {
                    console.log("output " + JSON.stringify(result)); 
                      data.stock = result.recordsets[0][0].棚在庫;
                      data.total = result.recordsets[0][0].棚卸数;
                      data.partname = result.recordsets[0][0].PART_CODE;     
                      data.data = result.recordsets[0];
                      data.qtyrangep = result.recordsets[0][0].棚在庫 * 1.3;
                      data.qtyrangem = result.recordsets[0][0].棚在庫 * 0.7;
                  } else {
                      data.stock = 0;
                      data.total = 0;
                      data.partname = "---";   
                      data.qtyrangep = 0;
                      data.qtyrangem = 0;
                 }
                resolve(data); 
              }
           });
      }); 
 // });
}

function getpartname(data) {

      return new Promise(function(resolve, reject) {
  
      //1  sql.connect(config2, function (err) {
          var request = new sql.Request();
  
          request.input('BC', sql.VarChar, data.BARCODE);
          request.output('PARTNAME', sql.VarChar);
              request.execute('S_GETPARTNAME', function(err, result){
                  if (err) {
                  console.log("err " + err);
                //  data.result = result.output.output + " NG!"; 
               //1   sql.close();
                  reject(data);
                  } else {
                  console.log("output " + JSON.stringify(result)); 
               //   data.retdata = { partname: result.output.PARTNAME }; 
                  resolve({ partname: result.output.PARTNAME }); 
                  }
  
              });
        }); 
    //1  });
  }

 function settasklog(data) {

  return new Promise(function (res, rej) {
  //  console.log("settasklog:" + JSON.stringify(data))
    var en = data.senddata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {

        iplist.updateOne({ _id: data.ipaddress }, { $push: { tasks: data.senddata[i] } }, function (err, result) {
          if (err) {
            rej(console.log('ftasks! ' + err));
          } else {
        //    console.log("update " + JSON.stringify(result));
          }
          resolve(i + 1);
        });
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

function setflg(data) {
      
  //  console.log('last--------------: '+JSON.stringify(data));  
     
    return new Promise(function(resolve, reject) {

    //1  sql.connect(config2, function (err) {
        var request = new sql.Request();

        request.input('id', sql.Int, parseInt(data.id));
        request.input('flg', sql.Int, data.flg);
        request.output('model', sql.VarChar);
        request.output('week', sql.VarChar);
            request.execute('S_AVIO_PRG_FLG2', function(err, result){
                if (err) {
                console.log("err " + err);
              //  data.result = result.output.output + " NG!"; 
             //1   sql.close();
                reject(data);
                } else {
                console.log("output " + JSON.stringify(result)); 
                data.model = result.output.model; 
                data.week = result.output.week; 
                data.data = result; 
             //1   sql.close();
                resolve(data); 
                }

            });
      }); 
  //1  });
 }
 
 /*
S_PART_INVENT
(
          @LISTID int,
          @LOTID int,
          @PARTNAME varchar(50) output,
          @OUTPUT int,
          @QTY int
 */
function setlotid(data) {
    
    console.log('last--------------: '+JSON.stringify(data));  
     
    return new Promise(function(resolve, reject) {

    //1  sql.connect(config2, function (err) {
          var request = new sql.Request();

          request.input('LISTID', sql.Int, parseInt(data.listid));
          request.input('LOTID', sql.Int, parseInt(data.lotid)); 
          request.input('QTY', sql.Int, parseInt(data.qty));                    
          request.output('PARTNAME', sql.VarChar);
          request.output('OUTPUT', sql.Int);

              request.execute('S_PART_INVENT', function(err, result){
                  if (err) {
                  console.log("err " + err);
                  data.result = "NONE"; 
                  resolve(data);
                  } else {
                  console.log("output " + JSON.stringify(result)); 
                  data.partname= result.output.PARTNAME; 
                  resolve(data); 
                  }

              });
          }); 
   //1 });
 }


 function print_label(data) {
  return new Promise(function (resolve, reject) {
    if (data.wprinter.indexOf('.') != -1) {
        var HOST = data.wprinter; // sato_printer;
        var PORT = 1024;
        var net = require('net');
        var client = new net.Socket();
        var esc = String.fromCharCode(27);
        // var str = data.pcbid + "," + data.modelno + "," + data.no;

        client.connect(PORT, HOST, function () {
          //104250*12345*
          client.write(esc + 'A');
          // client.write(esc + '%0' + esc + 'V0020' + esc + 'H0080' + esc + '2D30,L,03,1,0' + esc + 'DS' + data.partname + '(' + data.total + ')');
          client.write(esc + '%0' + esc + 'V0020' + esc + 'H0080' + esc + 'P01' + esc + 'L0203' + esc + 'X20,' + addToday());
          client.write(esc + '%0' + esc + 'V0050' + esc + 'H0080' + esc + 'P01' + esc + 'L0203' + esc + 'X20,STAFF:' + data.worker.workerid);
          client.write(esc + '%0' + esc + 'V0080' + esc + 'H0080' + esc + 'P01' + esc + 'L0203' + esc + 'X20,QTY:' + data.qty);
          client.write(esc + '%0' + esc + 'V0110' + esc + 'H0150' + esc + 'P01' + esc + 'L0304' + esc + 'X20,' + '*' + toForeDigits(data.inventid) + '*');
          client.write(esc + '%0' + esc + 'V0140' + esc + 'H0090' + esc + 'B102070*' + toForeDigits(data.inventid) + '*');
          client.write(esc + 'Q1');
          client.write(esc + 'Z');

          console.log("connect--")
          client.destroy();
          //  var no = parseInt(data.no);
          data.flg = 1;
          data.msg = "印刷出来ました! ";
          resolve(data);
          //   client.close();
        });

        // クライアント側ソケットの'data'イベントハンドラーを定義します。
        // dataはサーバーがこのソケットに送信した内容になります。
        client.on('data', function (data) {
          console.log('DATA: ' + data);
          // Close the client socket completely
          //   client.destroy();
        });
        // クライアント側'close' イベントハンドラーを定義します
        client.on('close', function (err) {
          console.log('Connection closed' + err);
          client.destroy();
        });

        // クライアント側'close' イベントハンドラーを定義します
        client.on('error', function (err) {
          console.log('error:' + err);
          client.destroy();
          data.msg = "プリンタに接続できませんでした"
          reject(data)
        });
      } else {
        resolve(data); 
      }
  });
}


function print_partlabel(data) {
  return new Promise(function (resolve, reject) {
    if (data.wprinter.indexOf('.') != -1) {
        var HOST = data.wprinter; // sato_printer;
        var PORT = 1024;
        var net = require('net');
        var client = new net.Socket();
        var esc = String.fromCharCode(27);
        var qty = parseInt(data.qty);
        // var str = data.pcbid + "," + data.modelno + "," + data.no;
        /*
sendstr += esc + "%0" + esc + "V0020" + esc + "H0080" + esc + "2D30,L,03,1,0" + esc + "DS" + serial;
sendstr += esc + "%0" + esc + "V0020" + esc + "H0180" + esc + "P01" + esc + "L0304" + esc + "X20," + qty;
sendstr += esc + "%0" + esc + "V0120" + esc + "H0080" + esc + "P01" + esc + "L0203" + esc + "X20," + worker;
sendstr += esc + "%0" + esc + "V0160" + esc + "H0080" + esc + "P01" + esc + "L0203" + esc + "X20," + getNowDate();
        */
         
        client.connect(PORT, HOST, function () {
          //104250*12345*
          client.write(esc + 'A');
          // client.write(esc + '%0' + esc + 'V0020' + esc + 'H0080' + esc + '2D30,L,03,1,0' + esc + 'DS' + data.partname + '(' + data.total + ')');
         // client.write(esc + '%0' + esc + 'V0020' + esc + 'H0080' + esc + '2D30,L,03,1,0' + esc + 'DS' + toFiveDigits(qty));
          client.write(esc + '%0' + esc + 'V0020' + esc + 'H0085' + esc + 'B102040*' + toFiveDigits(qty) + '*');
          client.write(esc + '%0' + esc + 'V0070' + esc + 'H0160' + esc + 'P01' + esc + 'L0304' + esc + 'X20,' + qty);
          client.write(esc + '%0' + esc + 'V0120' + esc + 'H0080' + esc + 'P01' + esc + 'L0203' + esc + 'X20,' + data.worker.workerid);
          client.write(esc + '%0' + esc + 'V0160' + esc + 'H0080' + esc + 'P01' + esc + 'L0203' + esc + 'X20,' + addToday());
          client.write(esc + 'Q1');
          client.write(esc + 'Z');

          console.log("connect--")
          client.destroy();
          //  var no = parseInt(data.no);
          data.flg = 1;
          data.msg = "印刷出来ました! ";
          resolve(data);
          //   client.close();
        });

        // クライアント側ソケットの'data'イベントハンドラーを定義します。
        // dataはサーバーがこのソケットに送信した内容になります。
        client.on('data', function (data) {
          console.log('DATA: ' + data);
          // Close the client socket completely
          //   client.destroy();
        });
        // クライアント側'close' イベントハンドラーを定義します
        client.on('close', function (err) {
          console.log('Connection closed' + err);
          client.destroy();
        });

        // クライアント側'close' イベントハンドラーを定義します
        client.on('error', function (err) {
          console.log('error:' + err);
          client.destroy();
          data.msg = "プリンタに接続できませんでした"
          reject(data)
        });
      } else {
        resolve(data); 
      }
  });
}

function getinventid(data) {
  return new Promise(function(resolve, reject) { 
     console.log("save!:" + JSON.stringify(data))

    record.findOneAndUpdate({ _id: "inventid" },
         { $inc: { record: 1 }},
         {upsert: true, new: true },function(err,result){
// マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
                console.log("error " + err);
            } else {
              console.log("getsplitid"+ JSON.stringify(result));
              data.inventid = result.record  
              
              if (data.inventid==9999) {
                record.findOneAndUpdate({ _id: "inventid" },
                    { $set: { record: 1 }},
                    {upsert: true, new: true },function(err,result){
          // マッチしたドキュメントが docs[i].doc で取れる
                  if (err) {
                      console.log("error " + err);
                  } else {
                    data.inventid = result.record       
                    resolve(data);
                  }
                });
              } else {
                resolve(data);
            }
          }
      }); 
  })
}



function print_outlabel(data) {
  return new Promise(function (resolve, reject) {

    var v_off = 30; 
    var pos_v1 = v_off; //1行目
    var pos_v2 = v_off + 37; //2行目
    var pos_v3 = v_off + 87; //3行目
    var pos_v4 = v_off + 95; //4行目
    var pos_v5 = v_off + 130; //3行目
    var pos_v6 = v_off + 150; //3行目
    var pos_v7 = v_off + 190; //4行目
    var pos_v8 = v_off + 220; //3行目

    var h_off = 500;
    var pos_h1 = h_off; //左端
    var pos_h2 = h_off + 470; //QTY
    var pos_h3 = h_off + 580; //QTY

    if (data.wprinter.indexOf('.') != -1) {
        var HOST = "";//data.wprinter; // sato_printer;
        var PORT = 1024;
        var net = require('net');
        var client = new net.Socket();
        var esc = String.fromCharCode(27); 
        // var str = data.pcbid + "," + data.modelno + "," + data.no;

        client.connect(PORT, HOST, function () {
          //104250*12345*
          client.write(esc + 'A');


//          sEditWK = sEditWK & Chr(&H1B) & "PS" & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh1, "0000") & Chr(&H1B) & "P05" & Chr(&H1B) & "L0101"
//           sEditWK = sEditWK & Chr(&H1B) & "X22," & DAYS & " " & staff & " " & carr       
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v1) + esc + 'H' + zero4(pos_h1) + esc + 'P01' + esc + 'L0101' + esc + 'X22,' + data.day + " " + data.staff);

//         sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh2, "0000") & Chr(&H1B) & "P05" & Chr(&H1B) & "L0102"
//         sEditWK = sEditWK & Chr(&H1B) & "X22," & part & "    " & Replace(banch, "M.D.K.A", "P.A.V.O")
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v1) + esc + 'H' + zero4(pos_h1) + esc + 'P05' + esc + 'L0102' + esc + 'X22,' + data.part + "    " + data.address);


//           sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh25, "0000") & Chr(&H1B) & "P05" & Chr(&H1B) & "L0101"
//           sEditWK = sEditWK & Chr(&H1B) & "X22," & Left(part1, 20)
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v6) + esc + 'H' + zero4(pos_h1) + esc + 'P05' + esc + 'L0101' + esc + 'X22,' + data.comment.substr(0,19));

//           sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off + 470, "0000") & Chr(&H1B) & "V" & Format(labelh25 - 20, "0000") & Chr(&H1B) & "P05" & Chr(&H1B) & "L0102"
//           sEditWK = sEditWK & Chr(&H1B) & "X22," & qt  
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v5) + esc + 'H' + zero4(pos_h2) + esc + 'P05' + esc + 'L0102' + esc + 'X22,' + data.qty);

//           sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh3, "0000")
//           sEditWK = sEditWK & Chr(&H1B) & "D102050*" & part & "*" 
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v3) + esc + 'H' + zero4(pos_h1) + esc + 'P05' + esc + 'L0102' + esc + "D102050*" & data.part & "*");
/*
          If minplice <= PLICE And PLICE > 0 Then
            sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh4, "0000") & Chr(&H1B) & "P05" & Chr(&H1B) & "L0101"
            sEditWK = sEditWK & Chr(&H1B) & "X22," & LOT & " " & Format(nc, "000000") & NO & " \" & PLICE
          Else
            sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh4, "0000") & Chr(&H1B) & "P05" & Chr(&H1B) & "L0101"
            sEditWK = sEditWK & Chr(&H1B) & "X22," & LOT & " " & Format(nc, "000000") & NO
          End If
*/
          if (data.price >= 100 && data.price > 0) {
             client.write(esc + '%0' + esc + 'V' + zero4(pos_v7) + esc + 'H' + zero4(pos_h1) + esc + 'P05' + esc + 'L0101' + esc + 'X22,' + data.lot + " " + data.lotid + " " + data.price);
          } else {
             client.write(esc + '%0' + esc + 'V' + zero4(pos_v7) + esc + 'H' + zero4(pos_h1) + esc + 'P05' + esc + 'L0102' + esc + 'X22,' + data.lot + " " + data.lotid);
          }

//         sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off, "0000") & Chr(&H1B) & "V" & Format(labelh5, "0000")
//         sEditWK = sEditWK & Chr(&H1B) & "D102050*" & "3N2-" & Format(rid, "00000") & "-" & Format(nc, "000000") & "-" & Format(qt, "00000") & "*"
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v8) + esc + 'H' + zero4(pos_h1) + esc + 'D102050*' + '3N2-' & zero5(data.reelno) + '-' + zero6(data.lotid) + '*');


//         sEditWK = sEditWK & Chr(&H1B) & "H" & Format(l_off + 580, "0000") & Chr(&H1B) & "V" & Format(labelh35, "0000") & Chr(&H1B) & "2D30,L,04,0,0"
//         sEditWK = sEditWK & Chr(&H1B) & "DS2," & "3N2-" & Format(rid, "00000") & "-" & Format(nc, "000000")
          client.write(esc + '%0' + esc + 'V' + zero4(pos_v4) + esc + 'H' + zero4(pos_h3) + esc + '2D30,L,04,0,0' + esc + 'DS2,' + '3N2-' & zero5(data.reelno) + '-' + zero6(data.lotid));

          client.write(esc + 'Q1');
          client.write(esc + 'Z');

          console.log("connect--")
          
          client.destroy();
          //  var no = parseInt(data.no);
          data.flg = 1;
          data.msg = "印刷出来ました! ";
          resolve(data);
          //   client.close();
        });

        // クライアント側ソケットの'data'イベントハンドラーを定義します。
        // dataはサーバーがこのソケットに送信した内容になります。
        client.on('data', function (data) {
          console.log('DATA: ' + data);
          // Close the client socket completely
          //   client.destroy();
        });
        // クライアント側'close' イベントハンドラーを定義します
        client.on('close', function (err) {
          console.log('Connection closed' + err);
          client.destroy();
        });

        // クライアント側'close' イベントハンドラーを定義します
        client.on('error', function (err) {
          console.log('error:' + err);
          client.destroy();
          data.msg = "プリンタに接続できませんでした"
          reject(data)
        });
      } else {
        resolve(data); 
      }
  });
}

function getmodel(data) {
  // ループ処理の完了を受け取るPromise
    return new Promise(function(resolve, reject) {
        var request = new mssql.Request();    
              var sqlstr="JST_製品名取得2";
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
                      data.productno = data.qrcode1.substr(0,8);
                      data.lotno = data.qrcode1.substr(8,4);
                      data.lotpice = data.qrcode1.substr(8,4);
                      data.modelname = result.output.MODELNAME;   
                      data.msg = data.id;                  
                    }               
                 }
                 resolve(data)  
           })     
  })
}


function savetask(data) {
  return new  Promise(function (res, rej) {

   task2.updateOne({ _id: data._id }, { $set: data }, { upsert: true }, function (err, result) {
      if (err) {
        rej(console.log('ftasks! ' + err));
      } else {
         data.flg = result.ok;
      }
      res(data);
    });
  })
}

function getmclist(data) {
  return new Promise(function(resolve, reject) { 
      mclist.find( { $or: [{ _id: data.scancode },{ mcname: data.scancode }]} , function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          data.machineid = docs[0].mcno;
          data.machinername = docs[0]._id;
          console.log('getmclist:' + JSON.stringify(docs));
          resolve(data)   
      }); 
  });
}

function getmclist2(data) {
  return new Promise(function(resolve, reject) { 
      mclist.find( { $or: [{ mcname: data.scancode },{ mcname: data.scancode }]} , function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          data.machineid = docs[0].mcno;
          data.machinername = docs[0].mcname;
          data.status = docs[0].status;
          console.log('getmclist:' + JSON.stringify(docs));
          resolve(data)   
      }); 
  });
}

function getmodelname(data) {
  return new Promise(function(resolve, reject) { 
    var request = new mssql.Request();    

    console.log("getmodelname:" + data.modelcode);

    var sqlstr="JST_製品名取得";
    request.input('ORDER', mssql.VarChar, data.modelcode);      
    request.output('MODELNAME', mssql.VarChar);           
    request.execute(sqlstr, function(err, result){
       if (err) {
          reject(console.log("err " + err));
       } else { 
          console.log("result:" + JSON.stringify(result))  
          if (result.output.MODELNAME==null || result.output.MODELNAME=="") {
            data.modelname = "";
            data.msg = data.id + " データ無";
          } else {
            data.modelname = result.output.MODELNAME;   
            data.msg = "機種名取得";                  
          }               
       }
       resolve(data)  
 }) 
  });
}

function gettaskdata(data) {
  return new Promise(function(resolve, reject) { 
      tasklist2.find( { productno: data.productno, machineid: data.machineid }, function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          console.log("gettasklist:" + JSON.stringify(docs))
          data.listdata=docs
          resolve(data)   
      }).sort({ timestr: -1}); 
  });
}

function deltaskdata(data) {
  return new Promise(function (res, rej) {
    tasklist2.deleteOne({ _id: data.id }
      , function (err, result) {
        if (err) {
          rej(console.log('ftasks! ' + err));
        } else {
        //   console.log("delete " + JSON.stringify(result));
        }
        res(data);
      });
  })
}

function setstatus2(data) {
  return new Promise(function(resolve, reject) { 

    console.log("setstatus2:" + JSON.stringify(data))

    mclist.updateOne({ mcname: data.machinename }, { $set: { modelname : data.modelname, status : parseInt(data.status), updatetime : new Date()} }, { upsert: false }, function (err, result) {
        if (err) {
          reject(console.log('ftasks! ' + err));
        } else {
        //  socketc.emit("GET_MCLIST", { title: "RET_MCLIST" });
        }
        resolve(data);
      });
    })
}

function setrequest(data) {
  return new Promise(function(resolve, reject) { 

    var headers = {
      'Content-Type':'application/json'
    }

      var options = {
        url: 'http://172.21.229.161:8003/getmclist',
        method: 'GET',
        headers: headers,
        json: true,
        qs: {"title":"RET_MCLIST", "mclist": null}
      }

  request(options, (error, response, body) => {
      // エラーチェック
      if( error !== null ){
        console.error('error:', error);
        reject(data)
      }
      // レスポンスコードとHTMLを表示
   //   console.log('statusCode:', response && response.statusCode);
    //  console.log('body:', body);
      resolve(data)

     });
    })
}

var zero4 = function(num) {
  var ret = ( '0000' + num ).slice( -4 );
 return ret;     
};

var zero5 = function(num) {
  var ret = ( '00000' + num ).slice( -5 );
 return ret;     
};

var zero6 = function(num) {
  var ret = ( '000000' + num ).slice( -6 );
 return ret;     
};


var toDoubleDigits = function (num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
  return num;
};

var toForeDigits = function (num) {
  var ret = ( '0000' + num ).slice( -4 );
  return ret;
};

var toFiveDigits = function (num) {
  var ret = ( '00000' + num ).slice( -5 );
  return ret;
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

  return day + "-" + month + "-" + year + " " + hour + ":" + min + ":" + sec;

}

function addDaystr2(str) {
  var date1 = new Date(str);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return year + "-" + month + "-" + day;

}

function addTimeid() {
    var date1 = new Date();
  
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
    return year + month + day + hour + min + sec;
  
  }

  function getDay2(str,i) {
    var date1 = new Date(str);
    date1.setDate(date1.getDate() + i);  
  //   var off = weekday_offset(date1)  
  //   date1.setDays(date1.getDays() + off); 
     // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒   
    return  year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec; 
  }

  function getDay3(date1,i) {
   // var date1 = new Date(str);
    date1.setDate(date1.getDate() + i);  
  //   var off = weekday_offset(date1)  
  //   date1.setDays(date1.getDays() + off); 
     // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒   
    return  year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec; 
  }

  function addNenbi() {
    var date1 = new Date();
  
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    date1.setDate(date1.getDate() - 15);
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
    return year + month + "01";
  
  }

  function addToday() {
    var date1 = new Date();
  
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = date1.getHours(); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
    return year + "-" + month + "-" + day + " " + hour + ":" + min;
  
  }