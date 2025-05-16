<template>
  <div ref="gridWrapper" class="grid-wrapper" :class="GridStyle"></div> 
</template>
<script>

//共通関数//
import date_func from '../../api/date_func'
const { 
  toDoubleDigits,
  onCurrentMonth,
  formatDay,
  getMonth_Day,
  weekno
} = date_func();

import axios from 'axios'
import { mapState } from 'vuex'
import { cheetahGrid } from 'vue-cheetah-grid';

export default {
   name: 'service',
   props: ["planlist", "daylist", "param"],
   components: {
        cheetahGrid,
   },
   watch: {
      daylist: function(val){
        this.grid.invalidate();  
      },
      planlist: function(val){
        this.onDayPlanCount(val);
      /*  this.grid.records = val; 
        this.grid.invalidate();*/
      },
      param: function(val){
        console.log("param:" + val);
      },
   },  
   computed: {
    ...mapState({
        orderserver: 'orderserver',
        mcplanserver: 'mcplanserver'
      }),
   },
   created() {
       this.onTheme();
      // this.records = this.planlist;
   },
   mounted() {
      // this.onExpArray();
       this.grid = this.createGrid([]); 
       this.onGetOrder();    
    //  }
   },
   data() {
      return {
        records: [],//dummy_list(this.daylist[0]),
        grid: null,
        //header_bgcolor: "#2196F3", /*ヘッダー基本色*/
        //header_color: "white", /*ヘッダー基本色*/             
        header_holiday_bgcolor: "gray", /*日付ヘッダー休み*/  
        header_today_bgcolor: "#F4FF81",  /*日付ヘッダー本日*/ 
        //header_holiday_color: "white", /*日付ヘッダー休み フォント色*/  
        header_today_color: "black",  /*日付ヘッダー本日 フォント色*/
        planend_color: "gainsboro", /*計画の完了色*/
        //part_color: "#6D4C41",                              
        header_style: { 'bgColor': '#40b883', 'color': 'white', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif"},  
        header_number_style: { 'bgColor': '#40b883', 'color': 'white', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif", "textAlign": "right"},  
        padding_zero: [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/],  /*日付ヘッダースタイル*/
        button_style: {'bgColor': 'white','color': '#ffffff', 'padding': [3 /*top*/, 3 /*right*/, 3 /*bottom*/, 3 /*left*/], 'font': "12px sans-serif"}, 
        //cell_holiday_color: "gainsboro",  
        cell_style: {'bgColor': 'white','color': 'black','padding': this.padding_zero, 'font': "11px sans-serif", "textAlign": "left", "textOverflow": "ellipsis" }, /* セル基本スタイル */
        cell_number_style: {'bgColor': 'white','color': 'black','padding': this.padding_zero, 'font': "11px sans-serif", "textAlign": "right" }, /* セル基本スタイル */
        dayOfWeekStr: [ "日", "月", "火", "水", "木", "金", "土" ],
        headerRowHeight: 20,
        defaultwidth: 38,
        frozenColCount: 6,
        plandaycol: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        productdaycol: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],          
        sabuncol: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        pricecol: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        allprice: 0,
        allplancol: 0,
        allproductcol: 0,
        userTheme: null,
        gridcolwidth: {
          col1: 40,
          col2: 200,
          col3: 100,
          col4: 45,
          col5: 75,
          col6: 70,  
          col7: 58,            
        },
        GridStyle: "defultGrid",
        selectrow: []
      };
   },
   methods: {
      onGetOrder: function() {
          if (this.param.mc != null && this.planlist.length > 0) {
              var self = this;
              self.$emit("progress", true); 
             // self.planlist = [];
              var senddata = {
                  modeltype: self.param.mc,
                  daylist: self.daylist,
                  startday: self.param.startday,
                  timelist: "",
                  ids: null,
                  planlist: self.planlist
              } 
              let promise = axios.post( self.mcplanserver + "/getmcplan2", senddata)  
              return promise.then((result) => {
                  this.grid.records = result.data.planlist; 
                  this.grid.invalidate();
                  self.$emit("progress", false);      
              }).catch(error => {
              console.log("error " + error) 
              })
          }   
      },
      onRefrashGrid: function() {
        this.onDayPlanCount(this.grid.records);
       // this.getPriceSum();
        this.grid.invalidate();
      },
      getHourSum: function() {
        var total = 0;
        if (this.daylist.length > 0){
          total = this.daylist.reduce(function(sum, element){
             return sum + element.worktime;
          }, 0);     
        }
        return total.toLocaleString()
      },
      onDayPlanCount(arr){
        var pricesum = 0;
        for (  var i = 0;  i < 32;  i++  ) {
          this.plandaycol[i] = 0;
          this.productdaycol[i] = 0;
          this.sabuncol[i] = 0;
          this.pricecol[i] = 0;
        }
        for (var i in arr) {
          for (var r in arr[i].column) {
            this.plandaycol[r] += arr[i].column[r].plan || 0;
            this.productdaycol[r] += arr[i].column[r].product || 0;
            this.sabuncol[r] = this.productdaycol[r] - this.plandaycol[r];
            this.pricecol[r] = arr[i].price * this.productdaycol[r];
            pricesum += this.pricecol[r];
          }
        }
        let total = this.pricecol.reduce(function(sum, element){
          return sum + element;
        }, 0);
        this.allprice = total;
        let total2 = this.plandaycol.reduce(function(sum, element){
          return sum + element;
        }, 0);
        this.allplancol = total2;
        let total3 = this.productdaycol.reduce(function(sum, element){
          return sum + element;
        }, 0);
        this.allproductcol = total3;
      },
      onCheckCount: function() {
        this.selectrow = [];
        this.selectrow = this.grid.records.filter((row) => {
           // if(row.check && row.product === 0) {
            if(row.check) {
              return true
            } else {
              return false         
            }
        })

        const sortone = this.selectrow.map((v) => v.sortno).sort((a, b) => {
          return a - b;
        });
        if (sortone.length > 0) {
          const row = this.selectrow.find((item) => {
            return item.sortno === sortone[0];
          });
        
        const column = row.column.filter((row) => {
          if( row.plan > 0) {
            return true
          } else {
            return false         
          }
        })
          this.$emit("select",{ list: this.selectrow, minno: sortone[0], minid: row._id, start: column[0].daystr } )
        } else {
          this.$emit("select",{ list: this.selectrow, minno: null, minid: null, start: null } )
        }

      },
      onSimpleStyleNum(defaultStyle, num){
        var style = JSON.parse(JSON.stringify(defaultStyle))
        if (num == 0 || num == NaN) {
          style.color = style.bgColor;
        } 
        style.textAlign = "right"; 
        return style
      },
      onRowStyle(rec, defaultStyle){
        var style = JSON.parse(JSON.stringify(defaultStyle))
        if (rec.qty <= rec.product) {
          style.bgColor = this.planend_color;
        }
        return style
      },
      onRowStyleCheckSum(rec, defaultStyle){
        var style = JSON.parse(JSON.stringify(defaultStyle))
        if (rec.qty <= rec.product) {
          style.bgColor = this.planend_color;
        }
        if (rec.qty != rec.checksum) {
          style.bgColor = "red";
          style.color = "white";
        }
        return style
      },
      onRowStyleNum(defaultStyle, col, num, rec){
        var style = JSON.parse(JSON.stringify(defaultStyle))
        if (rec.qty <= rec.product) {
          style.bgColor = this.planend_color;
        }
        if (formatDay(new Date())==col.daystr) { 
          style.bgColor = this.header_today_bgcolor
          style.color = this.header_today_color;
        }
        if (col.status==0) {
          style.bgColor = this.header_holiday_bgcolor;
          style.color = this.header_holiday_bgcolor;
          if (col.plan == 0 || col.plan == null) {
            style.color = "gray";
          }
        } else {
          if (num == 0 || num == null) {
            style.color = "white";
          } 
        }
        return style
      },
      onHeaderRowStyle(defaultStyle,status,daystr) {
        var style = JSON.parse(JSON.stringify(defaultStyle))
        if (status == 0) { 
          style.bgColor = this.header_holiday_bgcolor
         // style.color = this.header_holiday_bgcolor
        }       
        if (formatDay(new Date())==daystr) { 
          style.bgColor = this.header_today_bgcolor
          style.color = this.header_today_color;
        }
        style.textAlign = "center";      
        return style
      },
      onHeaderRowStyleNum(defaultStyle,status,daystr,num) {
        var style = JSON.parse(JSON.stringify(defaultStyle))
        if (status == 0) { 
          style.bgColor = this.header_holiday_bgcolor
          style.color = this.header_holiday_bgcolor
        }       
        if (formatDay(new Date())==daystr) { 
          style.bgColor = this.header_today_bgcolor
          style.color = this.header_today_color;
        }
        if (num==0){
          style.color = style.bgColor;     
        }
        style.textAlign = "center";      
        return style
      },
      onTheme() {
        var ret = {
          frozenRowsBgColor: "#40b883",
          frozenRowsColor: "white",
        //  frozenRowsBorderColor: "black",
          font: "normal normal normal 12px/1 FontAwesome",
          borderColor({ col, row, grid }) {
            if (row < 9) { // ヘッダー
                return [null /*top*/, "#616161" /*right and left*/, "#616161" /*bottom*/];
            } else {
              if( row % 2 === 1) { // セル　
                return [null /*top*/, "#616161" /*right and left*/,"silver" /*bottom*/];
              } else {
                return [null /*top*/, "#616161" /*right and left*/,"#616161"/*bottom*/];
              }
            }
          },
        }
        this.userTheme = ret;
      }, 
      createGrid(records) {
        var vm = this;
        var option = {
          parentElement: this.$refs.gridWrapper,
          layout: {
            header: [],
            body: [],
          },
          frozenColCount: this.frozenColCount,    /* 固定の列数 */
          headerRowHeight: this.headerRowHeight,  /* 標準ヘッダー行の高さ */
          defaultRowHeight: this.headerRowHeight, /* 標準データ行の高さ */
          theme: this.userTheme,                  /* テーマ */
          headerRowHeight: 20,                    /* ヘッダー高さ*/
        }

        /* 固定列　*/    
        var hrow1 = [
          { caption: "", 
            width: this.gridcolwidth.col1,  
            rowSpan: 8
          },
          { caption: "", 
            width: this.gridcolwidth.col2,  
            rowSpan: 8
          },
          { caption: "標準勤務時間", 
            width: this.gridcolwidth.col3, 
          },     
          { caption: this.param.basehour, 
            width: this.gridcolwidth.col4, 
          },
          { caption: "項目名", 
            width: this.gridcolwidth.col5, 
          },
          { caption: "合計", 
            width: this.gridcolwidth.col6,  
          }            
        ];
        var hrow2 = [
          { caption: "標準切替時間", 
            width: this.gridcolwidth.col3,  
          },
          { caption: this.param.settingtime, 
            width: this.gridcolwidth.col4,  
          },
          { caption: "曜日", 
            width: this.gridcolwidth.col5,  
          },
          { caption: "", 
            width: this.gridcolwidth.col6,  
          },
        ];
        var hrow3 = [
          { caption: "回転数", 
            width: this.gridcolwidth.col3,  
          },
          { caption: this.param.spm, 
            width: this.gridcolwidth.col4,  
          },
          { caption: "金額", 
            width: this.gridcolwidth.col5,  
          },
          { caption: (record) => vm.allprice.toLocaleString(), 
            width: this.gridcolwidth.col6, 
            headerStyle(rec) { return vm.onSimpleStyleNum(vm.header_number_style, vm.allprice ) },
          },
        ]; 
        var hrow4 = [
          { caption: "タイプ", 
            width: this.gridcolwidth.col3,  
          },
          { caption: this.param.type,  
            width: this.gridcolwidth.col4,  
          },
          { caption: "稼働H", 
            width: this.gridcolwidth.col5,  
          },
          { caption: (record) => vm.getHourSum(), 
            width: this.gridcolwidth.col6, 
            headerStyle(rec) { return vm.onSimpleStyleNum(vm.header_number_style, vm.getHourSum() ) },
          },
        ]; 
        var hrow5 = [
          { caption: "", 
            width: this.gridcolwidth.col3,  
          },
          { caption: "", 
            width: this.gridcolwidth.col4,  
          },
          { caption: "稼働率(%)", 
            width: this.gridcolwidth.col5,  
          },
          { caption: this.param.workrate, 
            width: this.gridcolwidth.col6,  
          },
        ]; 
        var hrow6 = [
          { caption: "", 
            width: this.gridcolwidth.col3,  
          },
          { caption: "", 
            width: this.gridcolwidth.col4,  
          },
          { caption: "予定生産数", 
            width: this.gridcolwidth.col5,  
          },
          { caption: (record) => vm.allplancol.toLocaleString(), 
            width: this.gridcolwidth.col6, 
            headerStyle(rec) { return vm.onSimpleStyleNum(vm.header_number_style, vm.allplancol ) },
          },
        ]; 
        var hrow7 = [
          { caption: "", 
            width: this.gridcolwidth.col3,  
          },
          { caption: "", 
            width: this.gridcolwidth.col4,  
          },
          { caption: "実日産数", 
            width: this.gridcolwidth.col5,  
          },
          { caption: (record) => vm.allproductcol.toLocaleString(), 
            width: this.gridcolwidth.col6, 
            headerStyle(rec) { return vm.onSimpleStyleNum(vm.header_number_style, vm.allproductcol ) },
          },
        ]; 
        var hrow8 = [
          { caption: "", 
            width: this.gridcolwidth.col3,  
          },
          { caption: "", 
            width: this.gridcolwidth.col4,  
          },
          { caption: "差", 
            width: this.gridcolwidth.col5,  
          },
          { caption: (record) => (vm.allproductcol-vm.allplancol).toLocaleString(), 
            width: this.gridcolwidth.col6,  
            headerStyle(rec) { return vm.onSimpleStyleNum(vm.header_number_style, (vm.allproductcol-vm.allplancol) ) },
          },
        ]; 
        var hrow9 = [
          {
            field: "check",
            width: this.gridcolwidth.col1,  
            columnType: "check",
            action: "check",
            headerType: "check",
            headerAction: "check",
          },
          { caption: "機種名/元納期(生産No)", 
            width: this.gridcolwidth.col2,  
           /* headerType: "sort",
            headerAction: "sort",*/
          },
          { caption: "コメント/金額", 
            width: this.gridcolwidth.col3,  
           /* headerType: "sort",
            headerAction: "sort",*/
          },
          { caption: "取数", 
            width: this.gridcolwidth.col4,  
           /* headerType: "sort",
            headerAction: "sort",*/
          },
          { caption: "日産/切替", 
            width: this.gridcolwidth.col5,  
          /*  headerType: "sort",
            headerAction: "sort",*/
          },
          { caption: "生産数", 
            width: this.gridcolwidth.col6,  
           /* headerType: "sort",
            headerAction: "sort",*/
          },
        ]; 
        var crow1 = [
          {
            field: "check",
            width: vm.gridcolwidth.col1, 
            columnType: "check",
            action: "check",
            rowSpan: 2,
            style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
          },
          { field: (record) => { return record.modelname },
            width:this.gridcolwidth.col2, 
            style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
          },  
          { field:{
                get: (rec) => rec.comment,
                set: (rec, newValue) => {
                  var param = {          
                              _id: rec._id,
                              updatestr: { comment: newValue },
                              retrecord: null
                            };
                            rec.comment = newValue;
                  axios.post(vm.mcplanserver + "/setplandata",param)
                      .then((ret) => { 
                        if (newValue != ret.data.retrecord.comment) {
                          alert("更新に失敗しました");
                        }
                        rec.comment = ret.data.retrecord.comment;
                      }).catch((ret) => { alert("エラー！") });
                  }
              },
              action: new cheetahGrid.columns.action.SmallDialogInputEditor({
                type: "text",
                classList: ["al-right"],
              }),
              style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
          },
          { field: (record) => { return record.pice },
            width:this.gridcolwidth.col4, 
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
            rowSpan: 2
          }, 
          { field: (record) => { return (( record.pice * vm.param.spm * ((vm.param.basehour * vm.param.workrate) * 60) / 100 ) * 100 ) },
            width:this.gridcolwidth.col5, 
            columnType: "number",
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
          }, 
        /*  { field: (record) => { return record.qty },
            width:this.gridcolwidth.col6, 
            columnType: "number",
            style: (record) => { return vm.onRowStyleCheckSum(record, vm.cell_number_style ) },
          },*/
          { field:{
            get: (rec) => rec.qty,
            set: (rec, newValue) => {
              var param = {          
                  _id: rec._id,
                  update: { qty: parseInt(newValue) },
                  record: rec
                };
                if (newValue != "") {
                  rec.qty = newValue;
                  vm.$emit("setdata", param);
                }
              }, 
            },
            action: new cheetahGrid.columns.action.SmallDialogInputEditor({
              type: "number",
              classList: ["al-right"],
            }),
            columnType: "number",  
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },      
          }       
        ];  
         
        var crow2 = [ 
          { field: (record) => { return record.shipment + "(" +record.csvdataid + ")" },
            width:this.gridcolwidth.col2, 
          //  columnType: "number",
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
          },  
          { field: (record) => { return record.price * record.qty },
            width:this.gridcolwidth.col3, 
            columnType: "number",
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
          }, 
          { field: (record) => { return record.settingtime },
            width:this.gridcolwidth.col5, 
            columnType: "number",
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
          },
          { field: (record) => { return record.product },
            width:this.gridcolwidth.col6, 
            columnType: "number",
            style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
          }         
        ];

        if (this.daylist != null) {         
          for (let i = 0; i < this.daylist.length; i++)   {
            /* 日付列　ヘッダー　1行目 ***********************/ 
            hrow1.push({ caption: (record) => getMonth_Day(this.daylist[i].daystr),  
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyle(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr)},
            });
            /* 日付列　ヘッダー　2行目 ***********************/ 
            hrow2.push({ caption: (record) => { return this.dayOfWeekStr[new Date(this.daylist[i].daystr).getDay()] },  
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyle(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr)},
            });
            /* 日付列　ヘッダー　3行目 ***********************/ 
            hrow3.push({ caption: (record) => { return parseInt(vm.pricecol[i]).toLocaleString(); }, 
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyleNum(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr,vm.pricecol[i])},
            });
            /* 日付列　ヘッダー　4行目 ***********************/ 
            hrow4.push({ caption: (record) => { return vm.daylist[i].worktime.toFixed(1)}, 
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyleNum(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr,vm.daylist[i].worktime)},
            });
            /* 日付列　ヘッダー　5行目 ***********************/ 
            hrow5.push({ caption: (record) => { return vm.daylist[i].workrate}, 
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyleNum(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr)},
            });
            /* 日付列　ヘッダー　6行目 ***********************/ 
            hrow6.push({ caption: (record) => { return vm.plandaycol[i].toLocaleString()}, 
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyleNum(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr,vm.plandaycol[i])},
            });
            /* 日付列　ヘッダー　7行目 ***********************/ 
            hrow7.push({ caption: (record) => { return vm.productdaycol[i].toLocaleString()},  
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyleNum(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr,vm.productdaycol[i])},
            });
            /* 日付列　ヘッダー　8行目 ***********************/ 
            hrow8.push({ caption: (record) => { return vm.sabuncol[i].toLocaleString()}, 
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyleNum(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr,vm.sabuncol[i])},
            });
            /* 日付列　ヘッダー　9行目 ***********************/ 
            hrow9.push({ caption: (record) => { return ""}, 
              width: this.gridcolwidth.col7, 
              headerStyle(rec) { return vm.onHeaderRowStyle(vm.header_style,vm.daylist[i].status,vm.daylist[i].daystr)},
            });
            /* 日付列　1行目 ***********************/
            crow1.push({ field: {
                get: (rec) => rec.column[i].plan,
                set: (rec, newValue) => {
                  var param = {          
                              _id: rec.column[i]._id,
                              modeltype: rec.modeltype,
                              ornerid: rec._id,
                              comment: null,
                              workday: rec.column[i].daystr, 
                              plan: parseInt(newValue), 
                              product: rec.column[i].product,
                              worktime: 0,
                              retvalue: null
                            };

                              rec.column[i].plan = newValue;
                  axios.post(vm.mcplanserver + "/setplan",param)
                      .then((ret) => { 
                        if (ret.data.retvalue != ret.data.plan) {
                          alert("更新に失敗しました");
                        }
                        rec.column[i].plan = ret.data.retvalue;
                      }).catch((ret) => { alert("エラー！") });
                  }
              },
              action: new cheetahGrid.columns.action.SmallDialogInputEditor({
                type: "number",
                classList: ["al-right"],
              }),
              columnType: "number",
              width: this.gridcolwidth.col2, 
              style(rec) { return vm.onRowStyleNum(vm.cell_number_style, rec.column[i], rec.column[i].plan, rec) },
            });
            crow2.push({ field: {
                get: (rec) => rec.column[i].product,
                set: (rec, newValue) => {
                  var param = {          
                      _id: rec.column[i]._id,
                      startday: rec.column[i].daystr, 
                      plan: rec.column[i].plan, 
                      product: parseInt(newValue),
                      retvalue: null,
                      orner:  rec, 
                    };
                    if (newValue != "") {
                      rec.column[i].product = newValue;
                      vm.$emit("product", param);
                    }
                  }       
              },
            /*  action: new cheetahGrid.columns.action.SmallDialogInputEditor({
                type: "number",
                classList: ["al-right"],
              }),*/
              columnType: "number",
              width: this.gridcolwidth.col2, 
              style(rec) { return vm.onRowStyleNum(vm.cell_number_style, rec.column[i], rec.column[i].product, rec ) },
            },);
          }
        }   

        option.layout.header.push(hrow1);
        option.layout.header.push(hrow2);
        option.layout.header.push(hrow3);
        option.layout.header.push(hrow4);
        option.layout.header.push(hrow5);
        option.layout.header.push(hrow6);
        option.layout.header.push(hrow7);
        option.layout.header.push(hrow8);
        option.layout.header.push(hrow9);
        option.layout.body.push(crow1);
        option.layout.body.push(crow2);
      //  option.layout.body.push(crow3);
      //  option.layout.body.push(crow4);

        const grid = (this.grid = new cheetahGrid.ListGrid(option));

        /* イベント一覧 */
        const {
         CLICK_CELL,
         DBLCLICK_CELL,
         DBLTAP_CELL,
         MOUSEDOWN_CELL,
         MOUSEUP_CELL,
         SELECTED_CELL,
         KEYDOWN,
         MOUSEMOVE_CELL,
         MOUSEENTER_CELL,
         MOUSELEAVE_CELL,
         MOUSEOVER_CELL,
         MOUSEOUT_CELL,
         INPUT_CELL,
         PASTE_CELL,
         RESIZE_COLUMN,
         SCROLL,
         CHANGED_VALUE,
         CHANGED_HEADER_VALUE
        } = cheetahGrid.ListGrid.EVENT_TYPE;

       // grid.listen(DBLCLICK_CELL, (...args) => console.log(DBLCLICK_CELL, args));

       // grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.SELECTED_CELL, (args) => { this.onSelected(args) });
       // grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.DBLCLICK_CELL, (args) => { this.onDbClick(args) });
    /*   grid.listen(CLICK_CELL, (...args) => console.log(CLICK_CELL, args));
       grid.listen(DBLCLICK_CELL, (...args) => console.log(DBLCLICK_CELL, args));
       grid.listen(DBLTAP_CELL, (...args) => console.log(DBLTAP_CELL, args));
       grid.listen(MOUSEDOWN_CELL, (...args) => console.log(MOUSEDOWN_CELL, args));
       grid.listen(MOUSEUP_CELL, (...args) => console.log(MOUSEUP_CELL, args));
       grid.listen(SELECTED_CELL, (...args) => console.log(SELECTED_CELL, args));
       grid.listen(KEYDOWN, (...args) => console.log(KEYDOWN, args));
       grid.listen(INPUT_CELL, (...args) => this.test(INPUT_CELL, args));
       grid.listen(PASTE_CELL, (...args) => console.log(PASTE_CELL, args));
       grid.listen(RESIZE_COLUMN, (...args) => console.log(RESIZE_COLUMN, args));
       grid.listen(SCROLL, (...args) => console.log(SCROLL, args));*/
      // grid.listen(CHANGED_VALUE, (...args) => log(CHANGED_VALUE, args));
      // grid.listen(CHANGED_VALUE, (...args) => this.test(CHANGED_VALUE, args));
/*
       grid.listen(MOUSEMOVE_CELL, (...args) => {
         if (!document.querySelector(".include-mouse").checked) {
           return;
         }
         console.log(MOUSEMOVE_CELL, args);
       });
       grid.listen(MOUSEENTER_CELL, (...args) => {
         if (!document.querySelector(".include-mouse").checked) {
           return;
         }
         console.log(MOUSEENTER_CELL, args);
       });
       grid.listen(MOUSELEAVE_CELL, (...args) => {
         if (!document.querySelector(".include-mouse").checked) {
           return;
         }
         console.log(MOUSELEAVE_CELL, args);
       })*/
        grid.listen(SELECTED_CELL, (args) => { this.onSelected(args) });
        grid.listen(CHANGED_HEADER_VALUE, ({ value, field }) => {
          if (field !== "check") {
            return;
          }
          // header check value on change
          for (const rec of grid.records) {
            rec[field] = value;
          }
          grid.invalidate();
          vm.onCheckCount();
        });
        grid.listen(CHANGED_VALUE, ({ value, field }) => {
          if (field !== "check") {
            return;
          }
          // check value on change

          grid.headerValues.set(field, false);
         // vm.onRefrashGrid();
          grid.invalidate();
          vm.onCheckCount();
        });
       
        grid.records = records
        return grid;
      }, 
      onSelected(e) {
         var offset = this.frozenColCount - 0;
         var daylength = this.daylist.length-1;
         if (e.col >= offset) {
          // console.log(this.daylist[e.col-offset].daystr)
          // this.$emit("dayselect",this.daylist[e.col-offset].daystr );
         } 
      },
      test(e) {
        console.log(e);
      },
      onDbClick(e) {
       // if (this.stockarray[e.col - this.frozenColCount ]>0) {
        //   var col = e.col - (this.frozenColCount - 1);
           this.$emit("dblclick", this.records[e.row]);
      //  }   
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
                      if (item == record._id) return true;
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
      onGridHight(cl){
        this.GridStyle = cl;
      },
   },
};

</script>

<style scoped>

  .defultGrid {
    width: 100%;
    height: 87vh;
    border: solid 1px #000;
    margin: 0px
  }

  .shortGrid {
    width: 100%;
    height: 47vh;
    border: solid 1px #000;
    margin: 0px
  }

</style>