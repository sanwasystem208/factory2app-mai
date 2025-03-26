<template>
    <ag-grid-vue style="width: 100%; height: 80vh;"
                    :gridOptions="gridOptions"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData"
                    class="ag-theme-balham"
                    rowSelection="single"
                    ref="stockgrid"
                    :enableSorting="true"
                    :enableFilter="true" 
                    :enableColResize="true"
                    :rowDragManaged="true"
                    :suppressRowTransform="true"
                    :rowHeight="27"
                    @rowSelected="onRowSelected"
                    :cellValueChanged="onCellValueChanged"
                    @cellDoubleClicked = "cellDbClick"
                    :getRowHeight="getRowHeight"
                    :frameworkComponents="frameworkComponents"
                 >
    </ag-grid-vue>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { AgGridVue } from "ag-grid-vue";
import { mapState } from 'vuex';
import * as math from 'mathjs';

import ButtonArea  from "./ButtonArea.vue"
import CheckArea  from "./CheckArea.vue"
/*
import {
  GridOptions,
  ICellRendererParams
} from 'ag-grid-community';
*/
//共通関数//
import date_func from '../../api/date_func'
const { 
  toDoubleDigits,
  onCurrentMonth,
  formatDay,
  getMonth_Day,
  weekno,
  formatNumber
} = date_func();

export default {
  props: ["planlist", "param", "daylist"],
  data() {
    return {
      selectedRows: [],
      columnDefs: null,
      rowData: [],
      gridOptions: null,
      gridApi: null,
      columnApi: null,
      defaultColDef: null,
      defaultRowHeight: 27
    };
  },
  computed: {
    //共通変数
    ...mapState({
       mcplanserver: 'mcplanserver',
    }),

  },
  components: {
    AgGridVue,
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
   // this.onGetOrder();
  },
  watch: {
    rowData: function(val){
       console.log(val)
    },
    daylist: function(val) {
        console.log(val.length);
    },
    planlist: function(list){
      this.rowData = list; 
    }
  },
  methods: {
    setUpdateRow(data) {
     // if (data[0].endplan || data[0].disable) {
     //   this.gridApi.applyTransaction({ remove: data });
     // } else {
        var rowNode = this.gridApi.getRowNode(data[0]._id);
        rowNode.setData(data[0]);
        this.gridApi.refreshCells({force: true});
     // }
     // this.updatelistcount(this.rowData);
    },
    onCheck: function(e) {
       for (var i in this.rowData) {
        if (this.rowData[i]._id==e._id) {
            this.rowData[i].check = e.check;
        }
       }
       const selectedRows = this.rowData.filter( function( value ) {
         return value.check == true;
       })
       this.$emit("select2", selectedRows);
    },
    cellDbClick: function(e) {
      this.$emit("ondbclick", e)
    },
    onSelectionChanged: function(params) {
      let rows = params.api.getSelectedRows();
      this.$parent.selectrows1 = rows;
      console.log("onSelectionChanged:" + JSON.stringify(rows)); 
    },
    onRowSelected: function(params) {
      const selectedRows = params.api.getSelectedRows();
      this.$parent.selectrows = selectedRows;
      console.log("onRowSelected"); 
    },
    onCellValueChanged(params) {
      var str = '{"' + params.colDef.field + '":"' + params.value + '"}';
      var self = this;
      var senddata ={
          filter:  { _id: params.data._id },
          update:  JSON.parse(str),
          retflg: 0
      }
      let promise = axios.post( self.mcplanserver + "/setmcplan_update", senddata)  
            return promise.then((result) => {
                if (result.data.retflg==0){
                    alert("更新できませんでした");
                }   
            }).catch(error => {
            console.log("error " + error) 
      }) 
    },
    onPlanStatusColor(params) {
       var cl=null;
      /* if (params.data.qty <= params.data.product) {
         cl="gray";
       }*/
       /*if (params.data.commenttitle.length > 0) {
         cl="yellow";
       }*/
       return cl;
    },
    ageCellRenderer_shipment: function(params){
        var str = ""
        if (params.value.length > 0) {
          str +="<table width='100%' height='100%' class='celltableclass'><tbody>";
          for (var i in params.value) {
            str += "<tr><td width='36%'>" + getMonth_Day2(params.value[i].daystr)+"</td><td width='32%'>"+params.value[i].plan+"台</td><td width='32%'>"+params.value[i].product+"台</td></tr>";
          }
          str +="</tbody></table>";
        }
        return str;
    },
    ageCellRenderer_sabun: function(params){
        var num = 0
        var str = "";
        for (var i in params.value) {
           num += params.value[i].plan - params.value[i].product;
        }  
        str = "<p style='color: #000;'>" + num + "台</p>";
        return str;
    },
    ageCellRenderer_comment: function(params){
        var str = ""
        if (params.value.length > 0) {
          str +="<table width='100%' height='100%' class='celltableclass'><tbody>";
          for (var i in params.value) {
            str += "<tr><td width='100%'></td></tr>";
          }
          str +="</tbody></table>";
        }
        return str;
    },
    ageCellRenderer_task: function(params){
        var str = ""
        if (params.value.length > 0) {
          str +="<table width='100%' height='100%' class='celltableclass'><tbody>";
          for (var i in params.value) {
            str += "<tr><td width='40%'>" + params.value[i].start + "</td><td width='40%'>" + params.value[i].last + "</td><td width='20%' align='right'>" + params.value[i].count.toLocaleString() + "</td></tr>";
          }
          str +="</tbody></table>";
        }
        return str;
    },
    RefundedCellRenderer: function(params) {
        return params.value;
    },
    tooltipView(params){
      var str = "";
      var field = "";
      if (params.colDef.field.indexOf("info") != -1) {
        field = params.colDef.field.split(".")[0];
        if (params.data[field]["alert2"] > 0) {
          str += "自動入力につき要確認 ";  
        }
        if (params.data[field]["daystr"] < formatDay(new Date()) && params.data[field]["product"] < params.data[field]["plan"]){
          str += "実績が予定に満たない ";   
        }
        if (field=="info3") {
          if (params.data["daystr"] < params.data[field].daystr && params.data.product < params.data.qty) {
            str += "確定納期が元予定より遅い ";  
          }
        }
      }
      for (var i in params.data.commenttitle) {
        str += params.data.commenttitle[i] + "\n"
      }
      return str
    },
    oncellClick: function(e){
       this.$emit("select", e.data);
    }
  },
  beforeMount() {
    var self = this;
    this.frameworkComponents = {cellareaComponent: ButtonArea,checkareaComponent: CheckArea};
    this.gridOptions = {
        getRowNodeId: function(data) { return data._id; },
    },
    this.getRowHeight = params => {
      return params.data.tasklist.length * this.defaultRowHeight;
    };   
    this.defaultColDef = {
      editable: true,
      sortable: true,
      filter: true,
    };

    this.columnDefs = [    
       {  
          headerName: '', 
          field: '_id',
          cellClass: "grid-cell",
          width: 50,
          suppressMovable: true,
          cellRenderer: 'checkareaComponent',
          colId: "params",
          cellRendererParams: {
             action: self.onCheck.bind(this)
          },
        }, 
        {  
          headerName: '編集', 
          field: '_id',
          cellClass: "grid-cell",
          width: 65,
          suppressMovable: true,
          cellRenderer: 'cellareaComponent',
          colId: "params",
          cellRendererParams: {
             action: self.oncellClick.bind(this)
          },
        },      
        {
          headerName: "ID",
          cellClass: "grid-cell",
          width: 65,
          sortable: true,      
          field: 'sortno',
        },  
        {
          headerName: "注文No",
          cellClass: "grid-cell",
          width: 90,
          sortable: true,      
          field: 'csvdataid',
        }, 
        {
          headerName: "製品No",
          cellClass: "grid-cell",
          width: 90,
          sortable: true,      
          field: 'modelid',
        }, 
        {
          headerName: "製品名",
          cellClass: "grid-cell",
          width: 200,
          sortable: true,      
          field: 'modelname',
        }, 
        {
          headerName: "納期",
          cellClass: "grid-cell",
          width: 90,
          sortable: true,      
          field: 'shipment',
        },
        {
          headerName: "台数",
          cellClass: "grid-cell-num",
          width: 70,
          sortable: true,      
          field: 'qty',
          valueFormatter: 'Number(value).toLocaleString()'
        },
        {
          headerName: "実績(累積)",
          cellClass: "grid-cell-num",
          width: 100,
          sortable: true,      
          field: 'product',
          valueFormatter: 'Number(value).toLocaleString()'
        },
        {
          headerName: "前日の実績",
          cellClass: "grid-cell-num",
          width: 100,
          sortable: true,      
          valueGetter: (params) => {
              return params.data.product - params.data.subproduct;
          },
          valueFormatter: 'Number(value).toLocaleString()'
        },
        {
          headerName: "残り",
          cellClass: "grid-cell-num",
          width: 70,
          sortable: true,      
          valueGetter: (params) => {
              return params.data.qty - params.data.product;
          },
          valueFormatter: 'Number(value).toLocaleString()'
        },
        {
          headerName: "取数",
          cellClass: "grid-cell-num",
          width: 70,
          sortable: true,      
          field: 'pice',
        },
        {
          headerName: "単価",
          cellClass: "grid-cell-num",
          width: 70,
          sortable: true,      
          field: 'price',
        },
        {
          headerName: "登録日",
          cellClass: "grid-cell",
          width: 90,
          sortable: true,      
          field: 'startday',
        },
        {
          headerName: "切替",
          cellClass: "grid-cell-num",
          width: 70,
          sortable: true,      
          field: 'settingtime',
        },
        {
          headerName: "時間",
          cellClass: "grid-cell-num",
          width: 70,
          sortable: true,      
          valueGetter: (params) => {
              return math.add(math.divide(params.data.qty,math.multiply(math.divide(math.multiply(math.multiply(params.data.pice, this.param.spm), 60), 100 ), 100)),params.data.settingtime).toFixed(1) ;
          }
        },
        {
          headerName: "開始時刻",
          cellClass: "grid-cell",
          width: 120,
          sortable: true,      
          field: 'starttime',
        },
        {
          headerName: "終了時刻",
          cellClass: "grid-cell",
          width: 120,
          sortable: true,      
          field: 'lasttime',
        },
        {
          headerName: "日別台数",
          cellClass: "grid-cell",
          width: 200,
          sortable: true,      
          field: 'tasklist',
          cellRenderer: this.ageCellRenderer_task,
        },
    ];
  //  this.currentmodelid = this.modelData.modelid
  },
  created() {
    this.tooltipShowDelay = 0;
  },
  beforeDestroy() {
       console.log("beforeDestroy")
  }
};

</script>

<style scoped>

</style>
