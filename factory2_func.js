/*///////////////////////////////////////////////////////////////////////////////
var:1.0 2024-07-05 新規作成
///////////////////////////////////////////////////////////////////////////////*/
console.log("func version:1.0")

function toDoubleDigits(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
  return num;     
};

function getAddDay(str,i) {
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

function make_datetime() {
    var date1 = new Date();
  
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
    var hour = toDoubleDigits(date1.getHours()); // 時
    var min = toDoubleDigits(date1.getMinutes()); // 分
    var sec = toDoubleDigits(date1.getSeconds()); // 秒 
  
  return  year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec; 
}

function addDaystr(str) {
    var date1 = new Date(str);
  
    // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
    var day = toDoubleDigits(date1.getDate()); // 日
  
    return  year + "-" + month + "-" + day
}

function toDaystr() {
  var date1 = new Date();

  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日

  return  year + "-" + month + "-" + day
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

function addMonth(str) {
    var date1 = new Date(str);
 
     // Date型を（YYYY/MM/DD）形式へ成型して返却
    var year = date1.getFullYear(); // 年
    var month = toDoubleDigits(date1.getMonth() + 1); // 月
 
    return  year +  month;
}

function manualUppercase(s) {
    return s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);});
};

function isNumber(val){
  var regex = new RegExp(/^[-+]?[0-9]+(\.[0-9]+)?$/);
  return regex.test(val);
}

function kanji_comp(target) {

  //var target = zenkaku2Hankaku(keyword)

  // キーワードを文字コードの数値の配列に変換
  const unicodeArray = [];

  for (let i = 0; i < target.length; i++) {
    unicodeArray.push(target.charCodeAt(i));
  }
  const sjisArray = encoding.convert(unicodeArray, {
    to: 'SJIS',
    from: 'UNICODE',
  });

  var str = ""
  for (let i = 0; i < sjisArray.length; i++) {
     var hex = sjisArray[i].toString(16);
    //  var ret = ( '0000' + hex ).slice( -4 );
    //  console.log(ret)
     str += manualUppercase(hex);
  }  
   
  console.log(str)
  return str

}

function addDayTimestr(day) {
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

function addSaveDay(s) {
  var date1 = new Date();
  // パラメータで取得した日数を加算
  date1.setHours(date1.getHours() + s);
  return  date1 
}

function  gettoday() {
  var date1 = new Date();

  // Date型を（YYYY/MM/DD）形式へ成型して返却
//  date1.setHours(date1.getHours());
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  
  var dd = year + "-" + month + "-" + day;

  //console.log("gettoday " + dd)
  
  return  new Date(dd); 
}

function  getshortday(day) {
  var date1 = new Date(day);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
//  date1.setHours(date1.getHours());
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  return month + "-" + day + " " + hour + ":" + min;
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

function  getStartDay(str, i) {
  var date = new Date(str);
  date.setDate(date.getDate() + i);  
  var year = date.getFullYear(); // 年
  var month = toDoubleDigits(date.getMonth() + 1); // 月
  var dd = year + "-" + month + "-01";

  return dd 
}

function getInventDay() {
  let date = new Date();
  date.setDate(date.getDate() - 15);
  date.setMonth(date.getMonth()+1, 0);
  var year = date.getFullYear(); // 年
  var month = toDoubleDigits(date.getMonth() + 1); // 月
  var day = toDoubleDigits(date.getDate()); // 日
  var dd = year + "-" + month + "-" + day;

  return dd; 
}

function setReadTime(data,i) {
  var date1 = new Date(data); 
  date1.setDate(date1.getDate() + i);  
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日 
  return  year + "-" + month + "-" + day; 
}

function weekNo(day) {
  var sday = new Date(day);
  var wDay = sday.getDay();
  return wDay
}

function weekName(day) {
  var WeekChars = [ "日", "月", "火", "水", "木", "金", "土" ];  
  var sday = new Date(day);
  var wDay = sday.getDay();
  return WeekChars[wDay];
}

  module.exports = {
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
    getInventDay,
    setReadTime,
    weekNo,
    weekName,
    getshortday
  }
  
  
  