<template>
    <div id="sample-grid">
    <ag-grid-vue style="width: 100%; height: 32vh;"
                :gridOptions="gridOptions"
                 class="ag-theme-balham-dark"
                 :columnDefs="columnDefs"
                 :rowData="rowData"
                 :rowSelected="onRowSelected"
                 rowSelection="multiple"
                 ref="plangrid"
                 :enableColResize="true"
                 :rowDragManaged="false"
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
                headerName: '作業者', 
                field: 'workerid',
                cellClass: "grid-cell",
                width: 140
            },
           {
                headerName: '時間', 
                field: 'workday',
                cellClass: "grid-cell",
                width: 160,
                cellRenderer: (data) => {
                    return moment(data.createdAt).format('MM/DD/YYYY HH:mm:ss')
                }
            },
            {
                headerName: '注文No', 
                field: 'order_no',
                cellClass: "grid-cell",
                width: 100,
            },        
            {
                headerName: '機種名', 
                field: 'modelname',
                cellClass: "grid-cell",
                width: 250,

            },
            {
                headerName: '台数', 
                field: 'daisu',
                cellClass: "grid-cell-num",
                width: 80
            },
            {
                headerName: '抜き取り', 
                field: 'nukitori',
                cellClass: "grid-cell",
                width: 80,
            },
            {
                headerName: 'NGコード', 
                field: 'ngcode',
                cellClass: "grid-cell",
                width: 150,
                cellRenderer: this.ageCellRenderer_ngcode,
            },
            {
                headerName: 'NG処理', 
                field: 'ngmethod_sub',
                cellClass: "grid-cell",
                width: 100,
                cellRenderer: this.ageCellRenderer_ngmethod
            },
            {
                headerName: '備考', 
                field: 'comment',
                cellClass: "grid-cell",
                width: 280
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