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
                 :allowDragFromColumnsToolPanel="false"
                 :suppressScrollOnNewData="true"
                 :suppressRowTransform="true"
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
        ngmethods2: "ngmethods2"
      })
    },
    mounted() {
      this.gridApi = this.gridOptions.api;
      this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        cellDbClick: function(){
         //   e.value.ornerid = this.selectedRows[0]._id;
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
        focusback() {
          var row = this.rowData;
          this.rowData = [];
          this.rowData = row;
        },
        ageCellRenderer_ngcode(params) {
          var ret ="";
          for (var i in params.value) {
            if (i==0) {
               ret += this.nglists[parseInt(params.value[i])].text;           
            } else {
               ret += "," + this.nglists[parseInt(params.value[i])].text;           
            }
          }
            return ret;
        },
        ageCellRenderer_ngmethod(params) {
          var ret ="";
          for (var i in params.value) {
            if (i==0) {
               ret += this.ngmethods2[parseInt(params.value[i])].text;           
            } else {
               ret += "," + this.ngmethods2[parseInt(params.value[i])].text;           
            }
          }
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
        this.columnDefs = [
        {
                headerName: '時間', 
                field: '_id',
                cellClass: "grid-cell",
                width: 160,
                filter: true,
                sortable: true,
            },
           {
                headerName: '作業者', 
                field: 'worker',
                cellClass: "grid-cell",
                width: 140,
                filter: true,
                sortable: true,
            },
            {
                headerName: '製品名', 
                field: 'modelName',
                cellClass: "grid-cell",
                width: 200,
                filter: true,
                sortable: true,
            },  
            {
                headerName: 'コード', 
                field: 'productName',
                cellClass: "grid-cell",
                width: 200,
                filter: true,
                sortable: true,
            },        
            {
                headerName: 'ロット', 
                field: 'lot',
                cellClass: "grid-cell",
                width: 250,
                filter: true,
                sortable: true,
            },
            {
                headerName: '開始時間', 
                field: 'startTime',
                cellClass: "grid-cell-num",
                width: 100,
                filter: true,
                sortable: true,
            },
            {
                headerName: '終了時間', 
                field: 'finishTime',
                cellClass: "grid-cell",
                width: 100,
                filter: true,
                sortable: true,
            },
            {
                headerName: '時間', 
                field: 'humidityTime',
                cellClass: "grid-cell",
                width: 100,
                filter: true,
                sortable: true,
            }
        ]
    }  
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
</style>