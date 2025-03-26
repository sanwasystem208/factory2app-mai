/*//////////////////////////////////////////////////////////////////////////////
   factory2_partlist            
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8306;

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
  mcgrid
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

  server.post('/setmcplan', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");
  
    //console.log("setmcplan:"+JSON.stringify(req.body));
  
    getsortno(req.body)        //新しいソートNo取得
       .then(getlastplanmodel) //1つ前の計画で切り替え時間を算出
       .then(getlastplan2) //以前の計画にかかる時間を取得
       .then(getworkday)  //新規計画の日別の計画を作成
       .then(setmcplan)   //新規計画を登録
       .then(getmctaskids)//スタート日からの計画ID取得
       .then(getmcplan)   //計画IDから計画を取得
       .then(getproducts)  //個別の実績を取得
       .then(getcsvinfo)  //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成
       .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  })

  server.post('/remakemcplan', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");
  
    //console.log("setmcplan:"+JSON.stringify(req.body));
  
    getmctaskids2(req.body)  //基準計画からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(delmctask_clear)//基準計画からの個別計画を削除
       .then(remakeMcplan) //現在登録済みの計画をループして再作成
       .then(getmctaskids)//スタート日からの計画ID取得
       .then(getmcplan)   //計画IDから計画を取得
       .then(getproducts)  //個別の実績を取得
       .then(getcsvinfo)  //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成
       .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      console.log("send:")
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  })

  
  server.post('/updatemcplan', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");
  
    console.log("updatemcplan:"+JSON.stringify(req.body));

    updatemcplan(req.body)
       .then(getmctaskids2)  //基準計画からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(delmctask_clear)//基準計画からの個別計画を削除
       .then(remakeMcplan) //現在登録済みの計画をループして再作成
       .then(getmctaskids)//スタート日からの計画ID取得
       .then(getmcplan)   //計画IDから計画を取得
       .then(getproducts)  //個別の実績を取得
       .then(getcsvinfo)  //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成
       .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      console.log("send:")
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

    delmcplan(req.body)      //計画の削除
       .then(delmctask)      //削除計画の日別計画を削除
       .then(getlastsortno)  //削除計画の一つ前の計画のソートNo取得
       .then(getmctaskids3)  //取得したソートNo以降の計画IDを取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(resetsettingtime)//取得した計画の切り替え時間を見直し
       .then(getmctaskids2)  //基準計画からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(delmctask_clear)//基準計画からの個別計画を削除
       .then(remakeMcplan) //現在登録済みの計画をループして再作成
       .then(getmctaskids)//スタート日からの計画ID取得
       .then(getmcplan)   //計画IDから計画を取得
       .then(getproducts)  //個別の実績を取得
       .then(getcsvinfo)  //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成
     /*  .then(getmctaskids2)  //削除計画からの計画ID取得
       .then(getmcplan)      //計画IDから計画を取得
       .then(delmctask_clear)//削除計画以降の個別計画を削除
       .then(getlastplan2)   // 残った計画の最終日とワーク時間を取得
       .then(refrashMctask)  //削除計画以降の個別計画を再作成
       .then(getmctaskids)  //スタート日からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(getproducts)    //個別の実績を取得
       .then(getcsvinfo)    //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成*/
       .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  })

  server.post('/refrashmcplan', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

   getlastsortno(req.body)   //削除計画の一つ前の計画のソートNo取得
       .then(getmctaskids3)  //取得したソートNo以降の計画IDを取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(resetsettingtime)//取得した計画の切り替え時間を見直し
       .then(getmctaskids2)  //基準計画からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(delmctask_clear)//基準計画からの個別計画を削除
       .then(refrashMctask)  //基準計画からの個別計画を再作成
       .then(getmctaskids)  //スタート日からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(getproducts)    //個別の実績を取得
       .then(getcsvinfo)    //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成
       .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  });

  server.post('/changemcplan', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

   changemcplan(req.body)    // 選択計画のソートNoを入れ替え
       .then(getlastsortno)  //削除計画の一つ前の計画のソートNo取得
       .then(getmctaskids3)  //取得したソートNo以降の計画IDを取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(resetsettingtime)//取得した計画の切り替え時間を見直し
       .then(getmctaskids2)  //基準計画からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(delmctask_clear)//基準計画からの個別計画を削除
       .then(remakeMcplan) //現在登録済みの計画をループして再作成
       .then(getmctaskids)//スタート日からの計画ID取得
       .then(getmcplan)   //計画IDから計画を取得
       .then(getproducts)  //個別の実績を取得
       .then(getcsvinfo)  //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成
     /*  .then(getmctaskids2)  //基準計画からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(delmctask_clear)//基準計画からの個別計画を削除
       .then(refrashMctask)  //基準計画からの個別計画を再作成
       .then(getmctaskids)  //スタート日からの計画ID取得
       .then(getmcplan)     //計画IDから計画を取得
       .then(getproducts)    //個別の実績を取得
       .then(getcsvinfo)    //核計画の情報を取得
       .then(refrashDaylist)//計画カレンダー作成*/
       .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  })

  server.post('/getmcplan', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");
  
   // console.log("getmcplan:"+JSON.stringify(req.body));
  
   // getmcdaylist(req.body)   //日別の勤務時間取得
    getmctaskids(req.body)   //スタート日からの計画ID取得
        .then(getmcplan)     //計画IDから計画を取得
        .then(getproducts)    //個別の実績を取得
        .then(getcsvinfo)    //核計画の情報を取得
        .then(refrashDaylist)//計画カレンダー作成
        .then(onSenddata, onRejected);
  
    function onSenddata(data) {
     // console.log("send:" + JSON.stringify(data.planlist))
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
        .then(getsettingtime)
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


  server.get('/getholiday2', function (req, res) {

    // console.log("getholiday:"+JSON.stringify(req.query));
   
       getholiday(req.query)
         .then(checkmcname)
         .then(getworkrate)
         .then(getholiday2)
         .then(getsettingtime)
         .then(getbasehour)
         .then(loopPlanGrid)
         .then(onSenddata, onRejected);
   
     function onSenddata(data) {
       res.header('Access-Control-Allow-Origin', '*');
       res.send(data);
     }
   
     function onRejected(err) {
       res.send(err);
     }
   
   })

  server.post('/setmcspec', function (req, res) {

    //  console.log("setmcspec:"+JSON.stringify(req.body));
  
      setmcspec(req.body)
        .then(onSenddata, onRejected);
  
    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }
  
    function onRejected(err) {
      res.send(err);
    }
  
  })

  server.post('/setplandata', function (req, res) {

    // console.log("setplandata:"+JSON.stringify(req.body));
 
     setplandata(req.body)
       .then(onSenddata, onRejected);
 
     function onSenddata(data) {
       res.header('Access-Control-Allow-Origin', '*');
       res.send(data);
     }
 
     function onRejected(err) {
       res.send(err);
     }
 
   })

  server.post('/setproduct', function (req, res) {

    console.log("setproduct:"+JSON.stringify(req.body));

   /* if (req.body.product==0) {
      setproduct(req.body)
        .then(getmctaskids2)  //基準計画からの計画ID取得
        .then(getmcplan)     //計画IDから計画を取得
        .then(delmctask_clear)//基準計画からの個別計画を削除
        .then(remakeMcplan) //現在登録済みの計画をループして再作成
        .then(getmctaskids)//スタート日からの計画ID取得
        .then(getmcplan)   //計画IDから計画を取得
        .then(getproducts)  //個別の実績を取得
        .then(getcsvinfo)  //核計画の情報を取得
        .then(refrashDaylist)//計画カレンダー作成
        .then(onSenddata, onRejected);  
    } else {*/
      setproduct(req.body)
        .then(delaftercurrenttask) //実績を入れた注文の後の機械計画を削除
        .then(getmctaskids2temp)  //取得したソートNo以降の計画IDを取得
        .then(delmctask_clear) //実績を入れた注文以降の機械計画を削除
        .then(getproduct)
        .then(refrashMctask_one) //実績を入れた日以降の
        .then(getmctaskids2temp)  //取得したソートNo以降の計画IDを取得
        .then(getmcplan)     //計画IDから計画を取得
      //  .then(delmctask_clear)//基準計画からの個別計画を削除
        .then(remakeMcplan) //現在登録済みの計画をループして再作成
        .then(getmctaskids)//スタート日からの計画ID取得
        .then(getmcplan)   //計画IDから計画を取得
        .then(getproducts)  //個別の実績を取得
        .then(getcsvinfo)  //核計画の情報を取得
        .then(refrashDaylist)//計画カレンダー作成
       /* .then(getmcplan)     //計画IDから計画を取得
        .then(refrashMctask)  //削除計画以降の個別計画を再作成
        .then(getmctaskids2)//スタート日からの計画ID取得
        .then(getmcplan)   //計画IDから計画を取得
        .then(getproducts)  //個別の実績を取得
        .then(getcsvinfo)  //核計画の情報を取得
        .then(refrashDaylist)//計画カレンダー作成*/
        .then(onSenddata, onRejected);
   // }
    
    function onSenddata(data) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(data);
    }

    function onRejected(err) {
      res.send(err);
    }

  })

  server.post('/setplan', function (req, res) {

   // console.log("setplan:"+JSON.stringify(req.body));

    setplan(req.body)
      .then(onSenddata, onRejected);

    function onSenddata(data) {
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

server.post('/setmodelpin', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  //console.log("setmodelpin:"+ req.body.length);

    setmodelpin(req.body)
      .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})

server.get('/getdayplan', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

    getdayplan(req.query)
      .then(getmcplaninfo)
      .then(getcsvinfo)
      .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

})
////////////////////////////////////////////////////////////////////////////////
//
//                              専用関数
//
////////////////////////////////////////////////////////////////////////////////

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
      data.planlist[i].checksum = await checksum(data.planlist[i]);
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
          if (data.plandata.length > 0) {
            data.plandata.forEach((item, index) => {
              if (item.workday==daylist[i].daystr) {
                daylist[i]._id = item._id;
                daylist[i].plan = item.plan;
                daylist[i].product = item.product;              
              }
            });
          }  
          resolve(i + 1); 
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


async function checksum(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.column.length-1;
      var total = 0;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
           // console.log("ornerid:"+ JSON.stringify(data))
          //console.log("loop:"+JSON.stringify(data.column[i]))]
          if (data.column[i].plan != undefined) {
            if (data.column[i].product==null) {
              total += data.column[i].plan;
            } else {
              total += data.column[i].product;
            }
          }
          resolve(i + 1); 
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
             // console.log("invent:" + invent); 
              res(total);
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

function getholiday(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    //console.log("getrangeday:"+data.month);
    var lastday = getAddDay(data.startday, 31);
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
                    no: ""
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
      //console.log("length:" + JSON.stringify(docs));
      var i = 0;
      docs.forEach((item, index) => {
        item.no = i;
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
                    workrate: ""
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
      console.log("length:" + JSON.stringify(docs));
      var i = 0;
      docs.forEach((item, index) => {
        item.no = i;
        item.workrate = data.workrate;
        i += 1;
      });
    //  console.log("getholiday2:" + JSON.stringify(docs));    
      data.daylist = docs;
      res(data)
    });
  })
}


async function loopPlanGrid(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  for (const i in data.daylist) {
    var dmmy = await setplangrid(data.modeltype, data.daylist[i].daystr)
    console.log("loop:" + dmmy.length)
  }
 // console.log("partsetDaylist last")
  return data
}

function setplangrid(modeltype, workday) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
   // ループ処理（再帰的に呼び出し）
   var en = 30;
   var uplist = [];
   function loop(i) {
     // 非同期処理なのでPromiseを利用
     return new Promise(function(resolve, reject) {
        // console.log("ornerid:"+ JSON.stringify(data))
        var id = modeltype + "-" + workday + ":" + i;
        mcgrid.find( { _id: id }, function(err, docs) {
          if(err) {
          // console.log('func_workid_update Error!');
          reject(console.log('getplanview2: '+err)); 
          throw err;
          } 
           //console.log("checkmcname 1:" + JSON.stringify(docs));
             if (docs.length== 0) {
/*
              modeltype: self.mc,
              startday: self.startday,
              basehour: 0,
              settingtime: 0,
              workrate: 0,
              daylist: null*/

               var mcgrid = {
                  _id:        id,
                  modeltype:  modeltype,
                  ornerid:    null,   
                  comment:    null, 
                  workday:    workday,  
                  plan:       0,
                  product:    null,
                  worktime:   0, 
                  settingtime:0,
                  lock:       0,   
                  no:         i, 
               }
               var upval = {
                 updateOne: {
                   filter: { _id: id },
                   update: { $set: mcgrid },
                   upsert: true
                 }
               }
               uplist.push(upval);
  
            resolve(i + 1) 
          } else {
           resolve(i + 1)   
          }  
       });
   }).then(function(count) {
       // ループを抜けるかどうかの判定
       if (count > en) {
         // 抜ける（外側のPromiseのresolve判定を実行）
         mcgrid.bulkWrite(uplist, 
          function (err, result) {
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log('error ' + err))
            } else {
              //console.log('bulkWrite:' + JSON.stringify(result))
              res(uplist)
            }
         }) 

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

function setmcspec(data) {
  return  new Promise(function(res, rej) {
   //  console.log("---" + JSON.stringify(data.id) + " " + JSON.stringify(data.upstr));
      mcspec.updateOne(
        { _id: data._id },
        { $set: data },
        { upsert: true },
        function (err, result) {
          // マッチしたドキュメントが docs[i].doc で取れる
          if (err) {
            rej(console.log('result ' + err))
          } else {
           // console.log("---00" + JSON.stringify(data));
            res(data);
          }
      })
  })
}

function updatemcplan(data) {
  return  new Promise(function(res, rej) {
     console.log("updatemcplan:" + JSON.stringify(data.value));
      mcplan.updateOne(
        { _id: data.value._id },
        { $set: data.value.update },
        { upsert: false },
        function (err, result) {
          // マッチしたドキュメントが docs[i].doc で取れる
          if (err) {
            rej(console.log('result ' + err))
          } else {
           // console.log("---00" + JSON.stringify(data));
            res(data);
          }
      })
  })
}

function setproduct(data) {
  return  new Promise(function(res, rej) {
     mctask.find( { _id: data._id}, function(err, docs) {
      if(err) {
      // console.log('func_workid_update Error!');
      reject(console.log('getplanview2: '+err)); 
      throw err;
      } 
        if (docs.length > 0) {

          mctask.findOneAndUpdate({ _id: data._id },
            { $set : { product: data.product }},{ new: true} ,function(err,result){
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
                console.log("error " + err);
            } else {
            //  console.log("getneworder3:"+ JSON.stringify(result));
              data.retvalue = result.product
              res(data);
            }
          });        
        } else {

          var id = data.startday + "-" + data.mcplan._id;
          data._id = id;
          //console.log("setproduct: " + JSON.stringify(data));
          mctask.updateOne(
            { _id: data._id },
            { $set: data },
            { upsert: true },
            function (err, result) {
              // マッチしたドキュメントが docs[i].doc で取れる
              if (err) {
                rej(console.log('result ' + err))
              } else {
                mctask.find( { _id: data._id}, function(err, docs) {
                  if(err) {
                  // console.log('func_workid_update Error!');
                  rej(console.log('getplanview2: '+err)); 
                  throw err;
                  } 
                    if (docs.length > 0) {
                      data.retvalue = docs[0].product;
                    }
                    res(data);
                  });    
              }
          })

        } 
    });
  })
}


function setplandata(data) {
  return  new Promise(function(res, rej) {

    mcplan.findOneAndUpdate({ _id: data._id },
      { $set : data.updatestr },{ new: true} ,function(err,result){
    // マッチしたドキュメントが docs[i].doc で取れる
      if (err) {
          console.log("error " + err);
      } else {
      //  console.log("getneworder3:"+ JSON.stringify(result));
        data.retrecord = result
        res(data);
      }
    });        
  })
}

function setplan(data) {
  return  new Promise(function(res, rej) {
     mctask.find( { _id: data._id}, function(err, docs) {
      if(err) {
      // console.log('func_workid_update Error!');
      reject(console.log('getplanview2: '+err)); 
      throw err;
      } 
        if (docs.length > 0) {

          mctask.findOneAndUpdate({ _id: data._id },
            { $set : { plan: data.plan }},{ new: true} ,function(err,result){
          // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
                console.log("error " + err);
            } else {
            //  console.log("getneworder3:"+ JSON.stringify(result));
              data.retvalue = result.plan
              res(data);
            }
          });        
        } else {

          var id = data.workday + "-" + data.ornerid;
          data._id = id;
          //console.log("setplan: " + JSON.stringify(data));
          mctask.updateOne(
            { _id: data._id },
            { $set: data },
            { upsert: true },
            function (err, result) {
              // マッチしたドキュメントが docs[i].doc で取れる
              if (err) {
                rej(console.log('result ' + err))
              } else {
                mctask.find( { _id: data._id}, function(err, docs) {
                  if(err) {
                  // console.log('func_workid_update Error!');
                  rej(console.log('getplanview2: '+err)); 
                  throw err;
                  } 
                    if (docs.length > 0) {
                      data.retvalue = docs[0].plan;
                    }
                    res(data);
                  });    
              }
          })

        } 
    });
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
                 var count = math.multiply(math.divide(math.multiply(math.multiply(docs[0].pice, docs[0].spm), 60), 100 ), 100) ;
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

      //.log("uplist:" + JSON.stringify(uplist))

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

function getmctaskids2(data) {
  return new Promise(function (resolve, reject) {
    var obj = { modeltype: data.modeltype, sortno: { $gte: data.sortno } };
   // console.log("getmctaskids:" + JSON.stringify(obj));
    mcplan.aggregate([
      { $match: obj },
      { $group: {"_id": { "_id": "$_id", 
                        }}},                         
      { $project: {"ornerid": "$_id._id", 
                } }
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        var ids = [];
        docs.forEach((item, index) => {
          ids.push(item.ornerid)
        });
        //console.log("getmctaskids2:" + JSON.stringify(docs));
        data.ids = ids;
        resolve(data);
      });
  })
}

function getmctaskids2temp(data) {
  return new Promise(function (resolve, reject) {
    var obj = { modeltype: data.modeltype, sortno: { $gt: data.sortno } };
    //console.log("getmctaskids2temp:" + JSON.stringify(obj));
    mcplan.aggregate([
      { $match: obj },
      { $group: {"_id": { "_id": "$_id", 
                        }}},                         
      { $project: {"ornerid": "$_id._id", 
                } }
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        var ids = [];
        docs.forEach((item, index) => {
          ids.push(item.ornerid)
        });
      //  console.log("getmctaskids2temp:" + JSON.stringify(docs));
        data.ids = ids;
        resolve(data);
      });
  })
}

function getmctaskids3(data) {
  return new Promise(function (resolve, reject) {
    if (data.lastsortno > 0) {
        var obj = { modeltype: data.modeltype, sortno: { $gte: data.lastsortno } };
      //  console.log("getmctaskids3:" + JSON.stringify(obj));
        mcplan.aggregate([
          { $match: obj },
          { $group: {"_id": { "_id": "$_id", 
                            }}},                         
          { $project: {"ornerid": "$_id._id", 
                    } }
        ],
          function (err, docs) {
            if (err) {
              reject(console.log('getworklog! ' + err));
            }
            var ids = [];
            docs.forEach((item, index) => {
              ids.push(item.ornerid)
            });
         //  console.log("getmctaskids3:" + JSON.stringify(docs));
            data.ids = ids;
            resolve(data);
          });
    } else {
      data.ids = [];   
      resolve(data);
    }   
  })
}

function getmctaskids(data) {
  return new Promise(function (resolve, reject) {
    var obj = { modeltype: data.modeltype, workday: { $gte: data.daylist[0].daystr } };   
  //  console.log("getmctaskids:" + JSON.stringify(obj));
    mctask.aggregate([
      { $match: obj },
      { $group: {"_id": { "_ornerid": "$ornerid", 
                        }}},                         
      { $project: {"ornerid": "$_id._ornerid", 
                } }
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        var ids = [];
        docs.forEach((item, index) => {
          ids.push(item.ornerid)
        });
       // console.log("getmcplan:" + JSON.stringify(docs));
        data.ids = ids;
        resolve(data);
      });
  })
}

function getmcplan(data) {
  return new Promise(function (resolve, reject) {
   // console.log("getmcplan---:" + JSON.stringify(data.ids));
    var obj = { _id: { $in: data.ids } };
    mcplan.aggregate([
      { $match: obj },
      { $group: {"_id": { "_id": "$_id", 
                          "_modeltype": "$modeltype", 
                          "_csvdataid": "$csvdataid", 
                          "_column": "$column",
                          "_qty": "$qty",
                          "_pice": "$pice",
                          "_addtime": "$addtime",
                          "_comment": "$comment",
                          "_daymaxcount": "$daymaxcount",
                          "_price": "$price",
                          "_settingtime": "$settingtime",
                          "_sortno": "$sortno",
                          "_modelid": "$modelid"
                        }}},    
      { $lookup: {
                          from: "mctasks",
                          localField: "_id._id",
                          foreignField: "ornerid",
                          as: "plandata"
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
                  "plandata": "$plandata",
                  "daymaxcount": "$_id._daymaxcount",
                  "price": "$_id._price",
                  "settingtime": "$_id._settingtime",
                  "check": "",
                  "product": "",
                  "sortno": "$_id._sortno",
                  "modelid": "$_id._modelid",
                  "checkcum": "",
                  "column": []
                } },
                { $sort: { "sortno": 1}}
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
     //   console.log("getmcplan---2:" + JSON.stringify(docs));
        data.planlist = docs;
        resolve(data);
      });
  })
}

async function getlastplan(data) {
  return new Promise(function (resolve, reject) {
    mctask.aggregate([
      { $match: { "workday": { $gte : data.startday }, modeltype: data.modeltype  } },
      { $group: {"_id": { "_id": null },
                 "_worktime": { $sum: "$worktime"},
                 "_settingtime": { $sum: "$settingtime"},          
                },
      },
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        //console.log("docs:" + JSON.stringify(docs))
        if (docs.length > 0) {
          data.fixedtime = docs[0]._worktime + docs[0]._settingtime;
        } else {
          data.fixedtime = 0;
        }
        resolve(data);
      });
  })
}


async function getlastplan2(data) {
  return new Promise(function (resolve, reject) {
    mctask.aggregate([
      { $match: { modeltype: data.modeltype } },
      { $group: {"_id": { "_workday": "$workday" },
                 "_worktime": { $sum: "$worktime"},
                 "_settingtime": { $sum: "$settingtime"},          
                },
      },
      { $sort: { "_id._workday": -1}}
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
       // console.log("getlastplan2:" + JSON.stringify(docs))
        if (docs.length > 0) {
          data.startday = docs[0]._id._workday;
          data.fixedtime = docs[0]._worktime + docs[0]._settingtime;
        } else {
          data.fixedtime = 0;
        }
        resolve(data);
      });
  })
}

async function getworkday(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var daylist = data.daylist.filter( function( value ) {
        return value.daystr >= data.startday;
      })
      var en = daylist.length-1;
      var daytime = 0;               //1日の勤務時間
      var workqty = 0;               //可能な生産個数
      var fixedtime = data.fixedtime;// + data.mcplan.settingtime;//残計画の時間 + 次の切り替え時間
      //var fixedtime = data.fixedtime;//残計画の時間
      var currenttime = math.divide(data.mcplan.qty, data.mcplan.daymaxcount); //該当機種が生産できる時間
      var workday = null;
      var planqty = data.mcplan.qty;
      var status = 0;
      var daymaxcount = data.mcplan.daymaxcount;
      var settingtime = data.mcplan.settingtime;
      data.mcplan.plandata = [];
      var uplist = [];
      var lastday = data.startday;
    //  console.log("getworkday:fixedtime:" + fixedtime)
    //  console.log("getworkday:settingtime:" + settingtime)
      function loop(i) { 
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
        //  console.log("workrate:" + data.daylist[i].worktime + " " + data.workrate);
          daytime = math.multiply(math.subtract(daylist[i].worktime, settingtime), data.workrate) ;//1日の勤務時間
          status = daylist[i].status;//0=休み,1=稼働日
          workday = daylist[i].daystr; //作業日
          var plandata = null;
          if (status > 0) { //休みはスキップ
            if (daymaxcount > 0 && planqty > 0) { //8時間の生産可能数が0以上で計画数が0以上

              if (fixedtime > 0) {
                if (daytime <= fixedtime) { //残りの勤務時間で残計画が入らない場合か同じ場合
                  fixedtime -= daytime;
                  daytime = 0;
                } else {                    //残りの勤務時間で残計画が入いる場合
                  daytime -= fixedtime; 
                  fixedtime = 0;
                }
              }

              if (daytime > 0){//残計画を引いて時間が余る場合

                if (daytime <= currenttime) { //残りの勤務時間で新規計画が入らないか同じ場合
                  currenttime -= daytime;
                  workqty = math.multiply(math.multiply(data.mcplan.pice, data.spm), math.multiply(daytime, 60));//余った勤務時間をすべて使い生産数算出               
                  planqty -= workqty;
                  plandata = { _id: workday + "-" + data.mcplan._id,
                               modeltype: data.modeltype,
                               ornerid: data.mcplan._id,
                               comment: null,
                               workday: workday, 
                               plan: Math.round(workqty), 
                               product: null,
                               worktime: daytime,
                               settingtime: settingtime, //最初の計画には切り替え時間を入れる
                               };
                  settingtime = 0;
                  lastday = workqty;
                } else {
                 // console.log("workday: " + data.mcplan.pice + " " + data.spm + " " + currenttime);
                  workqty = math.multiply(math.multiply(data.mcplan.pice, data.spm), math.multiply(currenttime, 60));//余った勤務時間をすべて使い生産数算出          
                 // planqty -= workqty; 
                  plandata = { _id: workday + "-" + data.mcplan._id,
                                modeltype: data.modeltype,
                                ornerid: data.mcplan._id,
                                comment: null,
                                workday: workday, 
                                plan: Math.round(workqty), 
                                product: null,
                                worktime: currenttime,
                                settingtime: settingtime,
                              };
                  settingtime = 0;
                  currenttime = 0;
                  planqty = 0;
                  lastday = workqty;
                }   
              }    
            } 
          } 
          
          if ( plandata != null ) {

            var upval = {
              updateOne: {
                filter: { _id: plandata._id },
                update: { $set: plandata },
                upsert: true
              }
            }
            uplist.push(upval);
            resolve(i + 1); 
          } else {
            resolve(i + 1);  
          }      
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
             // console.log("invent:" + invent);
             if (uplist.length > 0) {
               // console.log("bulkWrite:" + JSON.stringify(uplist))
                mctask.bulkWrite(uplist, 
                  function (err, result) {
                  // マッチしたドキュメントが docs[i].doc で取れる
                    if (err) {
                      rej(console.log('error ' + err))
                    } else {
                      //console.log('bulkWrite:' + JSON.stringify(result))
                      data.startday = lastday;
                      res(data)
                    }
                }) 
             } else {
               res(data);
             }
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

function delmctask(data) {
  return new Promise(function (resolve, reject) {
    mctask.deleteMany(
      {ornerid: { $in: data.dellist }},
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


function delmctask_clear(data) {
  return new Promise(function (resolve, reject) {
    mctask.deleteMany(
      { ornerid: { $in: data.ids }},
      function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log('result ' + err)
        } else {
          //console.log("delmctask clear:" + JSON.stringify(result));
          resolve(data)
        }
      },
    )
  })
}

async function refrashMctask(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  var daylist = data.daylist;
  for (const i in data.planlist) {
     // var list = JSON.parse(JSON.stringify(daylist));
      var list = clonedeep(daylist);
      var plan = {
        mcplan: data.planlist[i],
        daylist: list,
        startday: data.startday,
        modeltype: data.modeltype,
        spm: data.spm,
        basehour: data.basehour,
        fixedtime: data.fixedtime,
        workrate: data.workrate
      }  
      plan = await getlastplan(plan)
      var dmmy = await getworkday(plan);
      //console.log("loop 2:" + i);
    //  var tmp = setlastqty(data.retdata[i])
  }
  //console.log("refrashMctask")
  return data
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
        console.log("docs:" + JSON.stringify(docs))
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


function setmodelpin(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.length > 0){

            modellist.updateOne(
              { _id: data[i]._id },
              { $set: { pin: parseInt(data[i].pin) }},
              { upsert: false },
              function (err, result) {
                // マッチしたドキュメントが docs[i].doc で取れる
                if (err) {
                  rej(console.log('result ' + err))
                } else {
                 resolve(i + 1); 
                }
            })
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

function getsettingtime(data) {
  return  new Promise(function(res, rej) {
    //console.log("settingtime: start ");
    setting.find({ _id: "settingtime" }, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.settingtime = docs[0].value;
        //console.log("settingtime: last " + docs[0].value);
        res(data);
      }
    }); 
   });       
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


function getlastplanmodel(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
   // console.log("getlastplanmodel 1:"+ data.modeltype + " " + data.mcplan.sortno);
    mcplan.aggregate([   
      { $match: { modeltype: data.modeltype, sortno: { $lt: data.mcplan.sortno } }}, 
      { $group: { _id: { _id: "$_id",
                         _modelid: "$modelid",
                         _sortno: "$sortno"}}
      },
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
        if (data.mcplan.modelid == docs[0]._id._modelid) {
          data.mcplan.settingtime = 0;     
        } else{
          data.mcplan.settingtime = data.settingtime;  
        }
      } else {
        data.mcplan.settingtime = data.settingtime;
      }
      res(data)
    })
  })
}

function getlastsortno(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
   // console.log("getlastplanmodel 1:"+ data.modeltype + " " + data.mcplan.sortno);
    mcplan.aggregate([   
      { $match: { modeltype: data.modeltype, sortno: { $lt: data.sortno } }}, 
      { $group: { _id: null,
                  _lastsortno: { $max: "$sortno" }
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
        data.lastsortno = docs[0]._lastsortno;
      } else {
        data.lastsortno = 0;
      }
      res(data)
    })
  })
}


function resetsettingtime(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.planlist.length-1;
      var oldmodelid = 0;
      var settingtime = data.settingtime;
    //  console.log("settingtime:" + settingtime);
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.planlist.length > 0){
          //  console.log("loop:" + oldmodelid)
            if (oldmodelid > 0){
             // console.log("loop 2:" + oldmodelid + " " + data.planlist[i].modelid)
              if (oldmodelid != data.planlist[i].modelid ) {
                settingtime = data.settingtime;
              } else {
                settingtime = 0;
              }
              mcplan.findOneAndUpdate({ _id: data.planlist[i]._id },
                { $set : { settingtime: settingtime }},{ new: true} ,function(err,result){
              // マッチしたドキュメントが docs[i].doc で取れる
                if (err) {
                    console.log("error " + err);
                } else {
                //  console.log("getneworder3:"+ JSON.stringify(result));
                  oldmodelid = result.modelid;
                  resolve(i + 1); 
                }
              });  
            } else {
              oldmodelid = data.planlist[i].modelid;
              resolve(i + 1); 
            }
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

function delaftercurrenttask(data) {
  return new Promise(function (resolve, reject) {
    //console.log("delmcplan 1:" + JSON.stringify(data.dellist))
    mctask.deleteMany(
      { ornerid: data.mcplan._id, workday: { $gt: data.startday }},
      function (err, result) {
        // マッチしたドキュメントが docs[i].doc で取れる
        if (err) {
          console.log('result ' + err)
        } else {
        //  console.log("delaftercurrenttask:" + JSON.stringify(result))
          resolve(data)
        }
      },
    )
  })
}

function getproduct(data) {
  // 非同期処理なのでPromiseを利用
  return new Promise(function(resolve, reject) {
      //console.log("loop: " + data.planlist[i].csvdataid)
      mctask.aggregate([   
        { $match: { ornerid: data.ornerid }}, 
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
        if (docs.length > 0) {
          data.product = docs[0]._sum;;
       // } else {
       //   data.product = 0;
        }
       // console.log("getproduct:" + JSON.stringify(docs));
        resolve(data)
      });
  })
}

async function refrashMctask_one(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
  //console.log("refrashMctask_one start:" + JSON.stringify(data.mcplan))
  var daylist = data.daylist.filter( function( value ) {
    return value.daystr > data.startday;
  })
 // console.log("loop 0:");
  data.settingtime = 0; //同じロットの続きなので切替０時間
  data.mcplan.settingtime = 0; //同じロットの続きなので切替０時間
  data.mcplan.qty -= data.product; 
  //console.log("loop:" + data.orner._id + " " + daylist);  
  var plan = {
    ornerid: data.mcplan._id,
    mcplan: data.mcplan,
    daylist: daylist,
    startday: data.startday,//〇開始日
    modeltype: data.modeltype,
    spm: data.spm,
    basehour: data.basehour,
    fixedtime: 0,  //以前の計画
    product: data.product, //〇済計画数
    workrate: data.workrate,
  } 
 // console.log("refrashMctask_one:" + JSON.stringify(plan)); 
  var dmmy = await getworkday(plan);
   data.startday = dmmy.startday;
   data.sortno = data.sortno;
  // console.log("loop 2:");
  return data
}

async function remakeMcplan(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
 // console.log("remakeMcplan start:" + JSON.stringify(data))
  for (const i in data.planlist) {

    //console.log("loop start:" + JSON.stringify())
    var senddata = {
      spm:        data.spm,
      basehour:   data.basehour,
      settingtime: data.settingtime,
      workrate:   data.workrate,
      modeltype:  data.modeltype, 
    //  filter1:    data.filter1, 
      mcplan:     data.planlist[i], 
      daylist:    data.daylist,
      ids: null,
      planlist:   null,
      startday:   data.startday,
      fixedtime:  0
    } 

   // getlastplanmodel(senddata) //1つ前の計画で切り替え時間を算出
     await getlastplan2(senddata) //以前の計画にかかる時間を取得
        .then(getworkday)  //新規計画の日別の計画を作成
        .then(setmcplan)   //新規計画を登録
        .then(getmctaskids)//スタート日からの計画ID取得
        .then(getmcplan)   //計画IDから計画を取得
        .then(getproducts)  //個別の実績を取得
        .then(getcsvinfo)  //核計画の情報を取得
        .then(refrashDaylist)//計画カレンダー作成
        .then(console.log("remakeMcplan:" + i));
  }
 // console.log("remakeMcplan last")
  return data
}


function getdayplan(data) {
  return  new Promise(function(res, rej) {
    mctask.aggregate([
      { $match: { workday: data.daystr } },
      { $group: {"_id": { "_id": "$_id",
                          "_modeltype": "$modeltype",
                          "_ornerid": "$ornerid",
                          "_plan": "$plan",
                          "_product": "$product",
                          "_worktime": "$worktime",
                          "_comment": "$comment"
       }},
      },
      { $sort: { "_id._modeltype": 1 }},
      { $project: {"_id": "$_id._id", 
                   "modeltype": "$_id._modeltype",    
                   "ornerid": "$_id._ornerid",
                   "plan": "$_id._plan",   
                   "product": "$_id._product",   
                   "worktime": "$_id._worktime", 
                   "comment": "$_id._comment",
                   "planinfo": "",
                   "csvdataid": "",
                   "modelname": "",
                   "modelid": ""                                                   
      }},
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        console.log("getdayplan:" + JSON.stringify(docs))
        data.planlist = docs;
        res(data);
      });
  })
}


function getmcplaninfo(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.planlist.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (data.planlist.length > 0){
            console.log("loop: " + data.planlist[i].ornerid)
            mcplan.find( { _id: data.planlist[i].ornerid }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
              console.log("loop 2: " + JSON.stringify(docs))
              data.planlist[i].planinfo = docs[0];
              data.planlist[i].csvdataid = docs[0].csvdataid;            
              resolve(i + 1); 
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

