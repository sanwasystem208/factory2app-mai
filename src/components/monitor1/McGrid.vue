<template>
    <div id="sample-grid">
    <ag-grid-vue style="width: 100%; height: 70vh;"
                :gridOptions="gridOptions"
                 class="ag-theme-balham-dark"
                 :columnDefs="columnDefs"
                 :rowData="rowData"
                 :rowSelected="onRowSelected"
                 rowSelection="multiple"
                 ref="plangrid"
                 :enableColResize="true"
                 :rowDragManaged="false"
                 :defaultColDef="defaultColDef"
                 :allowDragFromColumnsToolPanel="false"
                 :suppressScrollOnNewData="true"
                 :suppressRowTransform="true"
                 :cellDoubleClicked = "cellDbClick"
                 :frameworkComponents="frameworkComponents"
          >
        </ag-grid-vue>
    </div>
</template>

<script>

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import {AgGridVue} from "ag-grid-vue";

import { mapState } from 'vuex'
import moment from 'moment';

import ButtonArea  from "./ButtonArea.vue"
import HeaderArea  from "./HeaderArea.vue"

export default {
    name: 'sampleGrid',
    props: ["items"],
    data() {
        return {
            columnDefs: null,
            rowData: null,
            daydata: null,
            gridOptions: null,
            gridApi: null,
            gridColumnApi: null,
            selectedRows: null,
            defaultColDef: null     
        }
    },
    components: {
        AgGridVue,
    },
    watch: {
      rowData: function(val) {
      },
      items: function(val) {
         this.rowData = val;  
      },
      rowitem: function(val){
        if (val._id !=undefined) {
          var rowNode = this.gridApi.getRowNode(val._id);
        //  rowNode.setData(val);
          if (rowNode != undefined) {
            rowNode.setDataValue('status', val.status);
            rowNode.setDataValue('modelname', val.modelname);
            rowNode.setDataValue('importance', val.importance);
          }

        }
      }
    },
    computed: {
     ...mapState({
        basicprocess: 'basicprocess',
        status: 'status',
        types: 'types',
        importance: 'importance'
      }),
      ...mapState("monitor1",{
      })
    },
    mounted() {
      this.gridApi = this.gridOptions.api;
      this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        onGridReady(params) {
        },
        cellDbClick: function(e) {
       //   e.value.ornerid = this.selectedRows[0]._id;
           this.$emit("dbclick",e)
        },
        onRowSelected: function(params) {
          this.selectedRows = params.api.getSelectedRows();
          this.$parent.selectedRows = this.selectedRows;
        },
        onSelectionChanged: function(params) {
          this.selectedRows = params.api.getSelectedRows();
          this.$parent.selectedRows = this.selectedRows;
        },
        onCellValueChanged(params) {
            console.log(params);
         //   this.$emit('onupdate', params);
        },
        ageCellRenderer_status(params) {
          var newLines = this.status.filter(function(item, index){
            if (item.value == parseInt(params.value)) return true;
          });      
          var ret = "";
          if (newLines.length > 0) {
            if (params.value == 0) {
              ret = '<h5 class="m-1"><span class="badge badge-light pt-2 pb-2 badgewidth80">' + newLines[0].text + '</span></h5>'; 
            } else if (params.value == 11) {
              ret = '<h5 class="m-1"><span class="badge badge-primary pt-2 pb-2 badgewidth80">' + newLines[0].text + '</span></h5>'; 
            } else {
              ret = '<h5 class="m-1"><span class="badge badge-success pt-2 pb-2 badgewidth80">' + newLines[0].text + '</span></h5>'; 
            }   
          } else {
              ret = '';     
          }  
          return ret
        },
        ageCellRenderer_importance(params) {
          var newLines = this.importance.filter(function(item, index){
            if (item.value == parseInt(params.value)) return true;
          });      
          var ret = "";
          if (newLines.length > 0) {
            if (params.value == 0) {
              ret = '<h5 class="m-1"><span class="badge badge-light pt-2 pb-2 badgewidth70">' + newLines[0].text + '</span></h5>'; 
            } else {
              ret = '<h5 class="m-1"><span class="badge badge-danger pt-2 pb-2 badgewidth70">' + newLines[0].text + '</span></h5>'; 
            } 
          } else {
              ret = '';     
          }    
          return ret
        },
        ageCellRenderer_type(params) {
          var newLines = this.types.filter(function(item, index){
            if (item.value == parseInt(params.value)) return true;
          });  
          if (newLines.length > 0) {          
            return newLines[0].text
          } else {
            return ""     
          }  
        },
        ageCellRenderer_model(params) {
          var ret = "";
          ret += "<h5>" + params.value + "</h5>";
          ret += "<h5>" + params.data.lot + "</h5>";
          return ret;
        },
    },
    beforeMount() {
        this.frameworkComponents = {cellareaComponent: ButtonArea,MyHeaderComponent: HeaderArea};
        this.gridOptions = {
            getRowNodeId: function(data) { return data._id; }
        },

        this.defaultColDef = {
          headerClass: 'my-header-class'
        }

        this.columnDefs = [
           {
                headerName: 'ID', 
                field: '_id',
                width: 130,
           }, 
           {
                headerName: 'タイプ', 
                field: 'type',
                cellClass: "grid-cell",
                cellStyle: {padding: 0},
                width: 110,
                cellRenderer: this.ageCellRenderer_type
           },  
           {
                headerName: '号機',
                field: 'mcno',
                cellClass: "grid-cell-num",
                cellStyle: {padding: 0},
                width: 70,
                cellStyle: function(params) {
                    return { padding: 4 };
                }
            },         
            {
                headerName: '予定',
                field: 'boardpos',
                cellClass: "grid-cell-num",
                width: 70,
                cellStyle: function(params) {
                    return { padding: 4 };
                }
            }
        ]
    }  
}

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function getDay3(str,i) {
  var date1 = new Date(str);
  date1.setDate(date1.getDate() + i);  
//   var off = weekday_offset(date1)  
//   date1.setDays(date1.getDays() + off); 
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = date1.getMonth() + 1; // 月
  var day = toDoubleDigits(date1.getDate()); // 日 
  return  month + "-" + day; 
}

function getclass(day) {
    var sday = new Date(day);
    var wDay = sday.getDay();
    return cellStyle2(wDay)
}

function cellStyle2(no) {
  //  var no = data.value[0].pos;
    var color = "bgnone2";
    if (no == 0) {
        color = "bggray2"
      } else if (no == 6 ) {
        color = "bgsilver2"
      } 
    return color
}

function WeekName(day) {
         var WeekChars = [ "日", "月", "火", "水", "木", "金", "土" ];  
         var sday = new Date(day);
         var wDay = sday.getDay();
         return WeekChars[wDay];
}

function WeekClass(day) {
         var WeekChars = [ "日", "月", "火", "水", "木", "金", "土" ];  
         var sday = new Date(day);
         var wDay = sday.getDay();
         var cl = "";
         if ( wDay == 0 ) {
           cl = "Sunday";
         } else if ( wDay == 6 ) {
           cl = "Saturday";
         } else {
           cl = "Workday"
         }
         return cl
}

function addDay(str) {
   var date1 = new Date(str);
 //  date1.setDate(date1.getDate() + 0);
    // Date型を（YYYY/MM/DD）形式へ成型して返却
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日
   var hour = toDoubleDigits(date1.getHours()); // 時
   var min = toDoubleDigits(date1.getMinutes()); // 分
   var sec = toDoubleDigits(date1.getSeconds()); // 秒 

   return  month + "-" + day; 

}

function separate(num){
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

</script>

<style scoped>

.ag-cell{
    vertical-align: middle;
}

.ag-theme-balham{
    margin: auto;
}

.badgewidth {
   width: 28px;
}

.cellcountwidth {
    width: 90px;
}

.badgewidth {
    width: 70px;
}

.show-cell {
    background: white;
    border-left: 1px solid lightgrey !important;
    border-right: 1px solid lightgrey !important;
    border-bottom: 1px solid lightgrey !important;
    padding: 0px;
}

.select-cell {
    padding: 0px;
    background-color: aqua;
}

table
{
   height: 30px;
   border-spacing: 1px;
}

table tr{
   height: 20px;
}

.bgsilver {
   background-color: silver
}

.bggray {
  background-color: gray
}

.redtext {
  color: red;
}

.box{
  float: left;
}

.boxContainer{
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>