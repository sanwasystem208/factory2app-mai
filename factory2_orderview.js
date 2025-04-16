/*//////////////////////////////////////////////////////////////////////////////
   factory2_orderview            
   注文表示のスクリプト                                     
   ver1.0 2024-08-21 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

console.log('Version : 1.0');

http_port = 8304;

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
  CheckReport,
  mcspec,
  mcplan
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
//var getIP = require('ipware')().get_ip;

// index.htmlから読み込まれている静的ファイルを送れるようにしておく
server.use(express.static(__dirname));

////////////////////////////////////////////////////////////////////////////////
//
//                              Ajax関数
//
////////////////////////////////////////////////////////////////////////////////

server.get('/getorderlist', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

 // console.log("getorderlist:"+JSON.stringify(req.query));

  getorderlist(req.query)
    .then(setproduct)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});


server.get('/getorderlist2', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

 // console.log("getorderlist2:"+JSON.stringify(req.query));

  getorderlist2(req.query)
    .then(setcheckreport)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});


server.get('/getorderlist3', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

 // console.log("getorderlist2:"+JSON.stringify(req.query));

  getorderlist2(req.query)
    .then(setcheckreport2)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.get('/getorderlist_old', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

 // console.log("getorderlist2:"+JSON.stringify(req.query));

  getorderlist_old(req.query)
    .then(setcheckreport2)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.post('/setselectdisable', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  //console.log("setselectdisable:"+JSON.stringify(req.body));

  setselectdisable(req.body)
    .then(getorderlist)
    .then(setproduct)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.get('/setdisableoff', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  //console.log("setdisableoff:"+JSON.stringify(req.query));

  setdisableoff(req.query)
    .then(getorderlist)
    .then(setproduct)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.get('/getmodellist', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  //console.log("getmodellist:"+JSON.stringify(req.query));

  getmodellist(req.query)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.post('/setorderdata', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var clientIp = ip.replace("::ffff:", "");

  console.log("setorderdata:"+JSON.stringify(req.body));

  setorderdata(req.body)
    .then(getorderlist_one)
    .then(setcheckreport2_one)
   // .then(getorderlist)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.post('/disabledata', function (req, res) {
  console.log("disabledata:"+JSON.stringify(req.body));
  disabledata(req.body)
    .then(onSenddata, onRejected);
  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }
  function onRejected(err) {
    res.send(err);
  }
});

server.post('/setmakeinstruct', function (req, res) {

  console.log("setmakeinstruct:"+JSON.stringify(req.body));

  setmakeinstruct(req.body)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.post('/setcheckflgreset', function (req, res) {
  console.log("setcheckflgreset:"+JSON.stringify(req.body));
  setcheckflgreset(req.body)
    .then(onSenddata, onRejected);
  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }
  function onRejected(err) {
    res.send(err);
  }
});

server.post('/setcheckflg', function (req, res) {

  console.log("setcheckflg:"+JSON.stringify(req.body));

  setcheckflg(req.body)
    .then(getorderlist_one)
    .then(setcheckreport2_one)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});

server.post('/getcheckflgdata', function (req, res) {

  console.log("getcheckflgdata:"+JSON.stringify(req.body));

  getcheckflgdata(req.body)
    .then(getorderids)
    .then(onSenddata, onRejected);

  function onSenddata(data) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(data);
  }

  function onRejected(err) {
    res.send(err);
  }

});


//ポート起動///////////////////////////////////////  
http.listen(http_port, function () {
  console.log('listening on *:' + http_port);
});

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 個別関数                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function getorderlist(data) {
  return  new Promise(function(res, rej) {


    var obj = { $and: [{disable: false},{endplan: false}] };

    var arr = [];
    if (data.filterstr != "" && data.filterstr != null) {
       arr.push({ modelname: { $regex: data.filterstr, $options: "xi"}});
       arr.push({ lot: { $regex: data.filterstr, $options: "xi"}});  
       arr.push({ _id: { $regex: data.filterstr, $options: "xi"}});       
    } 

    if (arr.length > 0){
      //console.log("getorderdata--str1-- :" + JSON.stringify(arr));  
      var tmp2 = { $or: arr};
     // obj = Object.assign(obj, tmp2);
       obj["$and"].push(tmp2);
    }

    //console.log("filter:"+JSON.stringify(obj));

    csvdata.find(obj, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        //console.log("docs:"+docs.length);
        docs.forEach((item, index) => {
          item.check = false;
        });
        data.retdata = docs;
        res(data);
      }
    }).sort({date: 1, modelname: 1}); 
   });       
}


function getorderlist2(data) {
  return  new Promise(function(res, rej) {


    var obj = { $and: [{disable: false},{endplan: false}] };

    var arr = [];
    if (data.filterstr != "" && data.filterstr != null) {
       arr.push({ modelname: { $regex: data.filterstr, $options: "xi"}});
       arr.push({ lot: { $regex: data.filterstr, $options: "xi"}});  
       arr.push({ _id: { $regex: data.filterstr, $options: "xi"}});       
    } 

    if (arr.length > 0){
      //console.log("getorderdata--str1-- :" + JSON.stringify(arr));  
      var tmp2 = { $or: arr};
     // obj = Object.assign(obj, tmp2);
       obj["$and"].push(tmp2);
    }

    //console.log("filter:"+JSON.stringify(obj));

    csvdata.aggregate([
      {$match: obj },
      {$group: { _id: { _id: "$_id", 
                        _qty: "$qty",
                        _modelid: "$modelid",
                        _modelname: "$modelname",
                        _date: "$date",
                        _price: "$price",
                        _destination: "$destination",
                        _makeinstruct: "$makeinstruct",
                        _makeinstruct2: "$makeinstruct2",
                        _disable: "$disable",
                        _endplan: "$endplan"
      }}},
      { $project: {"_id": "$_id._id", 
                   "qty": "$_id._qty", 
                   "modelid": "$_id._modelid",
                   "modelname": "$_id._modelname", 
                   "date": "$_id._date",
                   "price": "$_id._price",
                   "destination": "$_id._destination",
                   "makeinstruct": "$_id._makeinstruct",
                   "makeinstruct2": "$_id._makeinstruct2",
                   "disable": "$_id._disable", 
                   "endplan": "$_id._endplan",                        
                   "checkqty": "0",
                   "monthcheckqty": "0",
                   "monthcheckprice": "0",
                   "checklist": ""
                  }},
      { $sort: {"date": 1, "modeldata": 1} }
      ],
      function(err, docs) {   
         if(err) {
          console.log('err' + err);
            rej(console.log('workerid! '+err)); 
            throw err;
          } else {
            data.retdata = docs;
            res(data);  
          }   
    });
   });       
}


function getorderlist_old(data) {
  return  new Promise(function(res, rej) {


    var obj = { $and: [{ $or: [{disable: true},{endplan: true}]}] };

    var arr = [];
    if (data.filterstr != "" && data.filterstr != null) {
       arr.push({ modelname: { $regex: data.filterstr, $options: "xi"}});
       arr.push({ lot: { $regex: data.filterstr, $options: "xi"}});  
       arr.push({ _id: { $regex: data.filterstr, $options: "xi"}});       
    } 

    if (arr.length > 0){
      //console.log("getorderdata--str1-- :" + JSON.stringify(arr));  
      var tmp2 = { $or: arr};
     // obj = Object.assign(obj, tmp2);
       obj["$and"].push(tmp2);
    }

    //console.log("filter:"+JSON.stringify(obj));

    csvdata.aggregate([
      {$match: obj },
      {$group: { _id: { _id: "$_id", 
                        _qty: "$qty",
                        _modelid: "$modelid",
                        _modelname: "$modelname",
                        _date: "$date",
                        _price: "$price",
                        _destination: "$destination",
                        _endplan: "$endplan",
                        _disable: "$disable"
      }}},
      { $project: {"_id": "$_id._id", 
                   "qty": "$_id._qty", 
                   "modelid": "$_id._modelid",
                   "modelname": "$_id._modelname", 
                   "date": "$_id._date",
                   "price": "$_id._price",
                   "destination": "$_id._destination",
                   "endplan": "$_id._endplan",
                   "disable": "$_id._disable",            
                   "checkqty": "0",
                   "monthcheckqty": "0",
                   "monthcheckprice": "0",
                   "checklist": ""
                  }},
      { $sort: {"date": 1, "modeldata": 1} }
      ],
      function(err, docs) {   
         if(err) {
          console.log('err' + err);
            rej(console.log('workerid! '+err)); 
            throw err;
          } else {
            data.retdata = docs;
         //   console.log("length:" + docs.length)
            res(data);  
          }   
    });
   });       
}

function getmodellist(data) {
  return  new Promise(function(res, rej) {
    modellist.aggregate([
      {$group: { _id: { 
      _id: "$_id", 
      _modelname: "$modelname"  
      }}},
      { $project: {"value": "$_id._id", 
                   "text": "$_id._modelname", }},
      { $sort: {"text": 1} }
      ],
      function(err, docs) {   
         if(err) {
          console.log('err' + err);
            rej(console.log('workerid! '+err)); 
            throw err;
          } else {
            data.modellist = docs;
            res(data);  
          }   
    });
   });       
}

function disabledata(data) {
  return new Promise(function (res, rej) {
    var value = []
    var en = data.orderid.length - 1;
    function loop(i) {
      return new Promise(function (resolve, reject) {
        console.log("data.orderid[i]",data.orderid[i])
        if (data.orderid.length > 0) {
          csvdata.updateOne({ _id: data.orderid[i] }, { $set: { endplan: true }}, { upsert: false }, function (err, result) {
            if (err) {
              rej(console.log('update! ' + err));
            }
            value.push(result)
            resolve(i + 1)
          });
        } else {
          resolve(i + 1);
        }
      })
      .then(function (count) {
        if (count > en) {
          res(value);
        } else {
          loop(count);
        }
      });
    }
    loop(0);
  })
}

function setorderdata(data) {
  return new Promise(function (res, rej) {
    csvdata.findOneAndUpdate({ _id: data.value._id },
      { $set : data.value },{ new: true} ,function(err,result){
    // マッチしたドキュメントが docs[i].doc で取れる
      if (err) {
          console.log("error " + err);
      } else {
      //  console.log("getneworder3:"+ JSON.stringify(result));
        result.check = false;
        data.newValue = result;
        res(data);
      }
    });
  })
}

function setdisableoff(data) {
  return new Promise(function (res, rej) {
    csvdata.updateOne({ _id: data.orderid }, 
      { $set: { disable: false } }, { upsert: false }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
        }
        res(data);
    });
  })
}

function setselectdisable(data) {
  return new Promise(function (res, rej) {
    csvdata.updateMany({ _id: { $in: data.ids } }, 
      { $set: { disable: true } }, { upsert: false }
      , function (err, result) {
        if (err) {
          rej(console.log('update! ' + err));
        } else {
        }
        res(data);
    });
  })
}

function setproduct(data) {
  return new Promise(function (res, rej) {
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.retdata.length > 0) {
          data.retdata[i].checkqty = 0;
          data.retdata[i].shipmentqty = 0;
          CheckReport.aggregate([   
            { $match: { order_no: parseInt(data.retdata[i]._id) }}, 
            { $group: { _id: {"_production": "$production",
                              "_lotno": "$lotno",
                              "_lot_count": "$lot_count"
            },
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
              docs.forEach((item, index) => {
                if (item._id._production==1) {
                  data.retdata[i].checkqty += item._id._lot_count;            
                }
                if (item._id._production==2) {
                  data.retdata[i].shipmentqty += item._id._lot_count;           
                }
              });
            }
            resolve(i + 1)
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


function setcheckreport(data) {
  return new Promise(function (res, rej) {
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.retdata.length > 0) {
          data.retdata[i].checkqty = 0;
          data.retdata[i].monthcheckqty = 0;
          CheckReport.aggregate([   
            { $match: { order_no: parseInt(data.retdata[i]._id), production: 1 }}, 
            { $group: { _id: { _daystr: "$daystr" },
                        _sum: { $sum: "$lot_count" }
            },
            }
          ],
            function(err, docs) {   
            if(err) {
                console.log('err' + err);
                rej(console.log('getholiday! '+err)); 
                throw err;
            }
            docs.forEach((item, index) => {
             // console.log("length:" + item._id._daystr.substring(0,7).trim() + " " + data.month.trim());
              if (item._id._daystr.substring(0,7).trim()==data.month.trim()) {
              //  console.log("month:" + item._sum);
                data.retdata[i].monthcheckqty += item._sum;            
              }
              data.retdata[i].checkqty += item._sum;           
            });
            resolve(i + 1)
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


function setcheckreport2(data) {
  return new Promise(function (res, rej) {
    var en = data.retdata.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.retdata.length > 0) {
          data.retdata[i].checkqty = 0;
          data.retdata[i].monthcheckqty = 0;
          data.retdata[i].monthcheckprice = 0;
          CheckReport.aggregate([   
            { $match: { order_no: parseInt(data.retdata[i]._id), production: 1, lot_info: 1 }}, 
            { $group: { _id: { _daystr: "$daystr" },
                        _sum: { $sum: "$lot_count" }
            },
            },
            { $project: { daystr: "$_id._daystr",
                          qty: "$_sum"}
            },
            { $sort: { daystr: 1 }}
          ],
            function(err, docs) {   
            if(err) {
                console.log('err' + err);
                rej(console.log('getholiday! '+err)); 
                throw err;
            }
           // console.log("length:" + docs.length);
            data.retdata[i].checklist = docs;
            docs.forEach((item, index) => {
             // console.log("length:" + item._id._daystr.substring(0,7).trim() + " " + data.month.trim());
              if (item.daystr >= data.start && item.daystr <= data.last) {
              //  console.log("month:" + data.start + " " + data.last + " " + item.daystr);
                data.retdata[i].monthcheckqty += item.qty;    
                data.retdata[i].monthcheckprice += (item.qty * data.retdata[i].price);            
              }
              data.retdata[i].checkqty += item.qty;   

            });
            resolve(i + 1)
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
}/*//オーダー手動消し込み
function setmakeinstruct(data) {
  return new Promise(function (res, rej) {
    csvdata.findOneAndUpdate({ _id: data.orderid },
      { $set : { makeinstruct: true ,makeinstruct2: true} },{ new: true} ,function(err,result){
    // マッチしたドキュメントが docs[i].doc で取れる
      if (err) {
          console.log("error " + err);
      } else {
      //  console.log("getneworder3:"+ JSON.stringify(result));
        data.newValue = result;
        res(data);
      }
    });
  })
}*/
function setmakeinstruct(data) {
  return new Promise(function (res, rej) {
    csvdata.findOneAndUpdate({ _id: data.orderid, makeinstruct: true },
      { $set : { makeinstruct2: true} },{ new: true } ,function(err,result){
    // マッチしたドキュメントが docs[i].doc で取れる
      if (err) {
          console.log("error " + err);
      } else {
        data.newValue = result;
        res(data);
      }  
    });
  })
}

function setcheckflgreset(data) {
  return new Promise(function (res, rej) {
    csvdata.updateMany({ checkflg: true },{ $set: { checkflg: false }},function (err, result) {
    // マッチしたドキュメントが docs[i].doc で取れる
      if (err) {
          console.log("error " + err);
      } else {
      //  console.log("getneworder3:"+ JSON.stringify(result));
        data.newValue = result;
        res(data);
      }
    });
  })
}

function setcheckflg(data) {
  return new Promise(function (res, rej) {
    csvdata.findOneAndUpdate({ _id: data.orderid },
      { $set : { checkflg: data.checkflg, makeinstruct: true } },{ new: true } ,function(err,result){
    // マッチしたドキュメントが docs[i].doc で取れる
      if (err) {
          console.log("error " + err);
      } else {
      //  console.log("getneworder3:"+ JSON.stringify(result));
        data.newValue = result;
        res(data);
      }
    });
  })
}


function getcheckflgdata(data) {
  return  new Promise(function(res, rej) {
    csvdata.aggregate([
      {$match: { checkflg: true } },
      {$group: { _id: { _modelid: "$modelid",
                        _modelname: "$modelname"},
                        _sum: { $sum: "$qty"}
      }},
      { $project: {"modelid": "$_id._modelid",
                   "modelname": "$_id._modelname", 
                   "orderids": "",
                   "sum": "$_sum", 
                  }}
      ],
      function(err, docs) {   
         if(err) {
          console.log('err' + err);
            rej(console.log('workerid! '+err)); 
            throw err;
          } else {
            res(docs);  
          }   
    });
   });       
}

function getorderids(data) {
  return new Promise(function (res, rej) {
    var en = data.length - 1;
    function loop(i) {
      // 非同期処理なのでPromiseを利用
      return new Promise(function (resolve, reject) {
        if (data.length > 0) {
          csvdata.aggregate([   
            { $match: { modelid: data[i].modelid, checkflg: true }}, 
            { $group: { _id: { _id: "$_id" }}},
            { $project: { _id: "$_id._id" }}
          ],
          function(err, docs) {   
            if(err) {
                console.log('err' + err);
                rej(console.log('getholiday! '+err)); 
                throw err;
            }
            docs.forEach((item, index) => {
              data[i].orderids += item._id + " "
            });
            console.log("getorderids:"+ JSON.stringify(docs));
            resolve(i + 1)
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

function setcheckreport2_one(data) {
  return new Promise(function (resolve, reject) {
    data.newValue.checkqty = 0;   
    data.newValue.monthcheckqty = 0;
    data.newValue.monthcheckprice = 0;
    CheckReport.aggregate([   
      { $match: { order_no: parseInt(data.newValue._id), production: 1, lot_info: 1 }}, 
      { $group: { _id: { _daystr: "$daystr" },
                  _sum: { $sum: "$lot_count" } },
      },
      { $project: { daystr: "$_id._daystr",
                    qty: "$_sum" }
      },
      { $sort: { daystr: 1 }}
    ],
      function(err, docs) {   
      if(err) {
        console.log('err' + err);
        rej(console.log('getholiday! '+err)); 
        throw err;
      }
      // console.log("length:" + docs.length);
      data.newValue.checklist = docs;
      console.log("item:" + JSON.stringify(data));
      docs.forEach((item, index) => {
        // console.log("length:" + item._id._daystr.substring(0,7).trim() + " " + data.month.trim());
        if (item.daystr >= data.start && item.daystr <= data.last) {
          data.newValue.monthcheckqty += item.qty;    
          data.newValue.monthcheckprice += (item.qty * data.newValue.price);            
        }
        data.newValue.checkqty += item.qty;  
      });
      resolve(data);
    });
  })
}

function getorderlist_one(data) {
  return  new Promise(function(res, rej) {
    csvdata.aggregate([
      {$match: { _id: data.newValue._id } },
      {$group: { _id: { _id: "$_id", 
                        _qty: "$qty",
                        _modelid: "$modelid",
                        _modelname: "$modelname",
                        _date: "$date",
                        _price: "$price",
                        _destination: "$destination",
                        _makeinstruct: "$makeinstruct",
                        _makeinstruct2: "$makeinstruct2",
                        _disable: "$disable",
                        _endplan: "$endplan"
      }}},
      { $project: {"_id": "$_id._id", 
                   "qty": "$_id._qty", 
                   "modelid": "$_id._modelid",
                   "modelname": "$_id._modelname", 
                   "date": "$_id._date",
                   "price": "$_id._price",
                   "destination": "$_id._destination",
                   "makeinstruct": "$_id._makeinstruct",
                   "makeinstruct2": "$_id._makeinstruct2",
                   "disable": "$_id._disable", 
                   "endplan": "$_id._endplan",                        
                   "checkqty": "0",
                   "monthcheckqty": "0",
                   "monthcheckprice": "0",
                   "checklist": ""
                  }},
      { $sort: {"date": 1, "modeldata": 1} }
      ],
      function(err, docs) {   
         if(err) {
          console.log('err' + err);
            rej(console.log('workerid! '+err)); 
            throw err;
          } else {
            data.newValue = docs[0];
            res(data);  
          }   
    });
   });       
}