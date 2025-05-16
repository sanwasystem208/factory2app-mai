<template>
    <div id="sample-grid">
    <ag-grid-vue style="width: 100%; height: 85vh;"
                :gridOptions="gridOptions"
                 class="ag-theme-balham-dark"
                 :columnDefs="columnDefs"
                 :rowData="rowData"
                 :rowSelected="onRowSelected"
                 rowSelection="multiple"
                 ref="plangrid"
                 :enableColResize="true"
                 :rowDragManaged="false"
                 :enableSorting="true"
                 :enableFilter="true" 
                 :cellDoubleClicked = "cellDbClick"
            >
        </ag-grid-vue>
    </div>
</template>

<script>

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";
import {AgGridVue} from "ag-grid-vue";

import { mapState } from 'vuex'
import moment from 'moment';

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
            selectedRows: null     
        }
    },
    components: {
        AgGridVue,
    },
    watch: {
      items: function(val) {
         this.rowData = val;  
      },
    },
    computed: {
      ...mapState("checkreport",{
        checkserver: "checkServer",
        nglists: "nglists",
        ngmethods: "ngmethods",
        ngjudgment: "ngjudgment",
        productionlist: "productionlist"
      })
    },
    mounted() {
      this.gridApi = this.gridOptions.api;
      this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        cellDbClick: function(){
         //   e.value.ornerid = this.selectedRows[0]._id;
           this.$emit("dbclick", null);
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
            this.$emit('onupdate', params);
        },
        onSaveCsv() {
          this.gridApi.exportDataAsCsv(this.csvparams);
        },
        processCells(params) {
          if (params.column.colId == "ngcode") {
            return this.ageCellRenderer_ngcode(params)  
          } else if (params.column.colId == "ngmethod_sub") {
            return this.ageCellRenderer_ngmethod(params)  
          } else if (params.column.colId == "production") {
            return this.ageCellRenderer_production(params) 
          } else {
            return params.value;
          }
        },
        focusback() {
          var row = this.rowData;
          this.rowData = [];
          this.rowData = row;
        },
        ageCellRenderer_ngcode(params) {
            var ret ="";
            ret = this.nglists[parseInt(params.value)].text;           
            return ret;
        },
        ageCellRenderer_ngmethod(params) {
          var ret ="";
            if (params.value==null) {
              ret = "";
            } else {
              ret = this.ngmethods[parseInt(params.value)].text; 
            }          
            return ret;
        },
        ageCellRenderer_ngjudgment(params) {
          var ret ="";
            if (params.value==null) {
              ret = this.ngjudgment[0].text; 
            } else  {
              ret = this.ngjudgment[parseInt(params.value)].text; 
            }          
            return ret;
        },
        ageCellRenderer_production(params) {
          var ret =  this.productionlist[parseInt(params.value)].text;           
          return ret;
        },
    },
    beforeMount() {
        this.frameworkComponents = {};
        this.gridOptions = {
            getRowNodeId: function(data) { return data._id; }/*,
         /*   isExternalFilterPresent: this.isExternalFilterPresent,
            doesExternalFilterPass: this.doesExternalFilterPass*/
        },

        this.csvparams= {
            allColumns: true,
            fileName: addDaystr(new Date()),
            columnSeparator: ',',
            processCellCallback: this.processCells,
            columnGroups: false,
            onlySelected: true,
        /*    onlySelectedAllPages: false,
            skipFooters: false,
            skipGroups: false,
            skipHeader: false,
            skipPinnedTop: false,
            skipPinnedBottom: false,*/
        }

        this.columnDefs = [
        {
            headerName: '検査情報',
            children: [
              {
                    headerName: '作業者', 
                    field: 'workerid',
                    cellClass: "grid-cell",
                    width: 100,
                    sortable: true,
                    headerClass: "table-header",
                },
                {
                    headerName: '区分', 
                    field: 'production',
                    cellClass: "grid-cell",
                    width: 70,
                    cellRenderer: this.ageCellRenderer_production,
                    headerClass: "table-header",
                },
              {
                    headerName: '時間', 
                    field: 'workday',
                    cellClass: "grid-cell",
                    width: 150,
                    headerClass: "table-header",
                }
              ] 
             },
             {
               headerName: '製品情報',
               children: [   
                {
                    headerName: '注文No', 
                    field: 'order_no',
                    cellClass: "grid-cell",
                    width: 100,
                    headerClass: "table-header",
                },        
                {
                    headerName: '機種名', 
                    field: 'modelname',
                    cellClass: "grid-cell",
                    width: 240,
                    headerClass: "table-header",
                },
                {
                    headerName: 'ロットNo', 
                    field: 'lotno',
                    cellClass: "grid-cell-num",
                    width: 75,
                    headerClass: "table-header",

                },           
                {
                    headerName: '台数', 
                    field: 'lot_count',
                    cellClass: "grid-cell-num",
                    width: 75,
                    headerClass: "table-header",
                },
                {
                    headerName: '抜取数', 
                    field: 'nukitori',
                    cellClass: "grid-cell-num",
                    width: 75,
                    headerClass: "table-header",
                }
               ]
             },
             {
               headerName: '不良項目',
               children: [
                {
                    headerName: this.nglists[0].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[0].value; 
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header",
                },  
                {
                    headerName: this.nglists[1].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[1].value;  
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header",
                },   
                {
                    headerName: this.nglists[2].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[2].value; 
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header", 
                }, 
                {
                    headerName: this.nglists[3].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[3].value;  
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header",
                }, 
                {
                    headerName: this.nglists[4].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[4].value; 
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header",
                }, 
                {
                    headerName: this.nglists[5].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[5].value; 
                    },
                    cellClass: "grid-cell-num",
                    width:75,
                    headerClass: "table-header",
                }, 
                {
                    headerName: this.nglists[6].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[6].value; 
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header"
                }, 
                {
                    headerName: this.nglists[7].text, 
                    valueGetter: (params) => {
                      return params.data.checklist[7].value;  
                    },
                    cellClass: "grid-cell-num",
                    width: 70,
                    headerClass: "table-header",
                }, 
               ]
             },
             {
              headerName: '検査結果',
              children: [   
                {
                    headerName: '判定', 
                    field: 'ngjudgment',
                    cellClass: "grid-cell",
                    width: 90,
                    cellRenderer: this.ageCellRenderer_ngjudgment,
                    headerClass: "table-header"
                },
                {
                    headerName: 'NG処理', 
                    field: 'ngmethod',
                    cellClass: "grid-cell",
                    width: 90,
                    cellRenderer: this.ageCellRenderer_ngmethod,
                    headerClass: "table-header",
                },
                {
                    headerName: '備考', 
                    field: 'comment',
                    cellClass: "grid-cell",
                    width: 200,
                    headerClass: "table-header",
                } 
              ]
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

function addDaystr(str) {
   var date1 = new Date(str);

    // Date型を（YYYY/MM/DD）形式へ成型して返却
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日
   var hour = toDoubleDigits(date1.getHours()); // 時
   var min = toDoubleDigits(date1.getMinutes()); // 分
   var sec = toDoubleDigits(date1.getSeconds()); // 秒 

   return  "検査日報_" + year + month + day; 

}
</script>

<style scoped>
.ag-theme-balham{
    margin: auto;
}

.badgewidth {
   width: 28px;
}

.cellcountwidth {
    width: 50px;
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

.table-header {
  padding: 0;
}
</style>