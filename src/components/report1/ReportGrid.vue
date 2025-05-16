<template>
   <b-container fluid>
       <ag-grid-vue :style="{width, height}"
                    :gridOptions="gridOptions"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    class="ag-theme-balham"
                    rowSelection='single'
                    ref="checkgrid"
                    :enableSorting="true"
                    :enableFilter="true" 
                    :enableColResize="true"
                    :rowDragManaged="true"
                    :suppressRowTransform="true"
                    :rowHeight="25"
                    :cellDoubleClicked = "cellDbClick"
                    :cellClicked = "cellClick"
                    :rowSelected="onRowSelected"
                    >
        </ag-grid-vue>
   </b-container>
</template>

<script>
import Vue from 'vue'
import axios from "axios";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import Bootstrap from 'bootstrap';
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { AgGridVue } from "ag-grid-vue";

import moment from "moment";

import { mapState } from 'vuex'

  export default {
    props: ["items","hight"],
    components: {
       AgGridVue
    },  
    data() {
      return {
        gridOptions: null,
        columnDefs_plan: null,
        rowData: null,
        rows: this.currentrow,
        detailCellRendererParams: null,
        detailRowHeight: null,
        defaultColDef: null,
        width: "100%",
        height: "45vh",
        gridApi: null,
        columnApi: null,
        gridColumnApi: null
      }
    },
    watch: {
      currentid: function(val) {
         this.msg = val + " で登録しました";
      },
      items: function(val) {
         this.rowData = val;
       //  console.log("log:" + val.colDef.field)  
      },
      hight: function(val) {
        this.height = val;
      }
    },
    mounted() {
      this.gridApi = this.gridOptions.api;
      this.gridColumnApi = this.gridOptions.columnApi;
    //  this.rowData = this.items;
    },
    computed: {
    //共通変数
      ...mapState({
        workerid: 'workerid',
        workername: 'workername',
        managementlevel: 'managementlevel',
        customerid: 'customerid',
        customername: 'customername',
        loginflg: 'loginflg',
        reportserver: 'reportserver',
        shifttime: 'shifttime',
        importance: 'importance'
      })
    },
    methods: {
      deselected_row: function() {
        this.gridApi.deselectAll();
      },
      cellDbClick: function(e) {
         this.$emit("selected", null);
      },
      cellClick: function(e){
         this.$emit("onclick", e.data);
      },
      onRowSelected: function(params) {
        const selectedRows = params.api.getSelectedRows();
        this.$parent.selectedRows = selectedRows;
      },
      update_row: function(data){
         var rowNode = this.gridApi.getRowNode(data._id);
         rowNode.setData(data);
      },
      ageCellRenderer_time(params) {
        if (params.value === null) {
          return '-';
        } else {
          return params.value.substr(11,5);
        }
      },
      ageCellRenderer_number(params) {
       return formatNumber(params.value); 
      },
      ageCellRenderer_rank(params) {
        return this.importance[params.value].text; 
      },
      selectAllAmerican(id) {
        this.gridApi.forEachNode(function (node) {
          node.setSelected(node.data._id === id);
        });
      },
    },
  beforeMount(param) {
    var self = this;
    this.gridOptions = {
        getRowNodeId: function(data) { return data._id; }
    };

    this.defaultColDef = {
      resizable: true,
    };

    this.columnDefs = [
      {
       headerName: '基本情報',  
       cellStyle: {padding: 0},
       cellClass: "grid-cell2",
       children:
         [
          {
            headerName: "号機名",
            field: "machine",
            width: 150,
            filter: true,
            sortable: true,
            cellClass: "grid-cell"
          },
          {
            headerName: "機種名",
            field: "model.text",
            width: 300,
            filter: true,
            sortable: true,
            cellClass: "grid-cell"
          },
          {
            headerName: "機種No",
            field: "modelno",
            width: 120,
            filter: true,
            sortable: true,
            cellClass: "grid-cell"
          },
          {
            headerName: "生産No",
            field: "productno",
            width: 120,
            filter: true,
            sortable: true,
            cellClass: "grid-cell"
          },
          {
            headerName: "ロットNo",
            field: "lotno",
            width: 80,
            filter: true,
            sortable: true,
            cellClass: "grid-cell-num"
          },
        ]
      },
      {
       headerName: '作業時間',  
       cellStyle: {padding: 0},
       cellClass: "grid-cell2",
       children:
         [
          {
            headerName: "開始",
            field: "start",
            width: 100,
            filter: true,
            sortable: true,
            cellClass: "grid-cell",
            cellRenderer: this.ageCellRenderer_time
          },
          {
            headerName: "終了",
            field: "last",
            width: 100,
            filter: true,
            sortable: true,
            cellClass: "grid-cell",
            cellRenderer: this.ageCellRenderer_time
          }
         ]
      },
      {
       headerName: '台数',  
       cellStyle: {padding: 0},
       cellClass: "grid-cell2",
       children:
         [
          {
            headerName: "予定",
            field: "plancount",
            width: 90,
            filter: true,
            sortable: true,
            cellClass: "grid-cell-num",
            cellRenderer: this.ageCellRenderer_number
          },
          {
            headerName: "実績",
            field: "productcount",
            width: 90,
            filter: true,
            sortable: true,
            cellClass: "grid-cell-num",
            cellRenderer: this.ageCellRenderer_number
          }
         ]
      },
      {
       headerName: 'その他',  
       cellStyle: {padding: 0},
       cellClass: "grid-cell2",
       children:
         [
          {
            headerName: "優先順位",
            field: "rank",
            width: 90,
            filter: true,
            sortable: true,
            cellClass: "grid-cell",
            cellRenderer: this.ageCellRenderer_rank,
            cellStyle: (params) => {
                var ret = {'background-color': self.importance[params.value].color, padding: 0}
                return ret
            }, 
          },
          {
            headerName: "備考",
            field: "comment",
            width: 350,
            filter: true,
            sortable: true,
            cellClass: "grid-cell"
          }
         ]
      }
     ] 
    }
  }     

function separate(num){
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

function NulCheck(str){
    if (str == null) {
       str = "";
    }
    return str;
}

function NulCheckZero(str){
    if (str == null) {
       str = "0";
    }
    return str;
}

function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function addid(str,i) {
  var date1 = new Date(str);

  // Date型を（YYYY/MM/DD）形式へ成型して返却
  date1.setHours(date1.getHours()+i);
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec; 
}

function addtime(str,i) {
  var date1 = new Date(str);

  // Date型を（YYYY/MM/DD）形式へ成型して返却
  date1.setHours(date1.getHours()+i);
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  month + "-" + day + " " + hour + ":" + min; 
}

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
  return num;     
};

</script>

<style scoped>
 .title {
    background-color: chocolate;
 }
 .labels {
    width: 200px;
}

.show-cell {
  background: white;
  border-left: 1px solid lightgrey !important;
  border-right: 1px solid lightgrey !important;
  border-bottom: 1px solid lightgrey !important;
}

.show-name {
  font-weight: bold;
}

.show-presenter {
  font-style: italic;
}

</style>
