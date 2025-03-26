<template>
    <b-container fluid>
      <!-- User Interface controls -->
      <b-row class="h-8 titles">
        <b-col xl="12" class="m-0">
           <b-button class="m-1 bg-danger float-right" size="sm" variant="danger" @click="onClose">閉じる</b-button>     
        </b-col>
      </b-row>
      <b-row class="h-88">
        <b-col class="col-6 p-3">
            <mc-grid ref="plangrid" :items="mclist" class="p-0"></mc-grid>
        </b-col>
        <b-col class="col-6 p-3">

            <b-row>
                <b-col class="col-3 m-2 p-0">
                      <label class="m-1">ID:</label>
                </b-col>  
                <b-col class="col-8 m-2 p-0">
                      <b-form-input id="gouki" type="text" v-model="selectRow._id" placeholder="" class="m-1"></b-form-input>
                </b-col>  
            </b-row>
            <b-row>
              <b-col class="col-3 m-2 p-0">
                  <label class="m-1">タイプ:</label>
              </b-col>
              <b-col class="col-8 m-2 p-0">
                  <b-form-select v-model="selectRow.type" :options="types" class="m-1"></b-form-select>
              </b-col>
            </b-row>
           <b-row>
                <b-col class="col-3 m-2 p-0">
                      <label class="m-1">号機:</label>
                </b-col>  
                <b-col class="col-8 m-2 p-0">
                      <b-form-input id="mcno" type="number" v-model="selectRow.mcno" placeholder="" class="m-1"></b-form-input>
                </b-col>  
            </b-row>
            <b-row>
                <b-col class="col-3 m-2 p-0">
                      <label class="m-1">表示No:</label>
                </b-col>  
                <b-col class="col-8 m-2 p-0">
                      <b-form-input id="gouki" type="number" v-model="selectRow.boardpos" placeholder="" class="m-1"></b-form-input>
                </b-col>  
            </b-row>
            <b-row>
                <b-col class="col-8 m-2 p-0">
                     <b-button class="m-1 bg-primary" size="sm" variant="primary" @click="onUpdate">決定</b-button>
                </b-col>  
            </b-row> 
        </b-col>
      </b-row>
</b-container>
</template>

<script>

import Vue from "vue";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import McGrid from './McGrid.vue';
import { mapState } from 'vuex'
import moment from 'moment';

export default {
  name: 'window',
  props: ["items"],
  data() {
    return {
        selected: null,
        workdata: null,
        mcno: 0,

        selectedRows: [],
        selectRow: {
          _id: "",
          type: 0,
          mcno: "",
          boardpos: 0
        },
        mclist: []
    }
  },
  watch: {
     items: function(val) {
       this.mclist = tval
     },
     selectedRows: function(val){
       this.selectRow = val[0];
     }
  },
  methods: {
     onClose: function() {
       this.$emit("close",);
     },
     onUpdate: function(){
       var dia = confirm("更新しますか？");
       if (dia == true){
          this.$emit("update",this.selectRow);
       }
     }
  },
  computed: {
      ...mapState({
        customerid: 'customerid',
        loginflg: 'loginflg',
        workerid: 'workerid',
        workername: 'workername',
        machines: 'machines',
        types: 'types'
      })
  },
  components: {
      "mc-grid": McGrid
  },
  mounted() {
    this.mclist = this.items
  },

};

var toDoubleDigits = function(num) {
  num += "";

  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

</script>

<style scoped>
.grid-cell {
  font-size: 16px;
}

.title {
  font-family:'Impact',sans-serif;
  font-weight: bold;
}

</style>
