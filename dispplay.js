/*///////////////////////////////////////////////////////////////////////////////
 * monitor Mitsuo Andou
 * ver1.0 2017-08-16 初期立ち上げ
////////////////////////////////////////////////////////////////////////////////*/

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

console.log('Version : 1.0');

require('date-utils');

var http_port = 8120;

/* MongoDB *********************************************************************/
require('date-utils');

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://172.21.229.250/planinfo');
//メモのスキーマを宣言。
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

require('mongoose-double')(mongoose);
//メモのスキーマを宣言。
var SchemaTypes = mongoose.Schema.Types;

var ClientSchema = new mongoose.Schema(
    {
        _id:           { type: String, required: true },
        serial:        { type: String, required: true },
        customerid:    { type: Number, min: 0, default: 0 },
        customername:  { type: String, required: true }, 
        fllowid:       { type: Number, min: 0, default: 0 },
        branchstr:     { type: String, required: false }, 
        modelid:       { type: Number, min: 0, default: 0 },   
        modelname:     { type: String, required
          : false },  
        workday:       Date,
        checkday:      Date,
        workerid:      { type: Number, min: 0, default: 0 },
        workername:     { type: String, required: false },  
        tasks:         [],
        details:       [],    
        delivery    :  { type: String, required: false },  
        delibery_flg:  { type: Number, min: 0, default: 0 },  
        check_flg:     { type: Number, min: 0, default: 0 }, 
        pcbserial:     { type: String, required: false },  
        inspection:    { type: Number, min: 0, default: 0 },
        destination:   { type: String, required: false },
        checkworkerid:   { type: Number, min: 0, default: 0 },
        checkworkername: { type: String, required: false },
        comment:      { type: String, required: false },
        lot:           { type: String, required: false },
        ｐroduction_flg: { type: Number, min: 0, default: 0 },
        replace_flg:   { type: Number, min: 0, default: 0 },
        oldassyno:     { type: String, required: false }
    }    
 );
 
 var clients = mongoose.model('clientserials',ClientSchema);

 var PcbSchema = new mongoose.Schema(
    {
     _id:           { type: String, required: true },
     customerid:    { type: Number, min: 0, default: 0 },
     customername:  { type: String, required: true }, 
     fllowid:       { type: Number, min: 0, default: 0 },
     modelid:       { type: Number, min: 0, default: 0 },   
     modelname:     { type: String, required: false },  
     issueday:      Date,
     workerid:      { type: Number, min: 0, default: 0 },
     tasks:         [],
     delivery_flg:  { type: Number, min: 0, default: 0 }    
    }    
 );
 
 var pcbs = mongoose.model('pcblabels',PcbSchema);

//作業者情報/////////////////////////////////////// 
var WorkerSchema = new mongoose.Schema(
     {
      workerid:Number,      
      workername:String
     }      
);
//スキーマからモデルを生成。
var workers = mongoose.model('workerlists',WorkerSchema);

var IpSchema = new mongoose.Schema(
    {
      _id:String,   
      ipaddress:String,
      fllowid:Number,
      branch:Number,
      processno:Number,
      processid:Number,      
      startdate:String,    
      workerid:Number,
      workername:String,
      counter:Number,
      timeshift:String,
      process:[],
      flg:Number,
      workerlist:[],
      deliverydate:String,
      ipdata: []
    }      
);

//スキーマからモデルを生成。
var iplist = mongoose.model('iplists',IpSchema);

var LabelSchema = new mongoose.Schema(
    {
      _id:String,   
      fllowid:Number,
      labelno:Number,
      workday:Date,
      modelname_fllowid: String,
      modelname_label: String,
      flg: Number,
      workerid: Number,
      workername: String
    }      
);

//スキーマからモデルを生成。
var labels = mongoose.model('worklog_deliverylabel',LabelSchema);

//流動表情報///////////////////////////////////////                                    
var LogSchema = new mongoose.Schema(
    {
      _id:             { type: String, required: true },
      fllowid:         { type: Number, min: 0, default: 0 },
      modelid:         { type: Number, min: 0, default: 0 },
      modelname:       { type: String, required: true },
      number:          { type: Number, min: 0, default: 0 }, 
      order:           { type: Number, min: 0, default: 0 }, 
      customerid:     { type: Number, min: 0, default: 0 },
      customername:   { type: String, required: true },
      quantity:         { type: Number, min: 0, default: 1 },
      labelno:         { type: Number, min: 0, default: 0 },   
    }    
);

var logs = mongoose.model('worklogs',LogSchema);

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

var LogSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    fllowid:        { type: Number, min: 0, default: 0 },
    branch:         { type: Number, min: 0, default: 0 },     
    modelid:        { type: Number, min: 0, default: 0 },
    modelname:      { type: String, required: true },
    delivery:       { type: String, required: false },
    start_date:     { type: String, required: false },
    number:         { type: Number, min: 0, default: 0 }, 
    worknumber:     { type: Number, min: 0, default: 0 }, 
    customerid:     { type: Number, min: 0, default: 0 },
    customername:   { type: String, required: true },
    pagecount:      { type: Number, min: 0, default: 0 },
    workdate:       { type: Date, default: Date.now },
    production:     { type: Number, min: 0, default: 0 },
    splitcount:     { type: Number, min: 0, default: 0 },
    data_id:     { type: Number, min: 0, default: 0 }, 
    flg:          { type: Number, min: 0, default: 0 }, 
    tasks:  [],
    plans:  [],
    process: [],
    basicprocess: [],
    splits: [],
    times: [],
    checkinfo: [],
    deviceinfo: [],
    worker: []
  }    
);

var branchs = mongoose.model('worklog_branchs',LogSchema);

var PlanSchema = new mongoose.Schema(
  {
    _id:String,   
    fllowid:String,
    flg:Number,
    customerid:Number,
    customername: String,
    processno:Number,
    checkname: String,
    processname: String,
    modelname: String,
    start:      String,  
    sortno: Number,
    duration:Number,        
    number:Number,
    cycletime:Number,
    worker:Number,
    setting:Number,
    splitid: Number,
    splits: [],
    taskstart: String,
    tasks: [],
    production : 0,
    selected: Boolean
  }      
);

//スキーマからモデルを生成。
var plans = mongoose.model('worklog_plans',PlanSchema);

var modelSchema = new mongoose.Schema(

  {
   _id:String,   
   modelid:Number,
   modelname:String,
   customerid:Number,
   quantity:Number,
   process:[]
  }      
);

//スキーマからモデルを生成。
var model = mongoose.model('models',modelSchema);

var materialSchema = new mongoose.Schema(

  {
    _id:            { type: String, required: true },
    customerid:     { type: Number, min: 0, default: 0 },
    partid:         { type: Number, min: 0, default: 0 },
    partname:       { type: String, required: true },    
    subname:        { type: String, required: false },
    address:        { type: String, required: false },
    standardpice:   {type: SchemaTypes.Double},    
    minpice:        {type: SchemaTypes.Double},
    workpice:       {type: SchemaTypes.Double},
    price:          {type: SchemaTypes.Double},
    division:       []
  }      
);

//スキーマからモデルを生成。
var material = mongoose.model('materiallists',materialSchema);

var DivisionSchema = new mongoose.Schema(
  {_id:String,
   customerid: Number,
   division: Number,
   title: String,
   divisionname: String
}                               
);

var division = mongoose.model('partdivisions',DivisionSchema);

var SettingSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    value:           { type: Number, min: 0, default: 0 },
    comment:         { type: String, required: false },
  }    
);

var setting = mongoose.model('settings',SettingSchema);

//PostgreSQL/////////////////////////////////////// 
/*
var pg = require("pg");
var conString = "pg://postgres:postgres@172.21.229.246:5432/worklogSQL";
var client = new pg.Client(conString);
client.connect();*/

//HTML　Start/////////////////////////////////////// 
var express = require('express');
var server = express();
var http = require('http').Server(server);

//var fs = require('fs');

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
// index.htmlから読み込まれている静的ファイルを送れるようにしておく
server.use(express.static(__dirname));


server.get('/getmcno', function(req, res){
    var ip = req.headers['x-forwarded-for'] || 
       req.connection.remoteAddress || 
       req.socket.remoteAddress ||
       req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", ""); 

    console.log('/getmcno:' + clientIp);   

 req.query.ipaddress = clientIp

 getmcno(req.query)
    .then(getplans)
    .then(setworker)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
      // console.log('send2 '+JSON.stringify(data));  
        res.header('Access-Control-Allow-Origin', '*'); 
        res.send(data);
     }
 
     /* エラー処理 ************************/ 
     
     function onRejected(err) {
         res.send(err);
     } 

}); 

// サーバーをポート3000番で起動
http.listen(http_port, function(){
    console.log('listening on *:'+http_port);
  });

  function getmcno(data) {
    console.log('getmcno:' +JSON.stringify(data));
    return new Promise(function(resolve, reject) { 
      iplist.find({ _id: data.ipaddress }, function(err, docs) {
            if(err) {
                console.log('get_branch Error!');
                reject(console.log('branch! '+err)); 
                throw err;
                } else { 
                var dat = {
                    day: data.day,
                    processno: data.processno,
                    customerid: data.customerid,
                    mclist: docs[0].ipdata,
                    retdata: null
                }    
                resolve(dat);  
                }  
            }); 
        });
  } 

  function getplans(data) {
    // ループ処理の完了を受け取るPromise
   return  new Promise(function(res, rej) {
          
          var query = ({ $and:[{ customerid: parseInt(data.customerid) },{ processno: parseInt(data.processno) }, { "splits.start" : data.day }]})
          console.log("query: " + JSON.stringify(query))
          plans.aggregate([
                {$unwind: '$splits'},
                { $match: query},
                {$group: { _id: { 
                _modelname: "$modelname", 
                _worktime: "$splits.worktime",  
                _qty: "$splits.number",
                _worker: "$workers",    
                }
                }}],
                function(err, docs) {   
                   if(err) {
                    console.log('err' + err);
                      rej(console.log('workerid! '+err)); 
                      throw err;
                    } else {
                      console.log("plans.aggregate: " + JSON.stringify(docs)); 
                      if (docs.length > 0) {
                        data.retdata = docs;
                      } 
                      res(data);  
                    }   
              });
    })
  }  

  function setworker(data) {
    // ループ処理の完了を受け取るPromise
   return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var dat = [];
      var en = data.retdata.length-1;
  
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          
           var dat = {
              modelname: data.retdata[i]._id._modelname,
              qty: data.retdata[i]._id._qty, 
              worktime: data.retdata[i]._id._worktime,  
              worker: "-"           
           }; 
           if (data.retdata[i]._id._worker[0]._id._workername!= undefined ) {         
             dat.worker = data.retdata[i]._id._worker[0]._id._workername;      
           } 
           data.retdata[i] = dat;

           resolve(i+1);         
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

function addDaystr(day) {
    var date1 = new Date(day);

    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 

    return  year + "-" + month + "-" + day + " " + hour + ":" + min; 
}

var toDoubleDigits = function(num) {
    num += "";
    if (num.length === 1) {
      num = "0" + num;
    }
    return num;     
  };
  
function addSaveDay(s) {
    var date1 = new Date();
    // パラメータで取得した日数を加算
    date1.setHours(date1.getHours() + s);
    return  date1 
}

function make_id() {
    var date1 = new Date();

    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 

    return  year + month + day + hour + min +sec; 
}

function  gettoday(str) {
    var date1 = new Date();

    // Date型を（YYYY/MM/DD）形式へ成型して返却
  //  date1.setHours(date1.getHours());
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    
    var dd = year + "-" + month + "-" + day + " " + str;

    //console.log("gettoday " + dd)
    
    return  new Date(dd); 
}

function adddelivery(day) {
    var date1 = new Date(day);

    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 

    return  year + "-" + month + "-" + day; 
}

function today_start() {
    var today4 = new Date();
    today4.setHours(0, 0, 0, 0);
    return today4;
}

function today_last() {
    var today4 = new Date();
    today4.setHours(23, 59, 59, 0);
    return today4;
}