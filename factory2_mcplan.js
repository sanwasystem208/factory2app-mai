/*//////////////////////////////////////////////////////////////////////////////
   factory2_partlist            
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8306;

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
  btimes
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

  server.post('/getmcplan', function (req, res) {

   // console.log("getmcplan:"+JSON.stringify(req.body));
  
    getmcplan(req.body)
      // .then(getcsvinfo)
      // .then(getplanproduct)
      // .then(gettempholiday)
       .then(getdaytime)
       .then(worktimeLoop)
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

  server.post('/getmcplan2', function (req, res) {
    /* var ip = req.headers['x-forwarded-for'] ||
       req.connection.remoteAddress ||
       req.socket.remoteAddress ||
       req.connection.socket.remoteAddress;
     var clientIp = ip.replace("::ffff:", "");*/
 
    // console.log("getmcplan2:"+JSON.stringify(req.body));
   
    // getmcplan(req.body)
       // .then(getcsvinfo)
       // .then(getplanproduct)
       // .then(gettempholiday)
       // .then(getdaytime)
       // .then(worktimeLoop2)
     refrashDaylist(req.body)
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

  server.get('/getmcspec', function (req, res) {

    // console.log("getmcspec:"+JSON.stringify(req.body));
 
     getmcspec(req.body)
       .then(onSenddata, onRejected);
 
   function onSenddata(data) {
     res.header('Access-Control-Allow-Origin', '*');
     res.send(data);
   }
 
   function onRejected(err) {
     res.send(err);
   }
 
 })


 server.get('/getcsvdata', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("getcsvdata:"+JSON.stringify(req.query));

  getorderlist3(req.query)
     .then(getbasehour)
     .then(setmodelpintypes)
     .then(getmcspec_ones)
     .then(getmcplancount)
     .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})

server.get('/gettasklist', function (req, res) {

  console.log("gettasklist:"+JSON.stringify(req.query));

  gettasklist(req.query)
     .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})

server.post('/setmcplan', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("setmcplan:"+JSON.stringify(req.body));

  getsortno(req.body)   //新しいソートNo取得
     .then(getsettingtime)
     .then(setmcplan)   //新規計画を登録
     .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})


server.get('/setproduct', function (req, res) {

  console.log("/setproduct:"+JSON.stringify(req.query));

   setproduct(req.query)
     .then(setallproduct)
     .then(gettasklist)
     .then(onSenddata, onRejected);

 function onSenddata(data) {
   res.header('Access-Control-Allow-Origin', '*');
   res.send(data);
 }

 function onRejected(err) {
   res.send(err);
 }

})

server.post('/delproduct', function (req, res) {

  console.log("/delproduct:"+JSON.stringify(req.body));

   delproduct(req.body)
     .then(setallproduct)
     .then(gettasklist)
     .then(onSenddata, onRejected);

 function onSenddata(data) {
   res.header('Access-Control-Allow-Origin', '*');
   res.send(data);
 }

 function onRejected(err) {
   res.send(err);
 }

})

server.get('/getholiday', function (req, res) {

  // console.log("getholiday:"+JSON.stringify(req.query));
 
     getholiday(req.query)
       .then(checkmcname)
       .then(getworkrate)
       .then(getholiday2)
      // .then(getsettingtime)
       .then(getbasehour)
       .then(onSenddata, onRejected);
 
   function onSenddata(data) {
     res.header('Access-Control-Allow-Origin', '*');
     res.send(data);
   }
 
   function onRejected(err) {
     res.send(err);
   }
 
 })

 
 server.post('/changemcplan', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("changemcplan:"+JSON.stringify(req.body)); 

 changemcplan(req.body)    // 選択計画のソートNoを入れ替え
   .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})

server.post('/delmcplan', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("delemcplan:"+JSON.stringify(req.body)); 

  delmcplan(req.body)    // 選択計画のソートNoを入れ替え
   .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})

server.post('/setmcplan_update', function (req, res) {

  console.log("/setmcplan_update:" + JSON.stringify(req.body))

  setmcplan_update(req.body)
    .then((result) => {
      console.log("send:")
      res.header('Access-Control-Allow-Origin', '*')
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

server.delete('/getdelete', function (req, res) {

  console.log("/getdelete:" + JSON.stringify(req.body))

      res.header('Access-Control-Allow-Origin', '*')
      res.send("")
})
////////////////////////////////////////////////////////////////////////////////
//
//                                関数
//
////////////////////////////////////////////////////////////////////////////////
  
function getmcplan(data) {
  return new Promise(function (resolve, reject) {
   // console.log("getmcplan---:" + JSON.stringify(data.ids));
    var obj = { $and: [{ modeltype: data.modeltype}, { $or: [{startday: {$gte: data.startday }},{ endplan: false }]}]};
    mcplan.aggregate([
      { $match: obj },
      { $group: {"_id": { "_id": "$_id", 
                          "_modeltype": "$modeltype", 
                          "_csvdataid": "$csvdataid", 
                          "_column": "$column",
                          "_qty": "$qty",
                          "_product": "$product",
                          "_pice": "$pice",
                          "_addtime": "$addtime",
                          "_comment": "$comment",
                          "_daymaxcount": "$daymaxcount",
                          "_price": "$price",
                          "_settingtime": "$settingtime",
                          "_sortno": "$sortno",
                          "_modelid": "$modelid",
                          "_modelname": "$modelname",
                          "_shipment": "$shipment",
                          "_plandata": "$plandata",
                          "_startday": "$startday"
                        }}},    
      { $lookup: {
                          from: "mctasks",
                          localField: "_id._id",
                          foreignField: "ornerid",
                          as: "taskdata"
                        }
                    },                     
      { $project: {"_id": "$_id._id", 
                  "modeltype": "$_id._modeltype", 
                  "csvdataid": "$_id._csvdataid", 
                  "modelname": "",
                  "modelid": "",
                  "qty": "$_id._qty",
                  "pice": "$_id._pice", 
                  "addtime": "$_id._addtime",
                  "comment": "$_id._comment",                
                  "daymaxcount": "$_id._daymaxcount",
                  "price": "$_id._price",
                  "settingtime": "$_id._settingtime",
                  "check": "",
                  "product": "$_id._product",
                  "sortno": "$_id._sortno",
                  "modelid": "$_id._modelid",
                  "modelname": "$_id._modelname",
                  "shipment": "$_id._shipment",
                  "checkcum": "",
                  "taskdata": "$taskdata",
                  "startday": "$_id._startday",
                  "starttime": "",
                  "lasttime": "",
                  "subproduct": "0"
                } },
                { $sort: { "sortno": 1}}
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        //抽出した計画一覧をループして前日までの実績を反映する。
        docs.forEach((item, index) => {
          item.check = false;
          item.subproduct = 0;
          item.taskdata.forEach((item2, index) => {
            if (item2.workday < data.startday){
              item.subproduct+=item2.product;
            }
          });
        });
        console.log("docs:"+JSON.stringify(docs));
        data.planlist = docs;
        resolve(data);
      });
  })
}

function getcsvinfo(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.planlist.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.planlist.length > 0){
            //console.log("loop: " + data.planlist[i].csvdataid)
            csvdata.find( { _id: data.planlist[i].csvdataid }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                if (docs.length > 0) {
                  data.planlist[i].modelname = docs[0].modelname;
                  data.planlist[i].modelid = docs[0].modelid; 
                 // data.planlist[i].qty = docs[0].qty; 
                  data.planlist[i].shipment = docs[0].date;              
                }
                data.planlist[i].check = false; 
                resolve(i + 1); 
           });
        } else {
          resolve(i + 1); 
        }   
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            //console.log("getcsvinfo:" + data.planlist.length)
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

function getmcspec(data) {
  return new Promise(function (resolve, reject) {
    var obj = { mc: data.mc };
    mcspec.aggregate([
      { $group: {"_id": { "_modeltype": "$modeltype", 
                          "_type": "$type",
                          "_filter1": "$filter1",
                          "_spm": "$spm"
                        }}
      },
      { $project: {"value": "$_id._modeltype", 
                  "text": "$_id._modeltype", 
                  "type": "$_id._type", 
                  "filter1": "$_id._filter1", 
                  "spm": "$_id._spm",
                } 
      },
      { $sort: { value: 1 } },
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        //console.log("mcselect:" + JSON.stringify(docs));
        data.mcspec = docs;
        resolve(data);
      });
  })
}


function getorderlist3(data) {
  return  new Promise(function(res, rej) {

    var arr = [{ "date": { $gt: "2025/01/06"}}];
    
    if (data.filter1 == "") {
      arr.push({ "modelname": { $regex: data.filter1, $options: "xi"} });  
      arr.push({ "modelname": { $regex: data.type, $options: "xi"} });            
    } else  {
      arr.push({ "modelname": { $regex: data.type, $options: "xi"} });  
    }

    if (data.keyword != null) {
      arr.push({ $or: [{ "modelname": { $regex: data.keyword, $options: "xi"} },{ "_id": { $regex: data.keyword, $options: "xi"}} ]}); 
    // arr.push({ "_id": { $regex: data.keyword, $options: "xi"} });  
    }

    if (isNumber(data.keyword)) {
      arr = [{ "_id": data.keyword }];
    }

    console.log("filter:" + JSON.stringify(arr))

    csvdata.aggregate([
      { $match: { $and: arr } },
      { $group: {"_id": { "_id": "$_id",
                          "_modelid": "$modelid",
                          "_modelname": "$modelname",
                          "_qty": "$qty",
                          "_date": "$date",
                          "_checkqty": "$checkqty",
                          "_price": "$price",
                          "_destination": "$destination", 
                          "_plancount": "$plancount" }                       
       },
      },
      { $project: {
         "_id": "$_id._id",
         "modelid": "$_id._modelid",    
         "modelname": "$_id._modelname",
         "qty": "$_id._qty",   
         "date": "$_id._date",
         "checkqty": "$_id._checkqty",
         "price": "$_id._price",
         "destination": "$_id._destination",  
         "plancount": "$_id._plancount", 
         "pintype": "",
         "daymaxcount": "",
         "type": "",
         "pice": ""                    
        }
      },
      { $sort: { "date": 1, "modelid": 1}}
    ],
      function (err, docs) {
        if (err) {
          rej(console.log('getworklog! ' + err));
        }
      //  console.log("docs:" + JSON.stringify(docs))
        var list = [];
        docs.forEach((item, index) => {
          if (item.checkqty < item.qty) {
            list.push(item);             
          }
        });
        data.retdata = list;
        res(data);
      });
   });       
}


function getmcplancount(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.retdata.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.retdata.length > 0){
            mcplan.aggregate([   
              { $match: { csvdataid: data.retdata[i]._id }}, 
              { $group: { _id: null,
                          _sum: { $sum: "$qty"}
              }}
            ],
              function(err, docs) {   
              if(err) {
                  console.log('err' + err);
                  rej(console.log('getholiday! '+err)); 
                  throw err;
              }
              //console.log("length:" + JSON.stringify(docs));
              if (docs.length > 0) {
                data.retdata[i].plancount = docs[0]._sum;;
              } else {
                data.retdata[i].plancount = 0;
              }
              resolve(i + 1)
            });
         /*   mcplan.find( { csvdataid: data.retdata[i]._id }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                data.retdata[i].plancount = docs.length;
                if (docs.length > 0){
                 // console.log("loop:"+data.retdata[i]._id + " " + data.retdata[i].plancount);
                }
                resolve(i + 1); 
           });*/
        } else {
          resolve(i + 1); 
        }   
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
              if (data.filterflg==0) {
                var newLine = data.retdata.filter(function(item, index){
                  if (item.plancount == 0) return true;
                }); 
                data.retdata = newLine;
              }
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


function getbasehour(data) {
  return  new Promise(function(res, rej) {
    setting.find({ _id: "basehour" }, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.basehour = docs[0].value;
        res(data);
      }
    }); 
   });       
}


function setmodelpintypes(data) { 
 
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length-1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function(resolve, reject) {
        if (data.retdata.length > 0){
          //console.log("loop: " + data.planlist[i].csvdataid)
          modellist.find({ _id: data.retdata[i].modelid  }, function (err, docs) {
            if (err) {
              console.log(err)
              reject(err);
            } else {
             // console.log("setmodelpintype 2:"+JSON.stringify(docs));
              if (docs.length > 0) {
                data.retdata[i].pintype = docs[0].pin; 
                data.retdata[i].type = docs[0].typename;                
              } else {
                data.retdata[i].pintype = 0;
                data.retdata[i].type = "";              
              }
              resolve(i + 1); 
            }
          });
      } else {
        resolve(i + 1); 
      }   
    }).then(function(count) {
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

function getmcspec_ones(data) {  
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.retdata.length-1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function(resolve, reject) {
        if (data.retdata.length > 0){
          mcspec.find({ modeltype: data.modeltype, pin: data.retdata[i].pintype  }, function (err, docs) {
            if (err) {
              console.log(err)
              reject(err);
            } else {
              if (docs.length > 0) {
                 var count = math.multiply(math.multiply(math.divide(math.multiply(math.multiply(docs[0].pice, docs[0].spm), 60), 100 ), 100),0.85) ;
                 data.spm = docs[0].spm;
                 data.retdata[i].pice = docs[0].pice;  
                 data.retdata[i].daymaxcount = count;
                 data.retdata[i].worktime = math.multiply(math.divide(data.retdata[i].qty, count), data.basehour);
                 //console.log("getmcspec_one 2:"+ data.mcplan.worktime);
              } else {
                data.retdata[i].pice = 0;  
                data.retdata[i].daymaxcount = 0;
                data.retdata[i].worktime = 0;      
              }
              resolve(i + 1); 
            }
          });
      } else {
        resolve(i + 1); 
      }   
    }).then(function(count) {
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

function getbasehour(data) {
  return  new Promise(function(res, rej) {
    setting.find({ _id: "basehour" }, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.basehour = docs[0].value;
        res(data);
      }
    }); 
   });       
}


function setmcplan(data) {  
  return new Promise(function (resolve, reject) {
    mcplan.find({ _id: data.mcplan._id }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        if (docs.length == 0) {
          data.mcplan.update_time = new Date();
          var mp = new mcplan(data.mcplan);
          //データベースに保存。
          mp.save(function(err){
             if(err){ reject(err); }
               data.flg = 1;
               resolve(data);
          });
       }
        resolve(data);
      }
    });
  });
}


function getsortno(data) {
  return  new Promise(function(res, rej) {
    setting.findOneAndUpdate({ _id: "sortno" },
      { $inc: { value: 1 }},
      {upsert: true, new: true },function(err,result){
// マッチしたドキュメントが docs[i].doc で取れる
          if (err) {
              console.log("error " + err);
          } else {
             //console.log("getserial"+ JSON.stringify(result));
             data.mcplan.sortno =result.value;
             res(data);
          }

      }); 
   });       
}


function gettempholiday(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    holidays.aggregate([   
      { $unwind: "$mcnames" },
      { $match: { _id: { $gte: data.startday, }, "mcnames.modeltype": data.modeltype, status: 1 }}, 
      { $group: { _id: { _id: "$_id",
                        _weekname: "$weekname", 
                        _status: "$status",
                        _title: "$title", 
                        _worktime: "$worktime"                           
      },
      }},
      { $project: { _id: "$_id._id", 
                    status: null,
                    status:  "$_id._status",
                    weekname: "$_id._weekname",
                    worktime: "$_id._worktime",
                    no: "",
                    timelist: ""
                 }  
      },
      { $sort: { _id: 1 } },
      { $limit: 31 }
    ],
      function(err, docs) {   
      if(err) {
          console.log('err' + err);
          rej(console.log('getholiday! '+err)); 
          throw err;
      }
      //console.log("length:" + JSON.stringify(docs));
      var i = 0;
      docs.forEach((item, index) => {
        item.no = i;
        item.timelist = [];
        i += 1;
      });
      data.daylist = docs;
      res(data)
    });
  })
}

function gettimelist(data) {
  return  new Promise(function(res, rej) {
    btimes.find({ flg: 1}, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.timelist = docs;
        res(data);
      }
    }).sort({ sortno: 1}); 
   });       
}

async function worktimeLoop(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
  console.log("worktimeLoop start")
 // var dlist = clonedeep(data.daylist);
 // var tlist = clonedeep(data.timelist); 
  var startparam ={ day: 0 , day2: 0, time: 0, modeid: 0, task: [] };
  var oldmodelid = 0;   
  for (const i in data.planlist) {
     // var list = JSON.parse(JSON.stringify(daylist));  
     // console.log("loop 1:" + data.daylist[start.day]._id + " " + data.timelist[start.time].timestr); 
      data.planlist[i].starttime = data.daylist[startparam.day]._id + " " + data.daylist[startparam.day].timelist[startparam.time].timestr;
      startparam = await setworktime(data.planlist[i], startparam, data.daylist);
     // console.log("loop 2:" + data.daylist[start.day]._id + " " + data.timelist[start.time].timestr); 
      data.planlist[i].lasttime = data.daylist[startparam.day]._id + " " + data.daylist[startparam.day].timelist[startparam.time].timestr; 
      data.planlist[i].tasklist = startparam.task;    
      if (data.planlist[i].modelid==oldmodelid) {
        data.planlist[i].settingtime = 0;
      } else {
        data.planlist[i].settingtime = 2;
      }
      oldmodelid = data.planlist[i].modelid;
  }
  console.log("worktimeLoop last:")
  return data
}


async function worktimeLoop2(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
  console.log("worktimeLoop start")
 // var dlist = clonedeep(data.daylist);
 // var tlist = clonedeep(data.timelist); 
  var startparam ={ day: 0 , day2: 0, time: 0, modeid: 0, task: [] };   
  var oldmodelid = 0;
  for (const i in data.planlist) {
      var list = clonedeep(data.daylist);
     // var list = JSON.parse(JSON.stringify(daylist));  
     // console.log("loop 1:" + data.daylist[start.day]._id + " " + data.timelist[start.time].timestr); 
      data.planlist[i].starttime = data.daylist[startparam.day]._id + " " + data.daylist[startparam.day].timelist[startparam.time].timestr;
      startparam = await setworktime(data.planlist[i], startparam, data.daylist);
     // console.log("loop 2:" + data.daylist[start.day]._id + " " + data.timelist[start.time].timestr); 
      data.planlist[i].lasttime = data.daylist[startparam.day]._id + " " + data.daylist[startparam.day].timelist[startparam.time].timestr; 
      data.planlist[i].tasklist = startparam.task;  
      data.planlist[i].column = await settotalexec2(data.planlist[i], list);  
      if (data.planlist[i].modelid==oldmodelid) {
        data.planlist[i].settingtime = 0;
      } else {
        data.planlist[i].settingtime = 2;
      }
      oldmodelid = data.planlist[i].modelid;
  }
  console.log("worktimeLoop last:")
  return data
}

async function setworktime(data, startparam, daylist) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し） 
      var mcount = math.divide(data.daymaxcount,60); //1分あたりの生産数
      var totalcount = 0;                            //総生産数
      var timelist = daylist[0].timelist;            //時間表
      var startdaypos = startparam.day;              //前の計画の終了日付ポジション
      var starttimepos = startparam.time;            //前の計画の終了時間ポジション
      var workdaypos = startparam.day2;               //前の計画の終了日付ポジション（勤務日）
      var settingtime = 120;                         //デフォルトの切り替え時間（分単位）
      console.log("settingtime: " + startparam.modelid + " " + data.modelid)
      if (startparam.modelid == data.modelid) {       //前の計画と同じ機種は切り替え時間ゼロ
        var settingtime = 0;
      }  
      var ordercount = data.qty - data.subproduct;      //残りの必要数＝注文数量-生産実績　
      console.log("start:" + ordercount + " " + mcount + " " + settingtime)
      var en = 10000;                                //ル－プの回数（適当）
      var tmpstart = getshortday(daylist[startdaypos]._id + " " + timelist[starttimepos].timestr);//前の計画の終了日付＋時間
      var task = [];                                 //タスクの入れ物
      var tmpcount = 0;                              //タスクの生産数
      var status = daylist[workdaypos].status;       //前の計画の終了日のステータス（勤務日）1＝稼働日、0＝休日
      var workday = daylist[workdaypos]._id;         //前の計画の終了日付（勤務日）
      var expcount = ordercount;                     //注文数に対して残った数量
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {

            //1日分のタイムリストを消化した処理　8時30分
            if (starttimepos == timelist.length-1) {
              console.log("08:30")
              task.push({ daystr: workday,//タスク作業日
                          start: tmpstart,//タスク開始時間
                          last:  getshortday(daylist[startdaypos]._id + " " + timelist[starttimepos].timestr),//タスク終了時間
                          count: tmpcount });//予定数
              starttimepos = 0;//時間ポジションをリセット
              tmpstart = getshortday(daylist[startdaypos]._id + " " + timelist[starttimepos].timestr);//次のタスクの開始時間 
              expcount -= tmpcount; //注文数からタスクの数量を引いた残数          
              tmpcount = 0; //タスクの数量をクリア 
              timelist = daylist[startdaypos].timelist;//当日の時間表をセット
              //当日が休みの場合、次の勤務日を探す
              for (var h in daylist){
                if (daylist[startdaypos].status==1) {
                  status = daylist[startdaypos].status;//勤務日のステータス
                  workday = daylist[startdaypos]._id;//勤務日の日にち
                  workdaypos = startdaypos;//勤務日の日付ポジション
                } else {
                  startdaypos += 1;//休みの場合、次の日付ポジションをセット
                }
              }
            }

            //勤務日かチェック
            if (status==1) {
            //切り替え時間を1分ずつ減算して0を下まわった場合、生産数を累積する。      
              if (settingtime <= 0) {
                totalcount += mcount; //トータルの生産数に分単位の生産数をプラス
                tmpcount += mcount;  //タスクの生産数に分単位の生産数をプラス     
              }
            }
            //切り替え時間を1分ずつ減らす。
            settingtime  -= 1;

            //現在の時間を取得。
            var newtime = timelist[starttimepos].timestr;

            //現在の時間が0時になったら日にちを1日進める。（勤務日は繰り上げない）
            if (newtime=="23:59") {
              console.log("23:59")
              startdaypos += 1;  
            }

            //トータルの生産数が注文数をオーバーしたら終了
            if (ordercount <= totalcount) {
              //終了した時に残りの数を修正
              if (expcount < tmpcount) {
                tmpcount = expcount;
              }
              startparam.day = startdaypos;//次の注文の日付ポジションを設定
              startparam.day2 = workdaypos;//次の注文の勤務日ポジションを設定
              startparam.time = starttimepos;//次の注文の時間ポジションを設定
              startparam.modelid = data.modelid;//現在の機種IDを設定
              //最後のタスクを設定
              task.push({ daystr: workday,
                          start: tmpstart,
                          last:  getshortday(daylist[startdaypos]._id + " " + timelist[starttimepos].timestr),
                          count: tmpcount })          
              resolve(en + 1);  
            } 

            //時間を1分ずつ進める。
            starttimepos += 1;

            resolve(i + 1);  
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
              //タスクの一覧を注文情報に埋める             
              startparam.task = task;
              console.log("END:");
              res(startparam);
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


function getdaytime(data) {  
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    // ループ処理（再帰的に呼び出し）
    var en = data.daylist.length-1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function(resolve, reject) {
        console.log("daylist:" +data.daylist[i].worktime)
        if (data.daylist.length > 0){
          btimes.find({flg: 1}, function (err, docs) {
            if (err) {
              console.log(err)
              reject(err);
            } else {
              data.daylist[i].timelist = docs;
              console.log("timelist:" + data.daylist[i].timelist.length)
              resolve(i + 1); 
            }
          }).limit((data.daylist[i].worktime * 60)).sort({ sortno: 1});
      } else {
        resolve(i + 1); 
      }   
    }).then(function(count) {
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

function getbasehour(data) {
  return  new Promise(function(res, rej) {
    setting.find({ _id: "basehour" }, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.basehour = docs[0].value;
        res(data);
      }
    }); 
   });       
}


function getsettingtime(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
   // console.log("getlastplanmodel 1:"+ data.modeltype + " " + data.mcplan.sortno);
    mcplan.aggregate([   
      { $match: { modeltype: data.modeltype, sortno: { $lt: data.mcplan.sortno } }}, 
      { $group: { _id: { _modelid: "$modelid",
                         _sortno: "$sortno"
      }
      }},
      { $sort: { "_id._sortno": -1 }}
    ],
      function(err, docs) {   
      if(err) {
          console.log('err' + err);
          rej(console.log('getholiday! '+err)); 
          throw err;
      }
    //  console.log("getlastplanmodel 2:" + data.mcplan.modelid + " " + docs[0]._id._modelid);
      if (docs.length >0) {
      //  console.log("getlastsortno 2:" + JSON.stringify(docs));
        if (docs[0]._id._modelid == data.mcplan.modelid) {
          data.mcplan.settingtime = 0;
        } else {
          data.mcplan.settingtime = 2;
        }
      } else {
        data.mcplan.settingtime = 2;
      }
      res(data)
    })
  })
}


function gettasklist(data) {
  return  new Promise(function(res, rej) {
    console.log("gettasklist 1:" + data.ornerid);
    mctask.find( { ornerid: data.ornerid }, function(err, docs) {
      if(err) {
        reject(console.log('gettasklist: '+err)); 
        throw err;
      } 
      console.log("gettasklist 2:" + docs.length);
        if (docs.length > 0) {
          docs.forEach((item, index) => {
            item.check = false;
          });
          data.tasklist = docs;
        } else  {
          data.tasklist = [];
        }
        res(data); 
    });        
  })
}


function setproduct(data) {
  return  new Promise(function(res, rej) {
   //  console.log("---" + JSON.stringify(data.id) + " " + JSON.stringify(data.upstr));
      mctask.updateOne(
        { _id: data._id },
        { $set: data },
        { upsert: true },
        function (err, result) {
          // マッチしたドキュメントが docs[i].doc で取れる
          if (err) {
            rej(console.log('result ' + err))
          } else {
            console.log("---00" + JSON.stringify(data));
            res(data);
          }
      })
  })
}

function delproduct(data) {
  return new Promise(function (resolve, reject) {
    console.log("del:" + JSON.stringify(data.ids))
    mctask.deleteMany(
      { _id: { $in: data.ids }},
      function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log('result ' + err)
        } else {
          //console.log("delmctask:" + JSON.stringify(result));
          resolve(data)
        }
      },
    )
  })
}


function setallproduct(data) {
  return  new Promise(function(res, rej) {
    mctask.aggregate([
        { $match: { ornerid: data.ornerid }},
        { $group: {"_id": { "_id": null },
        "_product": { $sum: "$product"},        
        }},
      ],
        function (err, docs) {
          if (err) {
            rej(console.log('getplanproduct! ' + err));
          }
          var product = 0;
          var endplan = false;
          if (docs.length > 0) {
            product = docs[0]._product;
          }
          console.log("ornerqty:" + data.ornerqty)
          if (data.ornerqty <= product) {
            endplan = true;
          }
          mcplan.updateOne(
            { _id: data.ornerid },
            { $set: { product: product, endplan: endplan, startday: data.workday } },
            { upsert: true },
            function (err, result) {
              // マッチしたドキュメントが docs[i].doc で取れる
              if (err) {
                rej(console.log('result ' + err))
              } else {
                console.log("---00" + JSON.stringify(data));
                res(data);
              }
          })
    });  
  })
}

function getplanproduct(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.planlist.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.planlist.length > 0){
            //console.log("getplanproduct:"+ data.planlist[i]._id + " " + data.startday);
            mctask.aggregate([
              { $match: { ornerid: data.planlist[i]._id, workday: { $lte: data.startday }}},
              { $group: {"_id": { "_id": null },
              "_product": { $sum: "$product"},        
              }},
            ],
              function (err, docs) {
                if (err) {
                  reject(console.log('getplanproduct! ' + err));
                }
                console.log("getplanproduct:" + JSON.stringify(docs));
                if (docs.length > 0) {
                  data.planlist[i].product = docs[0]._product;      
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
            //console.log("getcsvinfo:" + data.planlist.length)
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


function getholiday(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    var lastday = getAddDay(data.startday, 31);
    console.log("getrangeday:"+data.startday + " " + lastday);
    holidays.aggregate([   
      { $match: { _id: { $gte: data.startday, $lte: lastday } }}, 
      { $group: { _id: { _id: "$_id",
                        _daystr: "$daystr",
                        _weekname: "$weekname", 
                        _status: "$status",
                        _title: "$title", 
                        _worktime: "$worktime"                           
      },
      }},
      { $project: { _id: "$_id._id", 
                    daystr: "$_id._daystr",
                    status: null,
                    status:  "$_id._status",
                    weekname: "$_id._weekname",
                    worktime: "$_id._worktime",
                    no: "",
                    plan: "0",
                    product: "0"
                 }  
      },
      { $sort: { _id: 1 } },
      { $limit: 21 }
    ],
      function(err, docs) {   
      if(err) {
          console.log('err' + err);
          rej(console.log('getholiday! '+err)); 
          throw err;
      }
      console.log("getHoreday:" + JSON.stringify(docs));
      var i = 0;
      docs.forEach((item, index) => {
        item.no = i;
        item.plan = 0;
        item.product = 0;
        item.timelist = [];
        i += 1;
      });
      data.daylist = docs;
      res(data)
    });
  })
}

function getholiday2(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    //console.log("getrangeday:"+data.month);
    var lastday = getAddDay(data.startday, 31);
    holidays.aggregate([   
      { $unwind: "$mcnames" },
      { $match: { _id: { $gte: data.startday, $lte: lastday }, "mcnames.modeltype": data.modeltype }}, 
      { $group: { _id: { _id: "$_id",
                        _daystr: "$daystr",
                        _weekname: "$weekname", 
                        _status: "$status",
                        _title: "$title", 
                        _worktime: "$mcnames.worktime",                        
      },
      }},
      { $project: { _id: "$_id._id", 
                    daystr: "$_id._daystr",
                    status: null,
                    status:  "$_id._status",
                    weekname: "$_id._weekname",
                    worktime: "$_id._worktime",
                    no: "",
                    workrate: "",
                    plan: "0",
                    product: "0"
                 }  
      },
      { $sort: { _id: 1 } },
    ],
      function(err, docs) {   
      if(err) {
          console.log('err' + err);
          rej(console.log('getholiday! '+err)); 
          throw err;
      }
     // console.log("length:" + JSON.stringify(docs));
      var i = 0;
      docs.forEach((item, index) => {
        item.no = i;
        item.workrate = data.workrate;
        item.plan = 0;
        item.product = 0;
        item.timelist = [];
        i += 1;
      });
    //  console.log("getholiday2:" + JSON.stringify(docs));    
      data.daylist = docs;
      res(data)
    });
  })
}


function getworkrate(data) {
  return  new Promise(function(res, rej) {
    //console.log("settingtime: start ");
    setting.find({ _id: "workrate" }, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.workrate = docs[0].value;
        //console.log("settingtime: last " + docs[0].value);
        res(data);
      }
    }); 
   });       
}


function checkmcname(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
   // ループ処理（再帰的に呼び出し）
   var en = data.daylist.length-1;
   function loop(i) {
     // 非同期処理なのでPromiseを利用
     return new Promise(function(resolve, reject) {
        // console.log("ornerid:"+ JSON.stringify(data))
        holidays.aggregate([   
         { $unwind: "$mcnames" },
         { $match: { _id: data.daylist[i]._id, "mcnames.modeltype": data.modeltype }}, 
         { $group: { _id: null,
                     _count: { $sum: 1}
         }}
       ],
         function(err, docs) {   
         if(err) {
             console.log('err' + err);
             rej(console.log('getholiday! '+err)); 
             throw err;
         }
           //console.log("checkmcname 1:" + JSON.stringify(docs));
             if (docs.length== 0) {
               var mcname = {
                 modeltype: data.modeltype,
                 worktime: data.daylist[i].worktime
               }
               //console.log("checkmcname 2:" + JSON.stringify(mcname));
               holidays.updateOne(
                 { _id: data.daylist[i]._id },
                 { $push: { mcnames: mcname } },
                 { upsert: true },
                 function (err, result) {
                   // マッチしたドキュメントが docs[i].doc で取れる
                   if (err) {
                     reject(console.log('checkmcname ' + err))
                   } else {
                    //console.log("---00" + JSON.stringify(result));
                   resolve(i + 1) 
                   }
               })

          } else {
           resolve(i + 1)   
          }  
       });
   }).then(function(count) {
       // ループを抜けるかどうかの判定
       if (count > en) {
         // 抜ける（外側のPromiseのresolve判定を実行）
          // console.log("invent:" + invent);
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


function getproducts(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.planlist.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.planlist.length > 0){
            //console.log("loop: " + data.planlist[i].csvdataid)
            mctask.aggregate([   
              { $match: { ornerid: data.planlist[i]._id }}, 
              { $group: { _id: null,
                          _sum: { $sum: "$product"}
              }}
            ],
              function(err, docs) {   
              if(err) {
                  console.log('err' + err);
                  rej(console.log('getholiday! '+err)); 
                  throw err;
              }
              //console.log("length:" + JSON.stringify(docs));
              if (docs.length > 0) {
                data.planlist[i].product = docs[0]._sum;;
              } else {
                data.planlist[i].product = 0;
              }
              resolve(i + 1)
            });

        } else {
          resolve(i + 1); 
        }   
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
              //console.log("getproduct:" + data.planlist.length)
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

async function refrashDaylist(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
  //console.log("partsetDaylist start")
  var daylist = data.daylist;
  for (const i in data.planlist) {
     // var list = JSON.parse(JSON.stringify(daylist));
      var list = clonedeep(daylist);
      data.planlist[i].column = await settotalexec2(data.planlist[i], list);
     // data.planlist[i].checksum = await checksum(data.planlist[i]);
     // console.log("checksum:" + data.planlist[i].checksum );
  }
  //console.log("partsetDaylist last:" + data.planlist.length)
  return data
}


async function settotalexec2(data, daylist) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = daylist.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
           // console.log("ornerid:"+ JSON.stringify(data))
          if (daylist.length > 0) {

            const result = data.tasklist.find((v) => v.daystr === daylist[i]._id);

            if (result) {
              daylist[i].plan = result.count;
            } else {
              daylist[i].plan = 0;
            }

            if (data.taskdata.length > 0) {
              const result2 = data.taskdata.find((v) => v.workday === daylist[i]._id);
              if (result2 != undefined) {
                console.log("result2:" + result2.product)
                daylist[i].product = result2.product;
              } else {
                daylist[i].product = 0;
              } 
            } else {
              daylist[i].product = 0;
            }
            
            resolve(i + 1); 
          /*  mctask.find({ ornerid: data._id, workday: daylist[i]._id }, function (err, docs) {
              if (err) {
                console.log(err)
                reject(err);
              } else {
                if (docs.length > 0) {
                  daylist[i].product = docs[0].product;
                } else {
                  daylist[i].product = 0;
                }
                resolve(i + 1); 
              }
            })*/
          }  
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
             // console.log("invent:" + invent);
              res(daylist);
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


async function changemcplan(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {

      var uplist = [];

      var upval = {
        updateOne: {
          filter: { _id: data.changelist[0]._id },
          update: { $set: { sortno: data.changelist[1].sortno } },
        }
      }

      uplist.push(upval);

      var upval2 = {
        updateOne: {
          filter: { _id: data.changelist[1]._id },
          update: { $set: { sortno: data.changelist[0].sortno } },
        }
      }

      uplist.push(upval2);

      console.log("uplist:" + JSON.stringify(uplist))

      if (uplist.length > 0) {
        mcplan.bulkWrite(uplist, 
          function (err, result) {
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log('error ' + err))
            } else {
              //console.log('bulkWrite:' + JSON.stringify(result))
              res(data)
            }
        }) 
      } else {
        res(data)
      }   
  })
}

function setmcplan_update(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
     // console.log("settaskdata_dispflg:" + data.value._id + " " + data.value.disable + " " + data.value.endplan)
      mcplan.updateOne(
        data.filter,
        { $set: data.update},
        { upsert: false },
        function (err, result) {
          // マッチしたドキュメントが docs[i].doc で取れる
          if (err) {
            rej(console.log('error ' + err))
          } else {
           // console.log('result ' + JSON.stringify(result))
           // data.flg = 0;//result.modifiedCount;
            console.log("newValue:" + JSON.stringify(result))
            data.retflg = result.modifiedCount;
           // console.log(data.retValue)
            res(data)
          }
        }
      )
  })
}

function delmcplan(data) {
  return new Promise(function (resolve, reject) {
    //console.log("delmcplan 1:" + JSON.stringify(data.dellist))
    mcplan.deleteMany(
      { _id: { $in: data.dellist } },
      function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log('result ' + err)
        } else {
          //console.log("delmcplan 2:" + JSON.stringify(result))
          resolve(data)
        }
      },
    )
  })
}