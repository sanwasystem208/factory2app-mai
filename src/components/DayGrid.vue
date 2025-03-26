 <template>
   <div ref="gridWrapper" class="grid-wrapper" style='width: 100%; height: 300px; border: solid 1px #000; margin: 0px'></div>
</template>
<script>

import { cheetahGrid } from 'vue-cheetah-grid';

import { mapState } from 'vuex'

export default {
    name: 'service',
    props: ["items","filter", "item"],
    components: {
        cheetahGrid,
    },
    watch: {
      items: function(val) {
        const vm = this;
        if (val.length > 0) {
          if (vm.grid == undefined) {
            vm.records = val;
            vm.grid = vm.createGrid(vm.records);
          } else  {
            vm.records = val; 
            vm.grid.records = vm.records;
            vm.grid.invalidate();
          }
        } else {
           vm.records = []; 
          vm.grid.records = [];
           vm.grid.invalidate();
        }  
      },
      records: function(val) {
        this.$emit("count", val.length);
      },
      item: function(val) {
        const vm = this;
        for ( let i = 0 ; i < vm.records.length ; i++ ) {
           if (vm.records[i]._id==val[0]._id) {
              vm.records[i] = val[0];          
           }
         }
              // 再描画
        vm.grid.invalidate();
      }
    },  
    computed: {
        ...mapState([
          "daylist",
          "month",
          "customer"
        ]),
    },
    created() {

    },
    mounted() {
      this.onTheme();
    },
    data() {
        return {
            records: [],
            width1: 200,
            userTheme: null,
            fd: null,
            bgheader: {'bgColor': '', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "12px sans-serif", "textAlign": "left" }, 
            bgstyle: {'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "12px sans-serif", "textAlign": "left" },
            bgcolumn: {'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif", "textAlign": "right" }, 
            bgcolumn2: {'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif", "textAlign": "right" }, 
            bgcolumn3: {bgColor: '#fffff0', 'padding': [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 'font': "11px sans-serif", "textAlign": "right" }, 
            buttonStyle: {'font': "10px sans-serif", "textAlign": "center", "buttonBgColor": "#20c997" }, 
            buttonStyle2: {'font': "10px sans-serif", "textAlign": "center", "buttonBgColor": "darkorange" }, 
            headerRowHeight: 20,
            defaultwidth: 49
        };
    },
    methods: {
      onFilter(filterstr) {
        const filterDataSource = new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(this.records));
        this.grid.dataSource = filterDataSource;
        filterDataSource.filter = filterstr ? (record) => {
                var i=0;
                for (const k in record) {
    
                    if ((`${
                        record[k]}`).indexOf(filterstr) >= 0) {
                        i += 1;
                        return true;
                    }
                }
                return false;
            } : null;
            this.$emit("count", i);
            this.grid.invalidate();

      },
      onArryFilter(filterarr) {
        if (filterarr.length > 0) {
            const filterDataSource = new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(this.records));
            this.grid.dataSource = filterDataSource;
            filterDataSource.filter = filterarr ? (record) => {
                //    for (const k in record) {
                        var newLine = filterarr.filter(function(item, index){
                       //   if (item == (`${record[k]}`)) return true;
                          if (item == record.modelname) return true;
                        });
                        if ( newLine.length > 0 ) {
                          return true;
                        }
                 //   }
                    return false;
                } : null;
                this.grid.invalidate();
                this.$emit("count", filterDataSource._filterData._filterdList.length);
        } else  {
          alert("対象が0件です");
          this.$emit("count", this.records.length);
          this.grid.records = this.records;
        }        
      },
      onkillFilter() {
        this.$emit("count", this.records.length);
        this.grid.records = this.records;
      },
      createGrid(records) {
        var vm = this;
        var option = {
          parentElement: this.$refs.gridWrapper,
          layout: {
            header: [],
            body: [],
          },
          frozenColCount: 4,
          headerRowHeight: this.headerRowHeight,
          defaultRowHeight: this.headerRowHeight,
          theme: this.userTheme,
          headerRowHeight: 14,
        }

        var hrow1 = [
            { caption: "選択", width: 50, headerStyle: this.bgheader, style: this.bgcolumn},
            { caption: "機種名", width: 150, headerStyle: this.bgheader, style: this.bgcolumn,headerType: "sort",headerAction: "sort"},
            { caption: "台数", width: 80, headerStyle: this.bgheader, style: this.bgcolumn, headerType: "sort",headerAction: "sort" },  
            { caption: "予定", width: 45, headerStyle: this.bgheader, style: this.bgcolumn, headerType: "sort",headerAction: "sort" },      
          ];
        var crow1 = [{ width: 45, 
                       style: vm.buttonStyle,
                       columnType: new cheetahGrid.columns.type.ButtonColumn({
                          caption: "選択"
                       }),
                        // ButtonAction
                       action: new cheetahGrid.columns.action.ButtonAction({
                            action(rec) {
                            vm.$emit("edit", rec);
                            }
                       }),
                     },
                     { field: "modelname", width: 150, style: this.bgstyle },
                     { field: "lot", width: 100, style: this.bgcolumn2 },
                     { field: "smt", width: 100, style: this.bgcolumn2 },
                     ];
        var crow2 = [{ width: 45, 
                       style: vm.buttonStyle2,
                       columnType: new cheetahGrid.columns.type.ButtonColumn({
                          caption: "部品"
                        }),
                        // ButtonAction
                       action: new cheetahGrid.columns.action.ButtonAction({
                            action(rec) {
                            var array = [];
                            var part = rec.partlist;
                            for (var i in part) {
                              array.push(part[i].partname)
                            }
                            vm.$emit("select", array);
                            }
                        }),
                     },
                     { field: "useday", caption: "納期", width:150, headerStyle: this.bgheader, style: this.bgcolumn, headerType: "sort",headerAction: "sort" },
                     { field: "qty", caption: "台数", width: 100, headerStyle: this.bgheader, style: this.bgcolumn2, headerType: "sort" ,headerAction: "sort", columnType: "number"  },
                     { field: "mnl", width: 100, style: this.bgcolumn2 },
                    ];     

        for (let i = 0; i < this.daylist.length; i++)   {;
            hrow1.push({ caption: toDoubleDigits(i+1), 
                         width: this.defaultwidth, 
                         headerStyle: this.bgheader,
                         style: this.bgcolumn
                         });

            crow1.push({ field: "day" + toDoubleDigits(i+1) + ".smt", 
                               width: this.defaultwidth, 
                               columnType: "number",
                               style(rec) {
                               var cl = undefined;
                               var di  = new Date(rec["day" + toDoubleDigits(i+1)].day).getDay();
                               if (di==0) { cl = "silver" }
                                return {
                                    bgColor: rec["day" + toDoubleDigits(i+1)].smt > 0 ? "pink" : cl,
                                    padding: [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 
                                    font: "11px sans-serif", 
                                    textAlign: "right" 
                                };
                               },
                               action: new cheetahGrid.columns.action.SmallDialogInputEditor({
                                 type: "number",
                                 classList: ["dialog"],
                                 action(rec) {
                                  var array = [];
                                  var part = rec.partlist;
                                  for (var i in part) {
                                    array.push(part[i].partname)
                                  }
                                  this.$emit("select", array);
                                 }
                               }) 
            });
            crow2.push({ field: "day" + toDoubleDigits(i+1) + ".mnl", 
                               width: this.defaultwidth, 
                               columnType: "number",
                               style(rec) {
                               var cl = undefined;
                               var di  = new Date(rec["day" + toDoubleDigits(i+1)].day).getDay();
                               if (di==0) { cl = "silver" }
                                return {
                                    bgColor: rec["day" + toDoubleDigits(i+1)].mnl > 0 ? "pink" : cl,
                                    padding: [0 /*top*/, 0 /*right*/, 0 /*bottom*/, 0 /*left*/], 
                                    font: "11px sans-serif", 
                                    textAlign: "right" 
                                };
                               },
                               action: new cheetahGrid.columns.action.SmallDialogInputEditor({
                                 type: "number",
                                 classList: ["dialog"],
                                 action(rec) {
                                  var array = [];
                                  var part = rec.partlist;
                                  for (var i in part) {
                                    array.push(part[i].partname)
                                  }
                                  this.$emit("select", array);
                                 }
                               }) 
            });          

        }  

        option.layout.header.push(hrow1);
        option.layout.body.push(crow1);
        option.layout.body.push(crow2);

        const grid = (this.grid = new cheetahGrid.ListGrid(option));

        grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.CHANGED_VALUE, (args) => { this.onChange(args) });
        grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, (args) => { this.onSelected(args) });

        grid.records = records
        return grid;
      }, 
      onChange(e) {
        var day = this.month + "-" + e.field.replace("day","").split(".")[0];
        var ps = e.field.replace("day","").split(".")[1];

        var partlist = [];
        var ids = [];
        var parts = [];
        for (var i in e.record.partlist) {
          if (e.record.partlist[i].process == ps) {
            partlist.push(e.record.partlist[i]); 
            ids.push(this.customer + "-" + e.record.partlist[i].partname + "-" + this.month);
            parts.push(e.record.partlist[i].partname);
          }
        }

        var ret = {
          _id:      e.record._id + "-" + day + "-" + ps, 
          ornerid:  e.record._id,
          qty:      parseInt(e.value),
          day:      day,
          flg:      true,
          customer: this.customer,
          process:  ps,
          partlist: partlist,
          ids: ids,
          parts: parts
        }
        console.log(ret);
        this.$emit("update", ret)
      },
      onSelected(e) {
     /*   var array = [];
        var part = this.records[e.row - this.grid.frozenRowCount].partlist;
        for (var i in part) {
          array.push(part[i].partname)
        }
        this.$emit("select", array);*/
      },   
      onTheme() {
        var ret = {
          color: "#000",
          frozenRowsColor: "#000",
          frozenRowsBorderColor: "#000",
          frozenRowsBgColor: "silver",
          borderColor: "#000",
          button: {
            color: "#fff",
            bgColor: "#20c997"
          },
          borderColor({ col, row, grid }) {
            if( row % 2 === 0 ) {
              return [null /*top*/, "#000" /*right and left*/, null /*bottom*/];
            } else {
              return ["#000" /*top*/, "#000" /*right and left*/, null /*bottom*/];
            }

          },
          defaultBgColor({ col, row, grid }) {
            if( row % 2 === 0 ) {
              return "#DEF";
                // 偶数の場合の処理
            }
          /*   const { start, end } = grid.selection.range;
            if (end.row < grid.frozenRowCount) {
              // change the color of the selection cols.
              if (start.col <= col && col <= end.col) {
                return "#DEF";
              }
            }
            if (row < grid.frozenRowCount) {
              return null;*/
          }
        }

        this.userTheme = ret; 
     }  
    },
};

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function getday(str) {
  var date1 = str.split("-");

  return  date1[2]; 

}

function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
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
