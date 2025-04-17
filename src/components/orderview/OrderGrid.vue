<template>
  <div ref="gridWrapper" class="grid-wrapper" style='width: 100%; height: 110vh; border: solid 1px #000; margin: 0px'></div>
</template>
<script>

import { cheetahGrid } from 'vue-cheetah-grid';

export default {
   name: 'service',
   props: ["items","daylist"],
   components: {
       cheetahGrid,
   },
   watch: {
     items: function(val){
        this.records = val;
        this.grid.invalidate();
     },
     filterstr: function(val){
      
     },
     daylist: function(val){
     }
   },  
   computed: {
     processlist() { return this.$store.getters.processlist2 }, 
   },
   created() {
      this.onTheme();
     // this.onExpArray();
      this.records = this.items;
    //  this.records = dummy_list(this.daylist[0]);
   },
   mounted() {
   //  if (this.records.length > 0) {
      this.onExpArray();
      this.grid = this.createGrid(this.records);     
   //  }
   },
   data() {
       return {
           records: [],//dummy_list(this.daylist[0]),
           grid: null,
           dayOfWeekStr: [ "日", "月", "火", "水", "木", "金", "土" ],
           bgheader: {'bgColor': '#2196F3','color': '#ffffff', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif", "textAlign": "left" }, 
           bgcheck: {'bgColor': '#2196F3','color': '#ffffff', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/]}, 
           bgbutton: {'bgColor': 'white','color': '#ffffff', 'padding': [3 /*top*/, 3 /*right*/, 3 /*bottom*/, 3 /*left*/], 'font': "12px sans-serif"}, 
           bgstyle: {'bgColor': null, 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "12px sans-serif", "textAlign": "left" },
           bgstyle2: {'bgColor': null, 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "13px sans-serif", "font-weight": "bold", "textAlign": "left" },
           bgcolumn: {'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif", "textAlign": "right" },  
           headerRowHeight: 20,
           defaultwidth: 50,
           frozenColCount: 3,
           exparray: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
           exparray2: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],          
           stockarray: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
           userTheme: null,
       };
   },
   methods: {
     onTheme() {
       var ret = {
         font: "normal normal normal 16px/1 FontAwesome",
        /* borderColor: "#35495e",*/
         checkbox: {
           checkBgColor: "#35495e",
           borderColor: "#35495e",
         },  
         color: "#000",
         frozenRowsColor: "gray",
         frozenRowsBorderColor: "white",
         frozenRowsBgColor: "silver",
         button: {
           color: "#FDD",
           bgColor: "#20c997",
           fontSize: "9px"
         },
         borderColor({ col, row, grid }) {
           if (row < 3) {
               return [null /*top*/, "white" /*right and left*/, null /*bottom*/];
           } else {
             if( row % 3 === 2) {
               return [null /*top*/, "#616161" /*right and left*/,"#616161" /*bottom*/];
             } else {
               return [null /*top*/, "#616161" /*right and left*/, null /*bottom*/];
             }
           }
         },
       }
       this.userTheme = ret;
     } , 
     getcolor: function(id) {  
          var ret = "silver";
          for (var i in this.processlist) {
             if (this.processlist[i].value==id) {
                ret = this.processlist[i].color;
             }
          }
          return ret;
      },
     onFilter(filterstr) {
       const filterDataSource = new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(this.records));
       this.grid.dataSource = filterDataSource;
       filterDataSource.filter = filterstr ? (record) => {
          for (const k in record) {

              if ((`${record[k]}`).indexOf(filterstr) >= 0) {
                  return true;
              }
          }
          return false;
       } : null;
       this.grid.invalidate();
     },
     onArryFilter(filterarr) {
       const filterDataSource = new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(this.records));
       this.grid.dataSource = filterDataSource;
       filterDataSource.filter = filterarr ? (record) => {
   
           //    for (const k in record) {

                   var newLine = filterarr.filter(function(item, index){
                     if (item == record.partname) return true;
                   });

                   if ( newLine.length > 0 ) {
                      return true;
                   }
            //   }
               return false;
           } : null;
             this.grid.invalidate();
             if (filterDataSource._filterData != null){
                this.$emit("count", filterDataSource._filterData._filteredList.length);
             }

     },
     onkillFilter() {
       this.grid.records = this.records;
       this.onArryFilter(null);
       this.grid.invalidate();
       this.$emit("count", this.records.length);
     },
     createGrid(records) {
       var vm = this;
       var option = {
         parentElement: this.$refs.gridWrapper,
         layout: {
           header: [],
           body: [],
         },
         frozenColCount: this.frozenColCount,
         headerRowHeight: this.headerRowHeight,
         defaultRowHeight: this.headerRowHeight,
         theme: this.userTheme,
         headerRowHeight: 14,
       }

       var hrow1 = [{ field: "flg", caption: "", width: 35, action: "check", headerAction: "check", headerType: "check", headerStyle: this.bgcheck, style: this.bgcolumn, rowSpan: 3},
                    { caption: "部品名", width: 170, headerStyle: this.bgheader, style: this.bgcolumn, rowSpan: 3, headerType: "sort",headerAction: "sort"},
                    { caption: "ｱﾗｰﾑ", width: 40, headerStyle: this.bgheader, style: this.bgcolumn, headerType: "sort",headerAction: "sort", style: { font: "normal normal normal 11px/1 FontAwesome" }}                 
                    ];
       var hrow2 = [{ caption: "無し", width: 40, headerStyle: this.bgheader, style: this.bgcolumn, headerType: "sort",headerAction: "sort", style: { font: "normal normal normal 11px/1 FontAwesome" }}];
       var hrow3 = [{ caption: "日", width: 45, headerStyle: this.bgheader, style: this.bgcolumn, headerType: "sort",headerAction: "sort", style: { font: "normal normal normal 10px/1 FontAwesome" }}];    
       var crow1 = [{ width: 35, 
                      rowSpan: 3,
                      style: vm.bgbutton,
                      columnType: new cheetahGrid.columns.type.ButtonColumn({
                        caption: "選択",
                      }),
                      action: new cheetahGrid.columns.action.ButtonAction({
                        action(rec) {
                          // alert(JSON.stringify(rec, null, "  "));
                          //rec.flg = !rec.flg;
                          vm.$emit("dblclick", [rec]);
                        },
                      })
                    },
                    { field: (record) => { return record.modelname },
                      width: 170, 
                      style(rec) {
                      //  vm.bgstyle.bgColor = vm.getcolor(rec.process);
                        return vm.bgstyle2
                      },
                    },    
                    ];
       var crow2 = [{ field: (record) => { return "ロット:" + record.lot },
                      width: 170, 
                      style(rec) {
                      //  vm.bgstyle.bgColor = vm.getcolor(rec.process);
                        return vm.bgstyle
                      },
                    }];
       var crow3 = [{ field: (record) => { return "ID:" + record.qty },
                      width: 170, 
                      style(rec) {
                      //  vm.bgstyle.bgColor = vm.getcolor(rec.process);
                        return vm.bgstyle
                      },
                    }];           
       crow1.push({ width: 40, 
                    field: (record) => "受入",
                    style: { font: "normal normal normal 11px/1 FontAwesome" }
                  });
       crow2.push({ width: 40,
                    field: (record) => "出戻",
                    style: { font: "normal normal normal 11px/1 FontAwesome" }
                  });
       crow3.push({ width: 40,
                    field: (record) => "在庫",
                    style: { font: "normal normal normal 11px/1 FontAwesome" }
                  });
     //  if (this.daylist.length > 0){
/*
          for (let i = 0; i < this.daylist.length; i++)   {;
              hrow1.push({ caption: (record) => vm.stockarray[i],  
                          width: this.defaultwidth, 
                          style: this.bgcolumn,
                          headerStyle(rec) {
                            return {
                              bgColor: vm.stockarray[i] > 0 ? "yellow" : '#2196F3',
                              color: vm.stockarray[i] > 0 ? "black" : "#2196F3",
                              padding: [0 , 0 , 0 , 0], 
                              font: "11px sans-serif", 
                              textAlign: "center" 
                            };
                          },
              });
              hrow2.push({ caption: (record) => vm.exparray[i], 
                          width: 50, 
                          headerStyle(rec) {
                              return {
                              bgColor: vm.exparray[i] > 0 ? "red" : '#2196F3',
                              color: vm.exparray[i] > 0 ? "white" : "#2196F3",
                              padding: [0 , 0 , 0 , 0], 
                              font: "11px sans-serif", 
                              textAlign: "center" 
                          };
                          },
                      });                        
              hrow3.push({ caption: (record) => { if (vm.daylist[i].flg==1) { return "棚卸" } else { return getday2(this.daylist[i].daystr) + this.dayOfWeekStr[new Date(this.daylist[i].daystr).getDay()] }}, 
                          width: this.defaultwidth, 
                          headerStyle(rec) {
                              var cl = "#2196F3";
                              var co = "white";
                              var flg = vm.daylist[i].flg;
                              var di = new Date(vm.daylist[i].daystr).getDay();
                              if (di==0) { cl = "gray" }
                              if (formatDay(new Date())==vm.daylist[i].daystr) { 
                                  cl = "#F4FF81"
                                  co = "black";
                              }
                              if (flg==1) {
                                cl = "green";
                              }
                              return {
                                  bgColor: cl,
                                  color: co,
                                  padding: [0 , 0 , 0 , 0], 
                                  font: "11px sans-serif", 
                                  textAlign: "center" 
                             };
                          },
                          });
              crow1.push({field:  (record) => record.daylist[i].inout,
                          width: this.defaultwidth, 
                          style(rec) {
                              var cl = "";
                              var di  = new Date(vm.daylist[i].daystr).getDay();
                              if (rec.daylist[i].total<=0) { cl = "silver" }
                              if (di==0) { cl = "gray" }
                              if (rec.daylist[i].inout > 0) { cl = "lightgreen" }
                              if (rec.daylist[i].inout < 0) { cl = "lightgreen" }
                              if (rec.daylist[i].flg == 1) { cl = "aquamarine" }
                              return {
                                  bgColor: cl,
                                  padding: [0 , 0 , 0 , 0],  
                                  font: "12px sans-serif", 
                                  textAlign: "right" 
                             };
                          },
                          columnType: "number" 
                          });
              crow2.push({ field:(record) => record.daylist[i].use,
                          width: 50, 
                          style(rec) {
                              var cl = "";
                              var di  = new Date(vm.daylist[i].daystr).getDay();
                              if (rec.daylist[i].total<=0) { cl = "silver" }
                              if (di==0) { cl = "gray" }
                              if (rec.daylist[i].use > 0) { cl = "pink" }
                              if (rec.daylist[i].use < 0) { cl = "pink" }
                              if (rec.daylist[i].flg == 1) { cl = "aquamarine" }
                              return {
                                  bgColor: cl,
                                  padding: [0 , 0 , 0 , 0], 
                                  font: "12px sans-serif", 
                                  textAlign: "right" 
                              };
                          },
                          columnType: "number"
                          });
              crow3.push({ field: (record) => record.daylist[i].total,
                          width: this.defaultwidth, 
                          style(rec) {
                              var cl = "";
                              var di  = new Date(vm.daylist[i].daystr).getDay();
                              if (rec.daylist[i].total<=0) { cl = "silver" }
                              if (di==0) { cl = "gray" }
                              if (rec.daylist[i].flg == 1) { cl = "aquamarine" }
                              return {
                                  bgColor: rec.daylist[i].total < 0 ? "red" : cl,
                                  color: rec.daylist[i].total < 0 ? "white" : "black",
                                  padding: [0 , 0 , 0 , 0], 
                                  font: "12px sans-serif", 
                                  textAlign: "right" 
                              };
                          },
                          columnType: "number" 
                          });   
         //     if (i == 30) { break }
        //  } 
       }    */

       option.layout.header.push(hrow1);
       option.layout.header.push(hrow2);
       option.layout.header.push(hrow3);
     //  option.layout.header.push(hrow4);  
       option.layout.body.push(crow1);
       option.layout.body.push(crow2);
       option.layout.body.push(crow3);

       const grid = (this.grid = new cheetahGrid.ListGrid(option));
       const { CHANGED_HEADER_VALUE, CHANGED_VALUE } = cheetahGrid.ListGrid.EVENT_TYPE;

       grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.SELECTED_CELL, (args) => { this.onSelected(args) });
       grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.DBLCLICK_CELL, (args) => { this.onDbClick(args) });
       grid.listen(CHANGED_HEADER_VALUE, ({ value, field }) => {
          if (field !== "flg") {
              return;
          }
          // header check value on change

          for (const rec of grid.records) {
              rec[field] = value;
          }
          grid.invalidate();
          });
          grid.listen(CHANGED_VALUE, ({ value, field }) => {
          if (field !== "flg") {
              return;
          }
          // check value on change

          grid.headerValues.set(field, false);

          grid.invalidate();
       });
          
       grid.records = records
       return grid;
     }, 
     onSelected(e) {
        var offset = this.frozenColCount - 0;
        if (e.col >= offset) {
           if (e.row === 0 ) {
             var col = e.col - offset;
             var parts = [];
       //   this.$emit("select", array);
             for (var i in this.records) {
               if (this.records[i].daylist[col].stock <= this.records[i].minpice && this.records[i].minpice > 0) {parts.push(this.records[i].partname) };
             }
             this.onArryFilter(parts);
           }
           if (e.row === 1) {
             var col = e.col - offset;
             var parts = [];
       //   this.$emit("select", array);
             for (var i in this.records) {
               if (this.records[i].daylist[col].total <= 0) {parts.push(this.records[i].partname) };
             }
             this.onArryFilter(parts);
           } 
        } 
     },
     onDbClick(e) {
      // if (this.stockarray[e.col - this.frozenColCount ]>0) {
       //   var col = e.col - (this.frozenColCount - 1);
          this.$emit("dblclick", this.records[e.row]);
     //  }   
     },
     onUpDate(data) {
     //  self.exparray = data.exparray;
        this.records = data.retdata;
        this.grid = this.createGrid(this.records);
     },
     onUpDate2() {
     //  self.exparray = data.exparray;
     /*  for (var i in data.retdata) { 
         this.records.find(row => {
           if ( row._id ==  data.retdata[i]._id){
             row.daylist = data.retdata[i].daylist;
           };
         });
       }*/
      // this.grid.records = this.records;
        this.onExpArray();
      // console.log(this.exparray)
        this.grid.invalidate();
       // self.grid.invalidate();
     },
     ontest(data) {
        this.grid.invalidate();
       // self.grid.invalidate();
     },
     onExparray(val) {
        this.exparray = val;
        this.grid.invalidate();
     },   
     onExpArray() {
        this.stockarray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.exparray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.exparray2 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        if (this.records.length > 0){        
          for (var i in this.records) {
            for (var c in this.records[i].daylist) {
              if (this.records[i].daylist[c].total <= 0 ) {this.exparray[c] += 1 };
              if (this.records[i].daylist[c].total <= this.records[i].minpice && 0 < this.records[i].minpice) {this.stockarray[c] += 1 };               
            }
        //  if (this.records[i].process== 1) {
          } 
        }   
     },
   },
};

function dummy_list(data) {
  var list = [];
 // var month = formatDay(new Date)
  var start = data.daystr;
  var last = month_lastday(data.daystr);
  var dat = {
      customerid: 0,
      month: make_month(data.daystr),
      partname:"---",
      process: 0,
      daylist: make_daylist(start, last)
      }
  list.push(dat);    
  return list
}

function formatDay(date) {
  var date1 = new Date(date);
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  return  year + "-" + month + "-" + day;
}    

function make_daylist(startday,lastday){
  var list = [];
  var sday = new Date(startday)
//  var plist = JSON.parse(JSON.stringify(processlist))
  sday.setDate(sday.getDate() + 0); 
  list.push({_id:"", daystr: formatDay(sday), invent: 0, loss :0, partname:"",stock: 0,stock2: 0,total: 0,use: 0,use2: 0});
  for (let i = 0; i < 32; i++) {
    sday.setDate(sday.getDate() + 1);
    list.push({_id:"", daystr: formatDay(sday), invent: 0, loss :0, partname:"",stock: 0,stock2: 0,total: 0,use: 0,use2: 0});
   /* if (formatDay(sday)==lastday) {
      break
    }*/
  }
  return list
} 

function make_month(str) {
 var date1 = new Date(str);
  // パラメータで取得した日数を加算
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  return  year + month; 
}

function month_startday(str) {
 var date1 = new Date(str);
  // パラメータで取得した日数を加算
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  return  year + "-" + month + "-01"; 
}

function month_lastday(str) {
 let date = new Date(str);
 date.setMonth(date.getMonth()+1, 0);　// 手順2と3を同時におこなっていま
return formatDay(date)
}

var toDoubleDigits = function(num) {
 num += "";
 if (num.length === 1) {
   num = "0" + num;
 }
return num;     
};

function getday(str) {
 var ret = "";
 if (str != undefined) {
   ret = str.split("-")[2];
 }  
 return  ret; 
}

function getday2(str) {
 var date1 = new Date(str);
  // パラメータで取得した日数を加算
  var day = toDoubleDigits(date1.getDate()); // 日
  return  day; 
}


/*
function dammy_list() {

 var ret = [{"_id":"24-F1J1E1040024-2022-01",
            "carryover":0,
            "customerid":24,
            "month":"2022-01",
            "partname":"---",
            "process":"0",
            "daylist":[
              {"_id":"24-F1J1E1040024-2022-01-01","__v":0,"daystr":"2022-01-01","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-02","__v":0,"daystr":"2022-01-02","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-03","__v":0,"daystr":"2022-01-03","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-04","__v":0,"daystr":"2022-01-04","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-05","__v":0,"daystr":"2022-01-05","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-06","__v":0,"daystr":"2022-01-06","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-07","__v":0,"daystr":"2022-01-07","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-08","__v":0,"daystr":"2022-01-08","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-09","__v":0,"daystr":"2022-01-09","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-10","__v":0,"daystr":"2022-01-10","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-11","__v":0,"daystr":"2022-01-11","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-12","__v":0,"daystr":"2022-01-12","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-13","__v":0,"daystr":"2022-01-13","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-14","__v":0,"daystr":"2022-01-14","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-15","__v":0,"daystr":"2022-01-15","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-16","__v":0,"daystr":"2022-01-16","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-17","__v":0,"daystr":"2022-01-17","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-18","__v":0,"daystr":"2022-01-18","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-19","__v":0,"daystr":"2022-01-19","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-20","__v":0,"daystr":"2022-01-20","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-21","__v":0,"daystr":"2022-01-21","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-22","__v":0,"daystr":"2022-01-22","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-23","__v":0,"daystr":"2022-01-23","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-24","__v":0,"daystr":"2022-01-24","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-25","__v":0,"daystr":"2022-01-25","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-26","__v":0,"daystr":"2022-01-26","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-27","__v":0,"daystr":"2022-01-27","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-28","__v":0,"daystr":"2022-01-28","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-29","__v":0,"daystr":"2022-01-29","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-30","__v":0,"daystr":"2022-01-30","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-01-31","__v":0,"daystr":"2022-01-31","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0},
              {"_id":"24-F1J1E1040024-2022-02-01","__v":0,"daystr":"2022-02-01","invent":0,"loss":0,"month":"2022-01","ornerid":"24-F1J1E1040024-2022-01","partname":"F1J1E1040024","stock":0,"stock2":0,"total":0,"use":0,"use2":0}]}]
         return ret;
      }
*/
</script>

<style scoped>
h3 {
 margin: 40px 0 0;
}
ul {
 list-style-type: none;
 padding: 0;
}
li {
 display: inline-block;
 margin: 0 10px;
}
a {
 color: #42b983;
}
</style>

