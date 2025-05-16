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
                     :rowHeight="detailRowHeight"
                     :cellDoubleClicked = "onCellDbClick"
                     :rowSelected="onRowSelected"
                     :cellValueChanged="onCellValueChanged"
                     :frameworkComponents="frameworkComponents"
                     >
         </ag-grid-vue>
    </b-container>
 </template>
 
 <script>
 import "ag-grid-community/dist/styles/ag-grid.css";
 import "ag-grid-community/dist/styles/ag-theme-balham.css";
 import { AgGridVue } from "ag-grid-vue";

 import RowButton from "./RowButton.vue"

   export default {
     props: ["items","hight"],
     components: {
        AgGridVue
     },  
     data() {
       return {
         gridOptions: null,
         columnDefs: null,
         rowData: [],
         detailRowHeight: 30,
         defaultColDef: null,
         width: "100%",
         height: "90vh",
         gridApi: null,
         columnApi: null,
         gridColumnApi: null
       }
     },
     watch: {
       items: function(val) {
          this.rowData = val; 
       },
     },
     mounted() {
       this.gridApi = this.gridOptions.api;
       this.gridColumnApi = this.gridOptions.columnApi;
       this.rowData = this.items; 
     },
     computed: {

     },
     methods: {
       onCellDbClick: function(e) {
          this.$emit("selected", null);
       },
       onRowSelected: function(params) {
         const selectedRows = params.api.getSelectedRows();
         this.$parent.selectedRows = selectedRows;
       },
       update_row: function(data){
          var rowNode = this.gridApi.getRowNode(data._id);
          rowNode.setData(data);
       },
       ageCellRenderer_rank(params) {
         return this.importance[params.value].text; 
       },
       cellDbClick: function(val) {
          alert(val);
       },
       onCellValueChanged: function(e) {
          console.log(e)
          alert(e.data.value + " " + e.colDef.field + " " + e.oldValue + " ⇒ " + e.value);
       }
     },
    beforeMount(param) {
      var self = this;
      this.frameworkComponents = {ButtonComponent: RowButton};
      this.gridOptions = {
         getRowNodeId: function(data) { return data.value; }
      };

      this.defaultColDef = {
         resizable: true,
      };

      this.columnDefs = [
         {
           headerName: "VALUE",
           field: "value",
           width: 100,
           filter: true,
           sortable: true,
           cellClass: "grid-cell-num"
         },
         {
           headerName: "TEXT",
           field: "text",
           width: 160,
           filter: true,
           sortable: true,
           editable: true,
           cellClass: "grid-cell"
         },
         {
           headerName: "BUTTON",
           field: "value",
           width: 160,
           cellClass: "grid-cell",
           cellStyle: {padding: 0},
           cellRenderer: "ButtonComponent",
           cellRendererParams: {
               action: self.cellDbClick.bind(this),
           }
         }
      ] 
     }
   }     

 </script>
 
 <style scoped>

 </style>
 