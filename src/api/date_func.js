import moment from 'moment'

export default function (){

  var toDoubleDigits = function(num) {
      num += "";
      if (num.length === 1) {
        num = "0" + num;
      }
    return num;     
  };
  
  function getDateTime(str,i) {
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
    return  year + "-" + month + "-" + day + " " + hour + ":" + min; 
  }

  function getOffsetDate(str,i) {
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

  function getOffsetMonth(str,i) {
    var date1 = new Date(str);
    date1.setMonth(date1.getMonth() + i);  
  //   var off = weekday_offset(date1)  
  //   date1.setDays(date1.getDays() + off); 
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日 
    return  year + "-" + month + "-01"; 
  }

  function getOffsetMonth2(str,i,s) {
    var date1 = new Date(str);
    date1.setMonth(date1.getMonth() + i);  
  //   var off = weekday_offset(date1)  
  //   date1.setDays(date1.getDays() + off); 
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日 
    return  year + "-" + month + "-" + toDoubleDigits(s); 
  }

  function getOffsetDate2(str,i) {
    var date1 = new Date(str);
    date1.setDate(date1.getDate() + i);  
  //   var off = weekday_offset(date1)  
  //   date1.setDays(date1.getDays() + off); 
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日 
    return  year + "/" + month + "/" + day; 
  }

  function getMonthStr(str) {
    var date1 = new Date(str);
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    return  year + month; 
  }

  function today_offset(t) {
    var date1 = new Date();
    date1.setDate(date1.getDate() + t);
     // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
 
    return  year + "-" + month + "-" + day; 
 
 }

 function month_lastday(str) {
   let date = new Date(str);
   date.setMonth(date.getMonth()+1, 0);// 手順2と3を同時におこなっていま
   return formatDay(date)
 }

 function formatDay(date) {
  var date1 = new Date(date);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  return  year + "-" + month + "-" + day; 
}

function formatTime(date) {
  var date1 = new Date(date);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  return  hour + "時" + min + "分"; 
}

function addMonthStr(m) {
  var date1 = new Date();
   // Date型を（YYYY/MM/DD）形式へ成型して返却
  date1.setMonth(date1.getMonth() + m); 
  console.log("month:" + date1)
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  return  year + month; 
}

function make_daylist(startday, lastday){
  var list = [];
  var sday = new Date(startday)
//  var plist = JSON.parse(JSON.string

  list.push({ _id: null, 
              flg: 0,
              daystr: formatDay(sday),
              plan: 0,
              product: 0,
              inout: 0,
              use: 0,
              total: 0          
            } );
  for (let i = 0; i < 30; i++) {
    sday.setDate(sday.getDate() + 1);
    list.push({ _id: null,
                flg: 0,
                daystr: formatDay(sday),
                plan: 0,
                product: 0,
                inout: 0,
                use: 0,
                total: 0 
               } );
    if (lastday==formatDay(sday)) {
      sday.setDate(sday.getDate());
      list.push({ _id: null, 
              flg: 1,
              daystr: formatDay(sday)+"E",
              plan: 0,
              product: 0,  
              inout: 0,
              use: 0,
              total: 0       
            } );
      break
    }
  }
  return list
}


function make_daylist2(startday, lastday){
  var list = [];
  var sday = new Date(startday)
//  var plist = JSON.parse(JSON.string

  list.push({ _id: null, 
              flg: 0,
              daystr: formatDay(sday),
              plan: 0,
              product: 0,
              inout: 0,
              use: 0,
              total: 0          
            } );
  for (let i = 0; i < 30; i++) {
    sday.setDate(sday.getDate() + 1);
    list.push({ _id: null,
                flg: 0,
                daystr: formatDay(sday),
                plan: 0,
                product: 0,
                inout: 0,
                use: 0,
                total: 0 
               } );
    if (lastday==formatDay(sday)) {
      sday.setDate(sday.getDate());
      list.push({ _id: null, 
              flg: 1,
              daystr: "棚卸",
              plan: 0,
              product: 0,  
              inout: 0,
              use: 0,
              total: 0       
            } );
            list.push({ _id: null, 
              flg: 2,
              daystr: "差分",
              plan: 0,
              product: 0,  
              inout: 0,
              use: 0,
              total: 0       
            } );
      break
    }
  }
  return list
}

function addnextmonth(mon) {

  var y = mon.substr(0,4);
  var m = mon.substr(4,2); 
  var date1 = new Date(y + "-" + m + "-01");

  date1.setMonth(date1.getMonth()+1);
   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日

  return  year + month; 
}

function addnextstart(mon) {
 var y = mon.substr(0,4);
 var m = mon.substr(4,2); 
 var date1 = new Date(y + "-" + m + "-01");

 date1.setMonth(date1.getMonth()+1);
 // Date型を（YYYY/MM/DD）形式へ成型して返却
 var year = date1.getFullYear(); // 年
 var month = toDoubleDigits(date1.getMonth() + 1); // 月
 var day = toDoubleDigits(date1.getDate()); // 日

 return  year + month + "01"; 
}

function formatStartDay(mon) {
  var y = mon.substr(0,4);
  var m = mon.substr(6,2); 
  var date1 = new Date(y + "-" + m + "-01");
  date1.setMonth(date1.getMonth()+1);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日

  return  year + "-" + month + "-01"; 
 }

function addnextlast(mon) {
 var y = mon.substr(0,4);
 var m = mon.substr(4,2); 
 var last = formatDay(new Date(y, m, 0));
 return  last; 
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

function isNumber(val){
  var regex = new RegExp(/^[-+]?[0-9]+(\.[0-9]+)?$/);
  return regex.test(val);
}

function onDayValidator(value) {
  return isNaN(new Date(value)) ? 'NG' : null 
}

function onCurrentMonth() {
  var date1 = new Date();

  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  year + "-" + month; 
}

function getMonth_Day(str) {
  var date1 = new Date(str);
   // パラメータで取得した日数を加算
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日
   return  month + "/" + day; 
}
  
function weekno(day) {
  var sday = new Date(day);
  var wDay = sday.getDay();
  return wDay
}

function setReadTime(data,i) {
  var date1 = new Date(data); 
  date1.setDate(date1.getDate() + i);  
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日 
  return  year + "-" + month + "-" + day; 
}

function month_startday(str) {
  var date1 = new Date(str);
   // パラメータで取得した日数を加算
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   return  year + "-" + month + "-01"; 
}

function addYearStr(m) {
  var date1 = new Date();
  date1.setFullYear(date1.getFullYear() + m); 
  var year = date1.getFullYear(); // 年
    return  year; 
}

function monthoption() {
   var mt = [];
   var ystart = addYearStr(-1)
   var yend = addYearStr(1)

   for (var i = ystart; i <= yend ; i++) { //年のループ
     for(var m_i=1;m_i<=12;m_i++){ //月のループ
        var temp = "" + i + toDoubleDigits(m_i);
        mt.push({ value: temp, text: temp })        
     }
   }
  return mt;
}

function formatNumber(num) {
  return num.toLocaleString('ja-JP');
}

  return {
    toDoubleDigits,
    onDayValidator,
    getDateTime,
    getMonthStr,
    getOffsetDate,
    today_offset,
    month_lastday,
    formatDay,
    make_daylist,
    make_daylist2,
    addnextmonth,
    addnextstart,
    addnextlast,
    make_id,
    isNumber,
    formatTime,
    onCurrentMonth,
    getOffsetDate2,
    getMonth_Day,
    weekno,
    setReadTime,
    formatStartDay,
    month_startday,
    addMonthStr,
    monthoption,
    getOffsetMonth,
    formatNumber,
    getOffsetMonth2
  }
}