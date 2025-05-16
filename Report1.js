/*///////////////////////////////////////////////////////////////////////////////
 * xray_report Mitsuo Andou
////////////////////////////////////////////////////////////////////////////////*/
var http_port = 8005;

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

/*
mssql.connect(config, function (err) { 
  console.log("SQL Start")
  if (err) {
     console.log("err main3:" + err);
  }
})*/

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
//                              Socket IO
//
////////////////////////////////////////////////////////////////////////////////


const io = require('socket.io')(http);

io.on('connection', function(socket) {

    console.log("connect");

    socket.on('GET_MCLIST', function(data) {

      console.log("GET_MCLIST:" + JSON.stringify(data))  
     /* getmclist(data)
        .then(onSenddata, onRejected);*/

   });

   socket.on('SET_MCLIST', function(data) {
 
   /* setimportance2(data)
      .then(onSenddata, onRejected);*/

   });

   socket.on('EDIT_MCLIST', function(data) {
 
  /*  setmclist(data)
      .then(getmclist)
      .then(onSenddata, onRejected);*/

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

server.get('/getmodellist', function(req, res1){

  console.log("getmodellist:" + JSON.stringify(req.query));

   sqlstart(req.query)
     .then(getmodellist)
     .then(setlistformat)
     .then(onSenddata, onRejected);

     function onSenddata(data) {
        mssql.close();
      //  console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       mssql.close();
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.get('/getmodelname', function(req, res1){

  console.log("getmodelname:" + JSON.stringify(req.query));

   sqlstart(req.query)
     .then(getmodelname)
     .then(onSenddata, onRejected);

     function onSenddata(data) {
        mssql.close();
      //  console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       mssql.close();
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.post('/setreportdata', function(req, res1){

  console.log("setreportdata:" + JSON.stringify(req.body));

  setreportlist(req.body)
     .then(getreportlist)
     .then(gettasks)
     .then(onSenddata, onRejected);

     function onSenddata(data) {
        console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.post('/delreportdata', function(req, res1){

  console.log("delreportdata:" + JSON.stringify(req.body));

  delreportlist(req.body)
     .then(getreportlist)
     .then(gettasks)
     .then(onSenddata, onRejected);

     function onSenddata(data) {
        console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.get('/getreportdata', function(req, res1){

  console.log("getreportdata:" + JSON.stringify(req.query));

     getreportlist(req.query)
        .then(gettasks)
        .then(onSenddata, onRejected);

     function onSenddata(data) {
        console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.post('/gettaskdata', function(req, res1){

  console.log("gettaskdata:" + JSON.stringify(req.body));

     gettasklist(req.body)
        .then(onSenddata, onRejected);

     function onSenddata(data) {
        console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.post('/deltaskdata', function(req, res1){

  console.log("deltaskdata:" + JSON.stringify(req.body));

  deltasklist(req.body)
     .then(gettasklist)
     .then(onSenddata, onRejected);

     function onSenddata(data) {
        console.log('SQL Close send '+JSON.stringify(data)); 
        res1.header('Access-Control-Allow-Origin', '*'); 
        res1.send(data);
     }
 
     /* エラー処理 ************************/ 
 
     function onRejected(err) {
       console.log('error '+err);  
         res1.send([]);
     }   
  
 });

 server.get('/getmclist', function(req, res){

  var data = req.query;

     getmclist(data)
       .then(main)
       .then(onSenddata, onRejected);
 
      function onSenddata(data) {
         res.send(data);
      }
  
      /* エラー処理 ************************/  
      function onRejected(err) {
          console.log('error '+ err);  
          res.send(err);
      } 
 });

 server.get('/getmclist2', function(req, res){

  var data = req.query;

     getmclist(data)
       .then(onSenddata, onRejected);
 
      function onSenddata(data) {
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


async function main(data) {
  for (var i in data.retdata) {
      data.retdata[i] = await settimedata(data.retdata[i],data.start,data.last);
  }
  console.log("loopend" )
  return data
}

function getmclist(data) {
  return new Promise(function(resolve, reject) { 
      mclist.find( {}, function(err, docs) {
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

function settimedata(array,start,last) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = 300; 
    var step = 5;
    var offset = 0;

    var currentid = null;

    console.log("start:" + array.mcname + " start:" + start + " last:" + last)

    var temp = { mcname: array.mcname, start: start, last: last };

    var tm = gettime(start,0);

    var result = tm;
    currentid = result;

    var flg = 0;
    var color = "";

    function loop(i) {
  //     // 非同期処理なのでPromiseを利用
      return new Promise(function(resolve, reject) {
 
     //   if (data.retdata[i].mcname=="EHT-01") {
     //    console.log('loop: '+ JSON.stringify(range))

         var tm = gettime(start,offset);
         var tm1 = gettime(start,offset+step);
         var tmp = { time: tm, span: 1, flg: 0, color: "" };
         var result = tm;
         temp[result] = tmp;

         tasklist2.find( {machinename: array.mcname, timestr: { $gte: tm , $lt: tm1 }  }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
              
              if (docs.length > 0) {
                 currentid = result;
                 tmp.flg = docs[0].status;
                 tmp.color = docs[0].color;
                 flg = docs[0].status;
                 color = docs[0].color;
              } else {
              //   temp[currentid].span += 1;  
                if (tm < gettime(new Date(),0) ) {
                 tmp.flg = flg;
                 tmp.color = color;   
                } else {
                  tmp.flg = 0;
                  tmp.color = "";  
                }    
              }
              offset += step;
              resolve(i+1); 
          }); 
  
      })
      .then(function(count) {
        // ループを抜けるかどうかの判定
        if (count > en) {
          // 抜ける（外側のPromiseのresolve判定を実行）
              console.log(array.mcname)
              res(temp);
  
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

function setreportlist(data) {
  return new Promise(function (res, rej) {
       report1.updateOne({ _id: data.plan._id }, { $set: data.plan } ,{ upsert:true }, function(err, docs) {
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log(err));
            } else {
              res(data) 
            }
       });      
  })
}

function delreportlist(data) {
  return new Promise(function (res, rej) {
       report1.deleteOne({ _id: data.plan._id }, function(err, docs) {
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log(err));
            } else {
              res(data) 
            }
       });      
  })
}

function getreportlist(data) {
  return new Promise(function(resolve, reject) { 
      report1.find( { daystr: data.daystr }, function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          data.retdata=docs
          resolve(data)   
      }); 
  });
}

function gettasklist(data) {
  return new Promise(function(resolve, reject) { 
      tasklist2.find( { productno: data.plan.productno, machinename: data.plan.machine }, function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
          console.log("gettasklist:" + JSON.stringify(docs))
          data.retdata=docs
          resolve(data)   
      }); 
  });
}

function deltasklist(data) {
  return new Promise(function (res, rej) {
       tasklist2.deleteOne({ _id: data.task._id }, function(err, docs) {
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log(err));
            } else {
              res(data) 
            }
       });      
  })
}

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

function getmodellist(data) {
  // ループ処理の完了を受け取るPromise
    return new Promise(function(resolve, reject) {
        var request = new mssql.Request();    
              var sqlstr="JST_製品名一覧";    
              request.input('STR', mssql.VarChar, data.mc);           
              request.execute(sqlstr, function(err, result){
                 if (err) {
                    reject(console.log("err " + err));
                 } else { 
                   // console.log("result:" + JSON.stringify(result))  
                    if (result.recordsets[0].length > 0) {
                      data.retdata = result.recordsets[0];
                    } else {
                      data.retdata = [];
                    }              
                 }
                 resolve(data)  
           })     
  })
}

function getmodelname(data) {
  // ループ処理の完了を受け取るPromise
    return new Promise(function(resolve, reject) {
        var request = new mssql.Request();    
              var sqlstr="JST_製品名取得";    
              request.input('ORDER', mssql.VarChar, data.modelno);    
              request.output('MODELNAME', mssql.VarChar);       
              request.execute(sqlstr, function(err, result){
                 if (err) {
                    reject(console.log("err " + err));
                 } else { 
                   // console.log("result:" + JSON.stringify(result))  
                //    if (result.recordsets[0].length > 0) {
                      data.retdata = result.output.MODELNAME;
                //    } else {
                //      data.retdata = null;
                //    }              
                 }
                 resolve(data)  
           })     
  })
}

function setlistformat(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length-1; 
    var list = [];

    function loop(i) {
  //     // 非同期処理なのでPromiseを利用
      return new Promise(function(resolve, reject) {
 
        if (data.retdata.length > 0) {

           list.push({ value: data.retdata[i].id, text: data.retdata[i].model_name});
           resolve(i+1); 
        } else {
          resolve(i+1); 
        }  
      })
      .then(function(count) {
        // ループを抜けるかどうかの判定
        if (count > en) {
          // 抜ける（外側のPromiseのresolve判定を実行）
              data.retdata = list.sort( compare );
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
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length-1; 

    function loop(i) {
  //     // 非同期処理なのでPromiseを利用
      return new Promise(function(resolve, reject) {
 
        if (data.retdata.length > 0) {

       //   console.log("---" + data.retdata[i].machine.text)

          tasklist2.find({ gouki: data.retdata[i].machine, productno: data.retdata[i].pro }, function(err, docs) {
                if(err) {
                // console.log('func_workid_update Error!');
                reject(console.log('getplandetail! '+err)); 
                throw err;
                } 
                if (docs.length > 0) {
                  data.retdata[i].tasklog=docs;              
                }
                resolve(i+1);   
            }).sort({ starttime: 1}); 
          } else {
            resolve(i+1); 
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

function setstatus2(data) {
  return new Promise(function(resolve, reject) { 
     console.log("save!:" + JSON.stringify(data))
     mclist.findOneAndUpdate({ mcname: data.mcnmae },
         {  modelname : data.modelname,
            status : parseInt(data.status),
            updatetime : new Date(),}
         ,{upsert: true, new: true },function(err,result){
// マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
            console.log("error " + err);
        } else {
          console.log("setstatus2:"+ JSON.stringify(result));
        //  data.mclist = result; 
    
          resolve(data);
        }
      }); 
  })
}

function compare( a, b ){
  var r = 0;
  if( a.text < b.text ){ r = -1; }
  else if( a.text > b.text ){ r = 1; }

  return r;
}


process.on('exit', function (){
  console.log('SQL CLose!');
  mssql.close();

});

process.on('SIGINT', function() {
  console.log('End Process');
  process.exit();
});


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