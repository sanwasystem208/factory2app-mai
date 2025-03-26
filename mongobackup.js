/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require('date-utils');

var backup = require('mongodb-backup');
 
var schedule = require('node-schedule');

var exec = require('child_process').exec;

var j = schedule.scheduleJob('0 23 * * *', function(){
   // clientIp = socket.request.connection.remoteAddress;
/*  backup({
    uri: 'mongodb://localhost/enegate', // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase> 
    root:'/mnt/enegate/mongodb/visualcheck_' + addDaystr() + '.backup'
  });*/


    // シェル上で実行するコマンド
    var COMMAND = 'mongodump -d planinfo -o /mnt/systembackup/backup_' + addDaystr() + '.backup';

    exec(COMMAND, function(error, stdout, stderr) {
      // シェル上でコマンドを実行できなかった場合のエラー処理
      if (error !== null) {
        console.log('exec error: ' + error);
        return;
      }

      // シェル上で実行したコマンドの標準出力が stdout に格納されている
      console.log('stdout: ' + stdout + " " + addDaystr());
    });
});  

function sirialname(startdate){
    var dt = new Date(startdate);
    var formatted = dt.toFormat("YYYYMMDDHH24MI");
  //  var ppp = ("00000"+processid).slice(-6);
    
    return formatted;
    
}

function addDaystr() {
       var date1 = new Date();

        // Date型を（YYYY/MM/DD）形式へ成型して返却
       var year = date1.getFullYear(); // 年
       var month = toDoubleDigits(date1.getMonth() + 1); // 月
       var day = toDoubleDigits(date1.getDate()); // 日
       var hour = toDoubleDigits(date1.getHours()); // 時
       var min = toDoubleDigits(date1.getMinutes()); // 分
       var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
       return  year + "-" + month + "-" + day;
}

function toDoubleDigits(num) {
      num += "";
      if (num.length === 1) {
        num = "0" + num;
      }
     return num;     
};
