/*//////////////////////////////////////////////////////////////////////////////
   factory2_handy            
   キーエンスハンディターミナルのスクリプト                                     
   ver1.0 2024-08-01 初期立ち上げ     
   ver1.1 2024-08-30 棚卸日を強制的に月末にする。
   ver1.2 2025-01-29 部品返却を追加。                                          
//////////////////////////////////////////////////////////////////////////////*/

console.log("ver 1.3")
var http_port = 8301;

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
  partlist,
  partcheck
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
  getStartDay,
  getInventDay
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


  server.post('/getpartinfo', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
  //  req.body.daystr = toDaystr();
    req.body.datalist = [];
    console.log(JSON.stringify(req.body))

    if (req.body._id != null) {
      getoldlabel(req.body)
        .then(getmodelog)
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
      console.log("getpartinfo:" + JSON.stringify(req.body))
      getpartinfo(req.body)
       // .then(getlotlist)
        .then(getmodelog)
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
  });


  server.post('/getpartinfo2', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
  //  req.body.daystr = toDaystr();
    req.body.datalist = [];

    console.log('/getpartinfo2' + JSON.stringify(req.body))

    if (req.body._id != null) {
      getoldlabel2(req.body)
        .then(getlotlist)
        .then(settotalexec)
        .then(getmodelog)
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
      console.log("getpartinfo:" + JSON.stringify(req.body))
      getpartinfo(req.body)
       // .then(getlotlist)
        .then(getmodelog)
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
  });


  server.post('/getpartinfo3', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
  //  req.body.daystr = toDaystr();
    req.body.datalist = [];

    console.log('/getpartinfo3' + JSON.stringify(req.body))

    if (req.body._id != null) {

      getoldlabel2(req.body)
        .then(getlotlist)
        .then(settotalexec)
        .then(getmodelog)
        .then(getchecklist)
        .then(getchecklog)
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
      console.log("getpartinfo:" + JSON.stringify(req.body))
      getpartinfo(req.body)
       // .then(getlotlist)
        .then(getmodelog)
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
  });

  server.post('/setlotlog', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;

    req.body.datalist = [];
  //  req.body.daystr = toDaystr();
    req.body.update_time = make_datetime();
    console.log(JSON.stringify(req.body));
  
    if (req.body.mode==1) {

        getserial(req.body)
          .then(setlotlist)
          .then(setlotstock)
          .then(setlotmoisture)
          .then(printlabel)
          .then(setlotlog)
          .then(getmodelog)
          .then((result) => {
          //  console.log("send:" + JSON.stringify(result))
            res.header('Access-Control-Allow-Origin', '*')
            res.send(result)
          })
          .catch((err) => {
            console.log("error:" + JSON.stringify(err))
            res.send(err)
          })
          
        } else if (req.body.mode==2 || req.body.mode==3 || req.body.mode==6) {

        setlotlog(req.body)
          .then(getlotlog)
          .then(gettotalstock)
          .then(getmodelog)

          .then((result) => {
          //  console.log("send:" + JSON.stringify(result))
            res.header('Access-Control-Allow-Origin', '*')
            res.send(result)
          })
          .catch((err) => {
            console.log("error:" + JSON.stringify(err))
            res.send(err)
          })
          

        } else if (req.body.mode==0 || req.body.mode==5) {

          setlotlog(req.body)
            .then(edtlotlist)
            .then(setlotstock)
            .then(getmodelog)
  
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

  server.get('/getpartlot', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.query.ip = clientIp;
  //  req.body.daystr = toDaystr();
    console.log(JSON.stringify(req.query))
      console.log("getpartlot:" + JSON.stringify(req.query))
      getpartlot(req.query)
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

  server.post('/setlog', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
    req.body.daystr = toDaystr();
    req.body.modename = "吸湿";   

    console.log(JSON.stringify(req.body))
      console.log("getpartlog:" + JSON.stringify(req.body));
      req.body.daystr = toDaystr();
      setmoisturelog(req.body)
        .then(setmoisturestock)
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

  server.get('/getlog', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

      getmoisturelog(req.query)
        .then(getlotinfo)
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

  server.post('/dellotlog', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
  
    console.log(clientIp)

    req.body.datalist = [];
   // req.body.daystr = toDaystr();
    console.log(toDaystr())

     dellotlog(req.body)
       .then(getlotlog)
       .then(gettotalstock)
       .then(getmodelog)
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


  server.get('/testprint', function (req, res) {
    console.log("testprint:" + JSON.stringify(req.query))
    var data = {
      modelname: "LR0.5RPT-9.8-8-CE24W-LF(SN)",
      lot: "1P13879240  7",
      qty: 999999,
      _id: "H100000",
      mode: 1,
      printer: req.query.printer
    }
    printlabel(data)
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

  server.post('/getmodelname', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
  //  req.body.daystr = toDaystr();
    req.body.datalist = [];
    req.body.daystr = getAddDay(new Date(),0);

    console.log('/getmodelname:' + JSON.stringify(req.body))

    getpartinfo(req.body)
      .then(getinventlog)
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

  server.post('/setinvent', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
    req.body.daystr = toDaystr();
    req.body.datalist = [];

    console.log('/setinvent:' + JSON.stringify(req.body))

    setinvent(req.body)
      .then(getinventlog)
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

  server.post('/delinvent', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
    req.body.daystr = toDaystr();
    req.body.datalist = [];

    console.log('/delinvent:' + JSON.stringify(req.body))

    delinvent(req.body)
      .then(getinventlog)
      .then((result) => {
      //  console.log("send:" + JSON.stringify(result))
        res.header('Access-Control-Allow-Origin', '*')
        res.send(result)
      })
      .catch((err) => {checkinfo3
        console.log("error:" + JSON.stringify(err))
        res.send(err)
      })
  });


  server.post('/setpartlist', function (req, res) {
    var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    var clientIp = ip.replace("::ffff:", "");

    req.body.ip = clientIp;
    req.body.daystr = toDaystr();
    req.body.datalist = [];

    console.log('/setpartlist:' + JSON.stringify(req.body))

    setpartlist(req.body)
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


  server.post('/getchecklist', function (req, res) {

    console.log('/getchecklist:' + JSON.stringify(req.body))

    getchecklist(req.body)
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

////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

   function getpartinfo(data) {  
    return new Promise(function (resolve, reject) {
      modellist.find({ _id: data.modelid }, function (err, docs) {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          console.log("TEST:"+JSON.stringify(docs))
          if (docs.length > 0) {
            data.modelname = docs[0].modelname;
          } else {
            data.modelname = "NODATA";
          }
          resolve(data);
        }
      });
    });
  }

  function getpartlot(data) {  
    return new Promise(function (resolve, reject) {
      lotlist.find({ _id: data.partid }, function (err, docs) {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          console.log("getpartlot:"+JSON.stringify(docs))
          resolve(docs);
        }
      });
    });
  }

  function getlotlist(data) {  
    return new Promise(function (resolve, reject) {
      lotlist.find({ _id: data._id }, function (err, docs) {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          if (docs.length > 0) {
            data.modelname = docs[0].modelname;
            data.modelid = docs[0].modelid;
            data.lot = docs[0].lot;                    
          }
          resolve(data);
        }
      });
    });
  }

  function getmodelog(data) {
   return new Promise(function (resolve, reject) {
    if (data._id != null) {
     lotlog.find({ ornerid: data._id.substring(0,7), daystr: toDaystr(), ip: data.ip }, function (err, docs) {
       if (err) {
         reject(err);
       } else {
         data.datalist = docs;
         resolve(data);
       }
     }).sort({ update_time: -1});
    } else {
      resolve(data);     
    }
   });
 }

 function setlotlist(data) {
  return new Promise(function (res, rej) {
    if (data.mode==1 && data._id != null) {
      data.stock = data.qty;
      console.log("lotlist:" + JSON.stringify(data));
      lotlist.updateOne({ _id: data._id }, 
        { $set: data }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          } else {
            data.msg = "登録完了"
          }
          res(data);
        });
    } else {
      res(data);
    }
  })
 }

 function setmoisturelog(data) {
  return new Promise(function (res, rej) {
    if (data.mode==4) {
      var id = data.ornerid + "-" + make_id() + "-4"
      data._id = id;
      console.log("setmoisturelog:" + JSON.stringify(data));
      lotlog.updateOne({ _id: data._id }, 
        { $set: data }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          } else {
            data.msg = "登録完了"
          }
          res(data);
        });
    } else {
      res(data);
    }
  })
 }

 function setmoisturestock(data) {
  return new Promise(function (res, rej) {
    if (data.mode==4) {
      var id = data.ornerid + "-" + make_id() + "-4"
      data._id = id;
      console.log("setmoisturestock:" + JSON.stringify(data));
      lotstock.updateOne({ _id: data.ornerid }, 
        { $set: { moisture: data.timeno }}, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          } else {
            data.msg = "登録完了"
          }
          res(data);
        });
    } else {
      res(data);
    }
  })
 }

 function getmoisturelog(data) {  
  return new Promise(function (resolve, reject) {
    lotlog.find({ daystr: toDaystr(), mode: 4 }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}

 function setlotlog(data) {
  return new Promise(function (res, rej) {
    var id = data._id + "-" + make_id() + "-" + data.mode;
    data.ornerid = data._id;
    data._id = id;
    if (data.mode==5) {
      data.daystr = getInventDay();
    } else if (data.mode==4){
      data.update_time = data.finishtime;
    } else {
      data.daystr = toDaystr();
    }

    console.log("log:" + JSON.stringify(data));
    lotlog.updateOne({ _id: data._id }, 
      { $set: data }, { upsert: true }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
          data.msg = "登録完了"
        }
        res(data);
    });
  })
 }

 function dellotlog(data) {
  return new Promise(function (res, rej) {
    console.log("log:" + JSON.stringify(data));
    lotlog.deleteOne({ _id: data._id }, 
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

 function getoldlabel(data) {  
  return new Promise(function (resolve, reject) {
    lotlist.find({ _id: data._id }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        if (docs.length > 0) {
          data.modelid = docs[0].modelid;
          data.modelname = docs[0].modelname;
          data.lot = docs[0].lot;
          data.qty = docs[0].qty;
          data.daystr = docs[0].daystr;
          data.stock = docs[0].stock;
          var qty = docs[0].stock + docs[0].use
          data.msg = "在庫:" + qty;
        }
        resolve(data);
      }
    });
  });
}

function getoldlabel2(data) {  
  return new Promise(function (resolve, reject) {
    var month = getStartDay(new Date(), 0);
    if (data.mode==5) {
      month = getStartDay(new Date(), -15);
    }
    lotstock.find({ ornerid: data._id, month: month }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        console.log("---"+JSON.stringify(docs));
        if (docs.length > 0) {
          data.ornerid = docs[0].ornerid;
          data.modelid = docs[0].info.modelid;
          data.modelname = docs[0].info.modelname;
          data.lot = docs[0].info.lot;
          data.qty = docs[0].info.qty;
          data.daystr = docs[0].month;
          data.stock = docs[0].stock;
        } else {
          data.stock = -1;
          data.msg = "データなし";
        }
        console.log("log:" + JSON.stringify(data))
        resolve(data);
      }
    });
  });
}

function settotalexec(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      console.log("settotalexec:" + JSON.stringify(data))
      if (data.stock != -1) {
        var total = data.stock;
        // console.log("loop:" + data.ornerid + " " + daylist[i].daystr);
        lotlog.find( { $and: [ {"ornerid": data.ornerid}, { daystr: { $gte: data.daystr }}, { "mode": { $lt: 5 }}] }, function(err, docs) {
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
                  total += item.qty;
                }
                if (item.mode==2) {
                  total -= item.qty;       
                }
                if (item.mode==3) {
                  total += item.qty;       
                }
              });             
            }
            data.qty = total;
            console.log("settotalexec 2:" + total)
            data.msg = "在庫:"  + total;
            res(data); 
        });
      } else {
        data.msg = "在庫:0";
        res(data);        
      }   
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

function getserial(data) {
  return new Promise(function(resolve, reject) { 
     if (data._id == null && data.mode==1) {
        setting.findOneAndUpdate({ _id: "partlabel" },
            { $inc: { value: 1 }},
            {upsert: true, new: true },function(err,result){
    // マッチしたドキュメントが docs[i].doc で取れる
                if (err) {
                    console.log("error " + err);
                } else {
                   console.log("getserial"+ JSON.stringify(result));
                   data._id = "H" + result.value;
                   resolve(data);
                }
          }); 
        } else {
          resolve(data);
        }       
  })
}

function getlotlog(data) {  
  return new Promise(function (resolve, reject) {
    console.log("getlotlog:" + data._id.substring(0,7) + " " + data.daystr)
    lotlog.find({ ornerid: data._id.substring(0,7), daystr: { $gte: data.daystr }}, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        if (docs.length > 0) {
          data.datalist = docs;
        }
        resolve(data);
      }
    }).sort({update_time: 1});
  });
}


function gettotalstock(data) {
  return new Promise(function (res, rej) {
    var en = data.datalist.length - 1;
    var use = 0;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        console.log("loop:" + JSON.stringify(data.datalist))
        if (data.datalist.length > 0) {
          
          switch (data.datalist[i].mode){
            case 0:
            //  use = data.datalist[i].qty;
              break;
            case 1:
          //    use += data.datalist[i].qty;
              break;
            case 2:
              use -= data.datalist[i].qty;
              break;
            case 5:
           //   use = data.datalist[i].qty;
              break;
          }
          resolve(i + 1);
        } else {
          resolve(i + 1);
        }
      })
        .then(function (count) {
          // ループを抜けるかどうかの判定
          if (count > en) {
            // 抜ける（外側のPromiseのresolve判定を実行）
            lotlist.updateOne({ _id: data._id.substring(0,7) }, 
              { $set: { daystr: toDaystr(), use: use } }, { upsert: false }
              , function (err, result) {
                if (err) {
                  rej(data);
                }
                res(data);
              });

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

function edtlotlist(data) {
  return new Promise(function (res, rej) {
    lotlist.updateOne({ _id: data._id.substring(0,7) }, 
      { $set: { daystr: toDaystr(), stock: data.qty } }, { upsert: true }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
          data.msg = data.qty + " に修正"
        }
        res(data);
    });
  })
 }

 function setlotstock(data) {
  return new Promise(function (res, rej) {
    if (data.mode==1 || data.mode==5) {
      var month = getStartDay(new Date(), 0);
      console.log("setstock 1:"+data.mode)
      var qty = data.qty;
      if (data.mode==5) {
        month = getStartDay(new Date(), 10);
      }
      if (data.mode==1){
        qty = 0;
      }
      var id = data._id.substring(0,7) + ":" + month;
      var ret = {
        _id: id,
        month: month,
        ornerid: data._id.substring(0,7),
        stock: qty,
        status: 0,
        moisture: 0,
        info: {
          modelname: data.modelname,
          lot: data.lot,
          modelid: data.modelid
        }
      }
      console.log("id:" + JSON.stringify(ret))
      lotstock.updateOne({ _id: ret._id }, 
        { $set: ret }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          }
          console.log("setstock 2:"+JSON.stringify(data))
          res(data);
        });
    } else {
      console.log("setstock 3:"+JSON.stringify(data))
      res(data);
    }
  })
 }

 function setlotmoisture(data) {
  return new Promise(function (res, rej) {
    if (data.mode==4) {
      var id = data._id.substring(0,7)
      console.log("id:" + JSON.stringify(id))
      lotlist.updateOne({ _id: id }, 
        { $set: { moisture: parseInt(data.timeno) } }, { upsert: false }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          }
          console.log("setlotmoisture:"+JSON.stringify(data))
          res(data);
        });
    } else {
      res(data);
    }
  })
 }

 function getinventlog(data) {  
  return new Promise(function (resolve, reject) {
    inventlog.find({ daystr: data.daystr, modelid: data.modelid }, function (err, docs) {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        console.log("datalist:" + JSON.stringify(docs));
        data.datalist = docs;
        resolve(data);
      }
    }).sort({update_time: -1});
  });
}

function setinvent(data) {
  return new Promise(function (res, rej) {
    data._id = data.ip + "-" + make_id();
    data.daystr = getAddDay(new Date(),0);
    data.update_time = make_datetime();    
    inventlog.updateOne({ _id: data._id }, 
      { $set: data }, { upsert: true }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
          data.msg = "登録完了"
        }
        res(data);
      });
  })
 }

 function delinvent(data) {
  return new Promise(function (res, rej) {
    console.log("log:" + JSON.stringify(data));
    inventlog.deleteOne({ _id: data._id }, 
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

 
async function getlotinfo(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
      // ループ処理（再帰的に呼び出し）
      var en = data.length-1;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {

            lotlist.find( { _id: data[i].ornerid }, function(err, docs) {
              if(err) {
              // console.log('func_workid_update Error!');
              reject(console.log('getplanview2: '+err)); 
              throw err;
              } 
                if (docs.length > 0) {

                    data[i].modelname = docs[0].modelname,
                    data[i].modelid = docs[0].modelid
                    data[i].lot = docs[0].lot    
                    
                    console.log("log-2:" + docs[0].lot)               
         
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


function setpartlist(data) {
  return new Promise(function (res, rej) {
      partlist.updateOne({ _id: data._id }, 
        { $set: data }, { upsert: true }
        , function (err, result) {
          if (err) {
            rej(console.log('update! ' + err));
          } else {
            data.msg = "登録完了"
          }
          res(data);
        });
  })
 }

 function getchecklist(data) {  
  return new Promise(function (resolve, reject) {
    if (data.mode==2) {
      if (data.listid !="") {
          data.flg=1;
          var id = data.listid.split(",")[1];
          console.log("id:"+ id)
          partlist.find({ _id: id }, function (err, docs) {
            if (err) {
              console.log(err)
              reject(err);
            } else {
              docs[0].partlist.forEach((item, index) => {
                console.log("getchecklist:--" + item.partid + " " + data.modelid);
                if (item.partid==data.modelid) {
                  data.flg = 0;
                  data.msg += "(照合OK)";
                  console.log("getchecklist:OK");
                }
              });
              data.partlist = docs[0].partlist;
              resolve(data);
            }
            
          })
      } else {
        data.partlist = [];
        resolve(data);
      }   
    } else {
      resolve(data);
    }  
  });
 }

 
 function getchecklog(data) {  
  return new Promise(function (resolve, reject) {
    if (data.mode==2) {
      if (data.listid !="") {
          var orderid = data.listid.split(",")[0];
          var modelid = data.listid.split(",")[1];          
          var ret = {
            _id:          orderid + "-" + make_id(),
            modelid:      data.modelid,
            modelname:    data.modelname,
            targetmodel:  modelid,
            orderid:      orderid,
            partid:       data._id, 
            status:       data.flg,
            workerid:     data.workerid,
            workername:   data.workername,
            update_time:  addDayTimestr(new Date()),  
          }
          partcheck.updateOne({ _id: ret._id }, 
            { $set: ret }, { upsert: true }
            , function (err, result) {
              if (err) {
                rej(console.log('update! ' + err));
              }
              resolve(data);
            });
      } else {
        data.partlist = [];
        resolve(data);
      }   
    } else {
      resolve(data);
    }  
  });
 }
