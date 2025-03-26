/*//////////////////////////////////////////////////////////////////////////////
   factory2_partlist            
   部品一覧のスクリプト                                     
   ver1.0 2024-06-30 初期立ち上げ                                              
//////////////////////////////////////////////////////////////////////////////*/

var http_port = 8307;

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
  mcspec
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
  setReadTime,
  weekNo,
  weekName
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

server.get('/getholiday', function (req, res) {

  console.log("getholiday:" + JSON.stringify(req.query));
  
  getbasehour(req.query)
    .then(gettempholiday)
    .then(checkmcname)
    .then(getholiday)
    .then((result) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

server.get('/setholiday', function (req, res) {

  console.log("setholiday:" + JSON.stringify(req.query));
  
  getbasehour(req.query)
    .then(getmcspec)
    .then(setholiday)
    .then(gettempholiday)
    .then(checkmcname)
    .then(getholiday)
    .then((result) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

server.get('/changeholiday', function (req, res) {

  console.log("changeholiday:" + JSON.stringify(req.query));
  
  changeholiday(req.query)
    .then(gettempholiday)
    .then(checkmcname)
    .then(getholiday)
    .then((result) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

server.get('/changeworktime', function (req, res) {

  console.log("changeworktime:" + JSON.stringify(req.query));
  
  changeworktime(req.query)
    .then(gettempholiday)
    .then(checkmcname)
    .then(getholiday)
    .then((result) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

////////////////////////////////////////////////////////////////////////////////
//
//                              専用関数
//
////////////////////////////////////////////////////////////////////////////////

function gettempholiday(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
    console.log("getrangeday:"+data.month);
    holidays.aggregate([   
      { $match: { month: data.day.substr(0,7) }}, 
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
           console.log("checkmcname 1:" + JSON.stringify(docs));
             if (docs.length== 0) {
              if (data.modeltype == "-" || data.modeltype == null) {
                resolve(i + 1) 
              } else {
                var mcname = {
                  _id: data.daylist[i]._id + "-" + data.modeltype,
                  modeltype: data.modeltype,
                  worktime: parseFloat(data.daylist[i].worktime)
                }
                console.log("checkmcname 2:" + JSON.stringify(mcname));
                holidays.updateOne(
                  { _id: data.daylist[i]._id },
                  { $push: { mcnames: mcname } },
                  { upsert: true },
                  function (err, result) {
                    // マッチしたドキュメントが docs[i].doc で取れる
                    if (err) {
                      reject(console.log('checkmcname ' + err))
                    } else {
                      console.log("---00" + JSON.stringify(result));
                    resolve(i + 1) 
                    }
                })
              }
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
      console.log("modeltype:" + data.modeltype)
      if (data.modeltype == "-" || data.modeltype == null) {
        holidays.aggregate([   
          { $match: { month: data.day.substr(0,7) } }, 
          { $group: { _id: { _id: "$_id",
                            _daystr: "$daystr",
                            _weekname: "$weekname", 
                            _status: "$status",
                            _title: "$title",  
                            _worktime: "$worktime"                          
          },
          }},
          { $project: { id: "$_id._id", 
                        start: "$_id._daystr",
                        end: "$_id._daystr",
                        title: "$_id._title",
                        display: '',
                        status: "$_id._status",
                        textColor: "black",
                        worktime: "$_id._worktime",
                        color:  
                        {
                          $switch:
                            {
                              branches: [
                                { case: { $eq: [ "$_id._status", 0 ] }, then: 'silver' },
                                { case: { $eq: [ "$_id._status", 1 ] }, then: 'pink' }
                            ]
                            }
                        } 
                    }  
          },
        ],
          function(err, docs) {   
          if(err) {
              console.log('err' + err);
              rej(console.log('getholiday! '+err)); 
              throw err;
          }
          console.log("docs1:" + docs.length)
          data.events = docs;
          res(data)
        });
      } else {
        console.log("--" + data.day.substr(0,7) + " " + data.modeltype);
        holidays.aggregate([   
          { $unwind: "$mcnames" },
          { $match: { month: data.day.substr(0,7) , "mcnames.modeltype": data.modeltype }}, 
          { $group: { _id: { _id: "$_id",
                            _daystr: "$daystr",
                            _weekname: "$weekname", 
                            _status: "$status",
                            _title: "$title",  
                            _worktime: "$mcnames.worktime"                          
          },
          }},
          { $project: { id: "$_id._id", 
                        start: "$_id._daystr",
                        end: "$_id._daystr",
                        title: "$_id._title",
                        display: '',
                        status: "$_id._status",
                        textColor: "black",
                        worktime: "$_id._worktime",
                        color:  
                        {
                          $switch:
                            {
                              branches: [
                                { case: { $eq: [ "$_id._status", 0 ] }, then: 'silver' },
                                { case: { $eq: [ "$_id._status", 1 ] }, then: 'pink' }
                            ]
                            }
                        } 
                    }  
          },
        ],
          function(err, docs) {   
          if(err) {
              console.log('err' + err);
              rej(console.log('getholiday! '+err)); 
              throw err;
          }
          console.log("docs2:" + JSON.stringify(docs))
          data.events = docs;
          res(data)
        });       
      }  
  })
}


function setholiday(data) {
  // ループ処理の完了を受け取るPromise
  return  new Promise(function(res, rej) {
     // console.log("info.processlists:" + JSON.stringify(info.processlists))
      // ループ処理（再帰的に呼び出し）
      var en = data.count;
      function loop(i) {
        // 非同期処理なのでPromiseを利用
        return new Promise(function(resolve, reject) {

          console.log("loop 0:" + data.day + " " + i);  

          var day = setReadTime(data.day, i);
          var no = weekNo(day);
          var status = 1;
          var title = "出勤日"
          if (no==0 || no==6) {
            status = 0;
            title = "休日"
          }

          console.log("loop 1:" + day);  
          
          data.mcspec.forEach((item, index) => {
            item._id = day + ":" + item.modeltype;
            item.worktime = data.defaultworktime;
          });

            var ho = {
              _id: day,
              month: day.substr(0,7),
              title: title,
              daystr: day,
              weekname: weekName(day),
              status: status,
              worktime: 20.0,
              mcnames: data.mcspec
            }

            console.log("loop 2:" + JSON.stringify(ho));

            holidays.updateOne(
              { _id: ho._id },
              { $set: ho },
              { upsert: true },
              function (err, result) {
                // マッチしたドキュメントが docs[i].doc で取れる
                if (err) {
                  console.log('result ' + err)
                } else {
                  resolve(i+1)
                }
              },
            )

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

function changeholiday(data) {
  return  new Promise(function(res, rej) {
     console.log("changeholiday:" + JSON.stringify(data));
      var worktime = data.defaultworktime;
      var title = "出勤日";
      if (data.modeltype=="-") {
          if (data.status==0) {
            title="休日";
            worktime=0;
          }
          holidays.updateOne(
            { _id: data.day },
            { $set: { status: data.status, title: title, worktime: worktime } },
            { upsert: false },
            function (err, result) {
              // マッチしたドキュメントが docs[i].doc で取れる
              if (err) {
                rej(console.log('result ' + err))
              } else {
              //  console.log("---00" + JSON.stringify(data));
                res(data);
              }
          })
      } else {
        if (data.status==0) {
          title="休日";
          worktime=0;
        }
        holidays.updateOne(
          { _id: data.day, "mcnames.modeltype": data.modeltype },
          { $set: { "mcnames.$.worktime": worktime , status: data.status, title: title } },
          { upsert: false },
          function (err, result) {
            // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log('result ' + err))
            } else {
              console.log("nest update:" + JSON.stringify(result));
              res(data);
            }
        })       
      }  
  })
}


function changeworktime(data) {
  return  new Promise(function(res, rej) {
   //  console.log("---" + JSON.stringify(data.id) + " " + JSON.stringify(data.upstr));
      if (data.modeltype=="-") {
          holidays.updateMany(
            { _id: { $gte: data.startday, $lt: data.endday }, status: 1 },
            { $inc: { worktime: parseFloat(data.num) } },
            { upsert: false },
            function (err, result) {
              // マッチしたドキュメントが docs[i].doc で取れる
              if (err) {
                rej(console.log('result ' + err))
              } else {
              //  console.log("---00" + JSON.stringify(data));
                res(data);
              }
          })
      } else {
        console.log("changeholiday:" + data.startday + " " +  data.endday + " " + data.modeltype);
        holidays.updateMany(
          { _id: { $gte: data.startday, $lt: data.endday }, "mcnames.modeltype": data.modeltype, status: 1 },
          { $inc: { "mcnames.$.worktime": parseInt(data.num) } },
          { upsert: false },
          function (err, result) {
            // マッチしたドキュメントが docs[i].doc で取れる
            if (err) {
              rej(console.log('result ' + err))
            } else {
            //  console.log("---00" + JSON.stringify(data));
              res(data);
            }
        })       
      }  
  })
}

function getbasehour(data) {
  return  new Promise(function(res, rej) {
    setting.find({ _id: "basehour" }, function (err, docs) {
      if (err) {
        console.log(err)
        rej(err);
      } else {
        data.defaultworktime = docs[0].value;
        res(data);
      }
    }); 
   });       
}

function getmcspec(data) {
  return new Promise(function (resolve, reject) {
    mcspec.aggregate([
      { $group: {"_id": { "_modeltype": "$modeltype", 
                        }}
      },
      { $project: {"modeltype": "$_id._modeltype",
                   "_id": "",
                   "worktime": "" 
                } 
      },
      { $sort: { value: 1 } },
    ],
      function (err, docs) {
        if (err) {
          reject(console.log('getworklog! ' + err));
        }
        console.log("mcspec:" + JSON.stringify(docs));
        data.mcspec = docs;
        resolve(data);
      });
  })
}
