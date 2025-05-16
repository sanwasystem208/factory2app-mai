/*//////////////////////////////////////////////////////////////////////////////
   factory2_partlist            
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ 
   ver2.0 2025-01-29 部品返却追加                                             
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8302;

console.log("ver:2.0");

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
  inventlog
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


  server.post('/getpartlist', function (req, res) {

    var data = req.body;

   // console.log("getpartlist:" + JSON.stringify(data));

    getpartlist(data)
       .then(getpartlist_part)
       .then(refrashDaylist)
       .then(refrashDaylist2)
       .then((result) => {
       //  console.log("send:" + JSON.stringify(result))
         res.header('Access-Control-Allow-Origin', '*')
         res.send(result)
      })
       .catch((err) => {
         console.log("error:" + JSON.stringify(err))
         res.send(err)
      })
  })


  server.post('/getpartlist2', function (req, res) {

    var data = req.body;

    console.log("getpartlist2:" + JSON.stringify(data));

    getpartlist(data)
       .then(getpartlist_part)
       .then(refrashDaylist_m)
       .then(refrashDaylist2)
       .then((result) => {
       //  console.log("send:" + JSON.stringify(result))
         res.header('Access-Control-Allow-Origin', '*')
         res.send(result)
      })
       .catch((err) => {
         console.log("error:" + JSON.stringify(err))
         res.send(err)
      })
  })

  server.post('/getpartinfo', function (req, res) {
    console.log(JSON.stringify(req.body))

    getpartinfo(req.body)
      .then(getlotlog)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
      })
      .catch((err) => {
        console.log("error:" + JSON.stringify(err))
        res.send(err)
      })
  });

  server.post('/setpartdata', function (req, res) {
    console.log(JSON.stringify(req.body))
    setpartdata(req.body)
      .then(getpartlist)
      .then(refrashDaylist)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
      })
      .catch((err) => {
        console.log("error:" + JSON.stringify(err))
        res.send(err)
      })
  });

  server.post('/settasklist', function (req, res) {
    //console.log("settasklist:" + JSON.stringify(req.body))
    settasklist(req.body)
      .then(getpartlist)
      .then(refrashDaylist)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
      })
      .catch((err) => {
        console.log("error:" + JSON.stringify(err))
        res.send(err)
      })
  });

  server.post('/dellotlabel', function (req, res) {
    console.log(JSON.stringify(req.body))
     dellotlabel(req.body)
      .then(getpartinfo)
      .then(getlotlog)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
      })
      .catch((err) => {
        console.log("error:" + JSON.stringify(err))
        res.send(err)
      })
  });

  server.get('/getsuggest', function (req, res) {
    console.log("getsuggest:" + JSON.stringify(req.query))
    
    if (isNumber(req.query.str)) {
      getsuggest_modelid(req.query)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
     })
      .catch((err) => {
        console.log("error:" + JSON.stringify(err))
        res.send(err)
     })
    } else {
      getsuggest(req.query)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
     })
      .catch((err) => {
        console.log("error:" + JSON.stringify(err))
        res.send(err)
     })
    }

  })

  server.post('/printlabel', function (req, res) {
    console.log("printlabel:" + JSON.stringify(req.body))

    printlabel(req.body)
       .then((result) => {
       //  console.log("send:" + JSON.stringify(result))
         res.header('Access-Control-Allow-Origin', '*')
         res.send(result)
      })
       .catch((err) => {
         console.log("error:" + JSON.stringify(err))
         res.send(err)
      })
  })


  server.get('/getlotinventlog', function (req, res) {
    console.log("getlotinventlog:" + JSON.stringify(req.query))

    getlotinventlog(req.query)
       .then(getlotid_to_modelinfo)
       .then(getlotlog_modelsave)
       .then((result) => {
       //  console.log("send:" + JSON.stringify(result))
         res.header('Access-Control-Allow-Origin', '*')
         res.send(result)
      })
       .catch((err) => {
         console.log("error:" + JSON.stringify(err))
         res.send(err)
      })
  })

  server.get('/getinventlog', function (req, res) {
    console.log("getinventlog:" + JSON.stringify(req.query))

    getinventlog(req.query)
       .then((result) => {
       //  console.log("send:" + JSON.stringify(result))
         res.header('Access-Control-Allow-Origin', '*')
         res.send(result)
      })
       .catch((err) => {
         console.log("error:" + JSON.stringify(err))
         res.send(err)
      })
  })

  server.get('/getinventlog_group', function (req, res) {
    console.log("getinventlog_group:" + JSON.stringify(req.query))

    getinventlog_group(req.query)
       .then((result) => {
       //  console.log("send:" + JSON.stringify(result))
         res.header('Access-Control-Allow-Origin', '*')
         res.send(result)
      })
       .catch((err) => {
         console.log("error:" + JSON.stringify(err))
         res.send(err)
      })
  })

  server.get('/getlotinventlog_group2', function (req, res) {
    console.log("getlotinventlog_group:" + JSON.stringify(req.query))

    getlotinventlog_group(req.query)
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

function getpartlist(data) {
  return new Promise(function (resolve, reject) {

  //  console.log("getpartlist:" + JSON.stringify(data));
    var obj = { month: data.startday };
    if (data.filterstr != null) {
        if (data.filterstr.length > 2) {
          var arr = [];
          if (data.filterflg == 1) {
            arr.push({ "info.modelname": data.filterstr });
            arr.push({ "info.modelid": data.filterstr });
            arr.push({ "info.lot": data.filterstr }); 
            arr.push({ ornerid: data.filterstr });            
          } else  {
            arr.push({ "info.modelname": { $regex: data.filterstr, $options: "xi"}});
            arr.push({ "info.modelid": { $regex: data.filterstr, $options: "xi"}});
            arr.push({ "info.lot": { $regex: data.filterstr, $options: "xi"}});  
            arr.push({ ornerid: { $regex: data.filterstr, $options: "xi"}});  
          }        
         /* if (isNumber(data.filterstr)) {
            arr.push({ partid: parseInt(data.filterstr)});  
          }*/
          var tmp2 = { $or: arr};

          obj = Object.assign(obj, tmp2);    
        }
    }   

    lotstock.aggregate([
      { $match: obj },
      { $group: {"_id": { "_id": "$_id", 
                          "_ornerid": "$ornerid", 
                          "_month": "$month", 
                          "_stock": "$stock", 
                          "_status": "$status",
                          "_moisture": "$moisture",
                          "_info": "$info",
                        }}},
      { $project: {"_id": "$_id._id", 
                   "ornerid": "$_id._ornerid", 
                   "month": "$_id._month", 
                   "stock": "$_id._stock", 
                   "qty": "$_id._stock",
                   "status": "$_id._status",
                   "lot": "$_id._info.lot",
                   "modelname": "$_id._info.modelname",
                   "moisture": "$_id._moisture",
                   "info": "$_id._info",
                   "status": "0",
                   "inventposition": "0"
                  } },
   /*   {
        $lookup: {
          from: "lotlists",
          localField: "ornerid",
          foreignField: "_id",
          as: "orner"
        }
      },
      {
        $unwind: '$orner',  
      },*/
     /* { $project: {"_id": "$_id", 
                  "ornerid": "$ornerid", 
                  "modelname": "$orner.modelname", 
                  "stock": "$stock", 
                  "status": "$status", 
                  "lot": "$orner.lot", 
                  "modelid": "$orner.modelid", 
                  "qty": "$orner.qty"} },*/
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
      //  console.log("docs:" + JSON.stringify(docs));
        data.retdata = docs;
        resolve(data);
      });
  })
}


function getpartlist_part(data) {
  return new Promise(function (resolve, reject) {

 //   console.log("getpartlist:" + JSON.stringify(data));
    var obj = { month: data.startday };
    if (data.filterstr != null) {
        if (data.filterstr.length > 2) {
          var arr = [];
          if (data.filterflg == 1) {
            arr.push({ "info.modelname": data.filterstr });
            arr.push({ "info.modelid": data.filterstr });
            arr.push({ "info.lot": data.filterstr }); 
            arr.push({ ornerid: data.filterstr });            
          } else  {
            arr.push({ "info.modelname": { $regex: data.filterstr, $options: "xi"}});
            arr.push({ "info.modelid": { $regex: data.filterstr, $options: "xi"}});
            arr.push({ "info.lot": { $regex: data.filterstr, $options: "xi"}});  
            arr.push({ ornerid: { $regex: data.filterstr, $options: "xi"}});  
          }        
         /* if (isNumber(data.filterstr)) {
            arr.push({ partid: parseInt(data.filterstr)});  
          }*/
          var tmp2 = { $or: arr};

          obj = Object.assign(obj, tmp2);    
        }
    }   

    lotstock.aggregate([
      { $match: obj },
      { $group: {"_id": { "_month": "$month", 
                          "_modelname": "$info.modelname",
                          "_modelid": "$info.modelid",
                        },
                        _stock: { $sum: "$stock"}
                      }},
      { $project: {"month": "$_id._month", 
                   "stock": "$_stock", 
                   "modelname": "$_id._modelname",
                   "modelid": "$_id._modelid"
                  } }
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
      //  console.log("docs:" + JSON.stringify(docs));
        data.retdata2 = docs;
        resolve(data);
      });
  })
}

async function refrashDaylist(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  var daylist = data.daylist;
  for (const i in data.retdata) {
      var list = JSON.parse(JSON.stringify(daylist));
     // console.log("refrashDaylist loop:" + daylist.length)
      data.retdata[i].daylist = await settotalexec(data.retdata[i], list);
    //  var tmp = setlastqty(data.retdata[i])
  }
 // console.log("partsetDaylist last")
  return data
}


async function refrashDaylist_m(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  var daylist = data.daylist;
  for (const i in data.retdata) {
      var list = JSON.parse(JSON.stringify(daylist));
     // console.log("refrashDaylist loop:" + daylist.length)
      data.retdata[i].daylist = await settotalexec_m(data.retdata[i], list);
    //  var tmp = setlastqty(data.retdata[i])
  }
 // console.log("partsetDaylist last")
  return data
}

async function refrashDaylist2(data) {
  // for...of文でresourcesの配列から1つずつ要素を取り出して処理
//  console.log("partsetDaylist start")
  for (const i in data.retdata2) {
    var newLine = data.retdata.filter(function(item, index){
      if (item.modelname == data.retdata2[i].modelname) return true;
    });
   // console.log("refrashDaylist2 loop1:" + JSON.stringify(newLine))   
    const dayList = newLine.flatMap(data => data.daylist);
   // console.log("refrashDaylist2 loop2:" + JSON.stringify(dayList))
    data.retdata2[i].daylist = await getDaystrGroup(dayList)
    //  var tmp = setlastqty(data.retdata[i])
   // console.log("end")
  }
 // console.log("partsetDaylist last")
  return data
}

async function getDaystrGroup(arr) {
  var group = arr.reduce(function (result, current) {
    var element = result.find(function (p) {
      return p.daystr === current.daystr
    });
    if (element) {
      element.inout += current.inout,
      element.use += current.use,
      element.total += current.total
    } else {
      result.push({
        daystr: current.daystr,
        inout: current.inout,
        use: current.use,
        total: current.total,
      });
    }
    return result;
  }, []);
  return group
}

async function settotalexec(data, daylist) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = daylist.length-1;
      var total = data.stock;  
      var invent = 0;     
      var list = [];
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (daylist[i].flg==1) {
              var sabun = invent - total;
              daylist[i].use = sabun;  
              daylist[i].total = invent;    
              resolve(i + 1); 
          } else {
           // console.log("loop:" + data.ornerid + " " + daylist[i].daystr);
            lotlog.find( { $and: [ {"ornerid": data.ornerid}, {"daystr": daylist[i].daystr }] }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                if (docs.length > 0) {
                //  console.log("loop:" + JSON.stringify(docs));
                  docs.forEach((item, index) => {
                    if (item.mode==0) {
                      total = item.qty;
                    }
                    if (item.mode==1) {
                      daylist[i].inout += item.qty;
                      total += item.qty;
                    }
                    if (item.mode==2) {
                      daylist[i].use += item.qty;
                      total -= item.qty;    
                      console.log("use:"+daylist[i].use);
                    }
                    if (item.mode==3) {
                      daylist[i].use -= item.qty;
                      total += item.qty;       
                    }
                    if (item.mode==5) {
                      invent = item.qty;    
                    }
                    if (item.mode==6) {
                      daylist[i].inout -= item.qty;
                      total -= item.qty;       
                    }
                  });             
                }
                if (total < 0) {
                  total = 0;
                }
                daylist[i].total = total;
                resolve(i + 1); 
            });
          }
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
              daylist[daylist.length-1].total = invent;
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


async function settotalexec_m(data, daylist) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = daylist.length-1;
      var total = data.stock;  
      var invent = 0;     
      var list = [];
      var currenttotal = 0;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          if (daylist[i].flg==1) {
              var sabun = invent - total;
              daylist[i].use = sabun;  
              daylist[i].total = invent;    
              resolve(i + 1); 
          } else {
           // console.log("loop:" + data.ornerid + " " + daylist[i].daystr);
            lotlog.find( { $and: [ {"ornerid": data.ornerid}, {"daystr": daylist[i].daystr }] }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                if (docs.length > 0) {
                //  console.log("loop:" + JSON.stringify(docs));
                  docs.forEach((item, index) => {
                    if (item.mode==0) {
                      total = item.qty;
                    }
                    if (item.mode==1) {
                      daylist[i].inout += item.qty;
                      total += item.qty;
                    }
                    if (item.mode==2) {
                      daylist[i].use += item.qty;
                      total -= item.qty;    
                     // console.log("use:"+daylist[i].use);
                    }
                    if (item.mode==3) {
                      daylist[i].use -= item.qty;
                      total += item.qty;       
                    }
                    if (item.mode==5) {
                      invent = item.qty; 
                      console.log("inventposition:" + i);
                      currenttotal = total;   
                    }
                    if (item.mode==6) {
                      daylist[i].inout -= item.qty;
                      total -= item.qty;       
                    }
                  });             
                }
                if (total < 0) {
                  total = 0;
                }
                daylist[i].total = total;
                resolve(i + 1); 
            });
          }
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            console.log("invent:" + currenttotal + " " + invent);
              daylist[daylist.length-2].total = invent;
              daylist[daylist.length-1].total = currenttotal-invent;
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

async function settotalexec2(list) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = list[0].length-1;  
      var daystr = list[0].daystr; 
      var list = [];
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
     
            daystr.concat();
             
             resolve(i + 1); 
      }).then(function(count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
              daylist[daylist.length-1].total = invent;
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

function getpartinfo(data) {  
  return new Promise(function (resolve, reject) {
    lotstock.find({ _id: data._id }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        console.log("TEST:"+JSON.stringify(docs))
        if (docs.length > 0) {
          data.info = docs[0];
        }
        resolve(data);
      }
    });
  });
}

function getlotlog(data) {  
  return new Promise(function (resolve, reject) {
    lotlog.find({ ornerid: data._id.substring(0,7) }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        if (docs.length > 0) {
          data.datalist = docs;
        }
        resolve(data);
      }
    });
  });
}

function setpartdata(data) {
  return new Promise(function (res, rej) {
    lotstock.updateOne({ _id: data.params._id }, 
      { $set: data.params }, { upsert: false }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
        }
        res(data);
    });
  })
}

function dellotlabel(data) {
  return new Promise(function (res, rej) {
    console.log("log:" + JSON.stringify(data));
    lotstock.deleteOne({ _id: data._id }, 
       function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
          data.msg = "削除完了"
        }
        res(data);
    });
  })
}

function getsuggest(data) {  
  return new Promise(function (resolve, reject) {
    if (data.str.length > 0){
      lotstock.aggregate([
        { $match: { month: data.month, "info.modelname": { $regex: data.str, $options: "xi"} } },
        {
          $group: {
            _id: { _modelname: "$info.modelname"},
          }
        }],
        function (err, docs) {
          if (err) {
            console.log('getworklog Error!');
            reject(console.log('getworklog! ' + err));
            throw err;
          } else {
            var list = [];
            if (docs.length > 0) {
              docs.forEach((item, index) => {
                list.push(item._id._modelname);
              });  
            }
            data.retdata = list.sort(modelsort);
            resolve(data);
          }
        }); 
    } else {
      data.retdata = [];
      resolve(data);
    }
  });
}


function getsuggest_modelid(data) {  
  return new Promise(function (resolve, reject) {
    if (data.str.length > 0){
      lotstock.aggregate([
        { $match: { month: data.month, "info.modelid": { $regex: data.str, $options: "xi"} } },
        {
          $group: {
            _id: { _modelid: "$info.modelid"},
          }
        }],
        function (err, docs) {
          if (err) {
            console.log('getworklog Error!');
            reject(console.log('getworklog! ' + err));
            throw err;
          } else {
            var list = [];
            if (docs.length > 0) {
              docs.forEach((item, index) => {
                list.push(item._id._modelid);
              });  
            }
            data.retdata = list.sort(modelsort);
            resolve(data);
          }
        }); 
    } else {
      data.retdata = [];
      resolve(data);
    }
  });
}

function settasklist(data) {
  return new Promise(function (res, rej) {
    var en = data.params.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.params.length > 0) {
          console.log("loop:" + JSON.stringify(data.params[i]))
          lotlog.updateOne({ _id: data.params[i]._id }, 
            { $set: data.params[i] }, { upsert: true }
            , function (err, result) {
              if (err) {
                rej(console.log('update! ' + err));
              } else {
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

function printlabel(data) {
  return new Promise(function (resolve, reject) {
    if (data.mode==1) {
      console.log("printer:" + data.printer);
      var HOST = data.printer;
      var PORT = 1024;
      var net = require('net');
      var client = new net.Socket();
      var esc = String.fromCharCode(27);
      var str = "";
      client.connect(PORT, HOST, function () {

        str += esc + 'A';
        str += esc + 'A1V00250H0370';       
        str += esc + 'KC1';
        str += esc + 'H0010' + esc + 'V0010'; 
       // str += esc + "FW0202V0140H0400",
        str += esc + 'H0010' + esc + 'V0030';
        str += esc + 'P01' + esc + 'L0101';
        str += esc + 'X21,' + data.modelname.substring(0,23);
        if (data.modelname.length > 22) {
          str += esc + 'H0010' + esc + 'V0050';
          str += esc + 'P01' + esc + 'L0101';
          str += esc + 'X21,' + data.modelname.substring(23);
        }

        str += esc + 'H0010' + esc + 'V0080';
        str += esc + 'P01' + esc + 'L0101';
        str += esc + 'X21,' + data.lot; 

        str += esc + 'H0010' + esc + 'V0110';
        str += esc + 'P01' + esc + 'L0101';
        str += esc + 'X21,' + data._id; 

        str += esc + 'H0010' + esc + 'V0140';
        str += esc + 'P01' + esc + 'L0101';
        str += esc + 'X21,' + toDaystr();

        str += esc + 'H0010' + esc + 'V0170';
        str += esc + 'P01' + esc + 'L0101';
        str += esc + 'X22,' + data.qty;

        str += esc + 'H0150' + esc + 'V0110' + esc + '2D30,L,03,0,0';
        str += esc + 'DS2,' + data._id;
        //'2D30,L,04,0,0' + esc + 'DS2,' + '3N2-' & zero5(data.reelno) + '-' + zero6(data.lotid));

        str += esc + 'Q1';
        str += esc + 'Z';

        // 文字列を配列にしておく

        client.write(str); 
        client.destroy();
      //  var no = parseInt(data.no);
        data.msg = "SAVE!";    
        data.flg = 1;
        console.log("print:")
      resolve(data);
   //   client.close();
    });

    // クライアント側ソケットの'data'イベントハンドラーを定義します。
    // dataはサーバーがこのソケットに送信した内容になります。
    client.on('data', function (data) {
    //  console.log('DATA: ' + data);
      data.flg = 1;
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
        data.flg = 0;
        resolve(data);
      });
    } else {
      resolve(data);     
    }  
  });
}

function getinventlog(data) {  
  return new Promise(function (resolve, reject) {
    inventlog.find({ update_time: { $gt: addDayTimestr(data.start), $lt: addDayTimestr(data.last)} }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
       // data.retdata = docs;
        console.log(JSON.stringify(docs))
        resolve(docs);
      }
    }).sort({ modelid: 1});
  });
}

function getlotinventlog(data) {  
  return new Promise(function (resolve, reject) {
    lotlog.find({ update_time: { $gt: addDayTimestr(data.start), $lt: addDayTimestr(data.last)}, mode: 5 }, function (err, docs) {
   // lotlog.find({ }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
       // data.retdata = docs;
       // console.log(JSON.stringify(docs))
        resolve(docs);
      }
    }).sort({ modelid: 1});
  });
}


async function getlotid_to_modelinfo(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
            console.log("log-1:" + data[i].ornerid)
            lotlist.find( { _id: data[i].ornerid }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                if (docs.length > 0) {

                    data[i].modelname = docs[0].modelname,
                    data[i].modelid = docs[0].modelid
         
                }
                console.log("log-2:" + JSON.stringify(data[i]))
                resolve(i + 1); 
           });
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

function getinventlog_group(data) {
  return new Promise(function (resolve, reject) {

    console.log("getinventlog_group:" + JSON.stringify(data));
    var obj = { update_time: { $gt: addDayTimestr(data.start), $lt: addDayTimestr(data.last)} };
    lotlog.aggregate([
      { $match: obj },
      { $group: {"_id": { "_modelid": "$modelid", 
                          "_modelname": "$modelname"
                        },
                        "_qty": { $sum: "$qty"},
                        "_count": { $sum: 1},                       
                      }},
      { $project: {"modelid": "$_id._modelid", 
                   "modelname": "$_id._modelname", 
                   "qty": "$_qty", 
                   "count": "$_count",                    
                  } }
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
      //  console.log("docs:" + JSON.stringify(docs));
      //  data.retdata = docs;
        resolve(docs);
      });
  })
}

function getlotinventlog_group(data) {
  return new Promise(function (resolve, reject) {

    var obj = { update_time: { $gt: addDayTimestr(data.start), $lt: addDayTimestr(data.last)}, mode: 5 };
    lotlog.aggregate([
      { $match: obj },
      { $group: {"_id": { "_modelid": "$modelid", 
                          "_modelname": "$modelname"
                        },
                        "_qty": { $sum: "$qty"},
                        "_count": { $sum: 1},                       
                      }},
      { $project: {"modelid": "$_id._modelid", 
                   "modelname": "$_id._modelname", 
                   "qty": "$_qty", 
                   "count": "$_count",                    
                  } }
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        console.log("docs:" + JSON.stringify(docs));
      //  data.retdata = docs;
        resolve(docs);
      });
  })
}

async function getlotlog_modelsave(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {
          lotlog.updateOne({ _id: data[i]._id }, 
            { $set: { modelname: data[i].modelname, modelid: data[i].modelid }}, { upsert: true }
            , function (err, result) {
              if (err) {
                rej(console.log('update! ' + err));
              } else {
                console.log("update:" + JSON.stringify(result));
              }
              resolve(i + 1);
          });
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

function modelsort( a, b ){
  var r = 0;
  if( a < b ){ r = -1; }
  else if( a > b ){ r = 1; }

  return r;
}