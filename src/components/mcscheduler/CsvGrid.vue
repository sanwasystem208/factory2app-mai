<template>
    <div ref="gridWrapper" class="grid-wrapper" style='width: 100%; height: 40vh; border: solid 1px #000; margin: 0px'></div> 
  </template>
  <script>
  
  //共通関数//
  import date_func from '../../api/date_func'
  const { 
    toDoubleDigits,
    onCurrentMonth,
    formatDay,
    getMonth_Day
   } = date_func();
  
  import axios from 'axios'
  import { cheetahGrid } from 'vue-cheetah-grid';
  import { mapState } from 'vuex'

  export default {
     name: 'service',
     props: ["filter"],
     components: {
          cheetahGrid,
     },
     watch: {
        filter: function(val){
           this.onGetCsv();
        },
        daylist: function(val){
        }
     },  
     computed: {
        //共通変数
        ...mapState({
          orderserver: "orderserver" 
        })
     },
     created() {
         this.onTheme();
         this.onGetCsv();
     },
     mounted() {
        // this.onExpArray();
         this.grid = this.createGrid(this.records);     
      //  }
     },
     data() {
        return {
          records: [],//dummy_list(this.daylist[0]),
          grid: null,
          header_bgcolor: "#2196F3", /*ヘッダー基本色*/
          header_color: "white", /*ヘッダー基本色*/             
          header_holiday_bgcolor: "gray", /*日付ヘッダー休み*/  
          header_today_bgcolor: "#F4FF81",  /*日付ヘッダー本日*/ 
          header_holiday_color: "white", /*日付ヘッダー休み フォント色*/  
          header_today_color: "black",  /*日付ヘッダー本日 フォント色*/
          planend_color: "gainsboro",
          shipment_color: "#FF5252",
          mnl_color: "#4169e1",
          smt_color: "#32cd32", 
          part_color: "#6D4C41",                              
          header_style: { 'color': 'white', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif"},  
          padding_zero: [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/],  /*日付ヘッダースタイル*/
          padding_one: [0 /*top*/, 1 /*right*/, 0 /*bottom*/, 1 /*left*/],  /*日付ヘッダースタイル*/
          button_style: {'bgColor': 'white','color': '#ffffff', 'padding': [3 /*top*/, 3 /*right*/, 3 /*bottom*/, 3 /*left*/], 'font': "12px sans-serif"}, 
          cell_holiday_color: "gainsboro",  
          cell_style: {'bgColor': 'white','color': 'black','padding': this.padding_zero, 'font': "11px sans-serif", "textAlign": "left" }, /* セル基本スタイル */
          cell_number_style: {'bgColor': 'white','color': 'black','padding': this.padding_one, 'font': "11px sans-serif", "textAlign": "right" }, /* セル基本スタイル */
          dayOfWeekStr: [ "日", "月", "火", "水", "木", "金", "土" ],
          headerRowHeight: 25,
          defaultwidth: 50,
          frozenColCount: 6,
          exparray: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          exparray2: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],          
          stockarray: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          userTheme: null,
          gridcolwidth: {
            col1: 80,
            col2: 250,
            col3: 100,
            col4: 50,
            col5: 150,
            col6: 70,  
            col7: 68,            
          }
        };
     },
     methods: {
        onGetCsv(){
          var self = this;
          var senddata = {
            params: {  
              type: self.filter.type,
              filter: self.filter.filter1,      
              retdata: "",
            }
          } 
          let promise = axios.get( this.orderserver + "/getcsvdata", senddata)  
          return promise.then((result) => {
            self.grid.records = result.data.retdata;
            self.grid.invalidate();
          }).catch(error => {
            console.log("error " + error) 
          }) 
        },
        onRowStyle(rec, defaultStyle){
          var style = JSON.parse(JSON.stringify(defaultStyle))
          return style
        },
        onTheme() {
          var ret = {
            frozenRowsBgColor: "#40b883",
            frozenRowsColor: "white",
          //  frozenRowsBorderColor: "black",
            font: "normal normal normal 11px/1 FontAwesome",
            borderColor({ col, row, grid }) {
              if (row < 9) { // ヘッダー
                  return [null /*top*/, "#616161" /*right and left*/, "#616161" /*bottom*/];
              } else {
              //  if( row % 3 === 2) { // セル　
                  return [null /*top*/, "#616161" /*right and left*/,"#616161" /*bottom*/];
              //  } else {
               //   return [null /*top*/, "#616161" /*right and left*/, "silver" /*bottom*/];
              //  }
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
            { caption: "生産No", 
              width: this.gridcolwidth.col1,  
              headerType: "sort",
              headerAction: "sort",
            },
            { caption: "機種名", 
              width: this.gridcolwidth.col2,  
              headerType: "sort",
              headerAction: "sort",
            },   
            { caption: "数量", 
              width: this.gridcolwidth.col3, 
            },
            { caption: "仕向け", 
              width: this.gridcolwidth.col4, 
            },
            { caption: "コメント", 
              width: this.gridcolwidth.col5,  
            },
            { caption: "取込数", 
              width: this.gridcolwidth.col6,  
            },
            { caption: "選択", 
              width: this.gridcolwidth.col7,  
            }        
          ]; 
          var crow1 = [
            { field: "_id",
              width:this.gridcolwidth.col1, 
              style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
            }, 
            { field: "modelname",
              width:this.gridcolwidth.col2, 
              style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
            },  
            { field: "qty",
              width:this.gridcolwidth.col3, 
              style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
            },
            { field: "destination",
              width:this.gridcolwidth.col4, 
              style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
            }, 
            { field: "comment",
              width:this.gridcolwidth.col5, 
              style: (record) => { return vm.onRowStyle(record, vm.cell_style ) },
            }, 
            { field: "plancount",
              width:this.gridcolwidth.col6, 
              style: (record) => { return vm.onRowStyle(record, vm.cell_number_style ) },
              columnType: "number" 
            },
            { width: this.gridcolwidth.col7, 
              style: (record) => { return vm.onRowStyle(record, vm.button_style ) },
              columnType: new cheetahGrid.columns.type.ButtonColumn({
                caption: "選択",
              }),
              action: new cheetahGrid.columns.action.ButtonAction({
                action(rec) {
                  vm.$emit("select", [rec]);
                },
              })
            },           
          ];  

          option.layout.header.push(hrow1);
          option.layout.body.push(crow1);
        //  option.layout.body.push(crow2);
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
         } = cheetahGrid.ListGrid.EVENT_TYPE;
  
         grid.listen(DBLCLICK_CELL, (...args) => console.log(DBLCLICK_CELL, args));
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
         grid.listen(SCROLL, (...args) => console.log(SCROLL, args));
  
         grid.listen(CHANGED_VALUE, (...args) => this.test(CHANGED_VALUE, args));*/
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
         
          grid.records = records
          return grid;
        }, 
        onSelected(e) {
           var offset = this.frozenColCount - 0;
           var daylength = this.daylist.length-1;
           if (e.col >= (offset + daylength)) {
              if (e.row === 0 ) {
                var col = e.col - offset;
                var parts = [];
          //   this.$emit("select", array);
                for (var i in this.records) {
                  if (this.records[i].daylist[col].use > 0) {parts.push(this.records[i]._id) };
                }
                this.onArryFilter(parts);
              }
              if (e.row === 1) {
                var col = e.col - offset;
                var parts = [];
          //   this.$emit("select", array);
                for (var i in this.records) {
                  if (this.records[i].daylist[col].use < 0) {parts.push(this.records[i]._id) };
                }
                this.onArryFilter(parts);
              } 
           } else {
             if (e.col >= offset) {
              if (e.row === 0 ) {
                var col = e.col - offset;
                var parts = [];
          //   this.$emit("select", array);
                for (var i in this.records) {
                  if (this.records[i].daylist[col].stock <= this.records[i].minpice && this.records[i].minpice > 0) {parts.push(this.records[i]._id) };
                }
                this.onArryFilter(parts);
              }
              if (e.row === 1) {
                var col = e.col - offset;
                var parts = [];
          //   this.$emit("select", array);
                for (var i in this.records) {
                  if (this.records[i].daylist[col].total <= 0) {parts.push(this.records[i]._id) };
                }
                this.onArryFilter(parts);
              }
             } 
           } 
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
              var newLine = filterarr.filter(function(item, index){
                if (item == record._id) return true;
              });

              if ( newLine.length > 0 ) {
                 return true;
              }
            return false;
          } : null;
              this.grid.invalidate();
              if (filterDataSource._filterData != null){
                this.$emit("count", filterDataSource._filterData._filteredList.length);
              }
        },
     },
  };
  
  </script>
  
  <style scoped>
  
  </style>