<template>
    <b-container fluid>
      <!-- User Interface controls -->
      <b-row class="h-100">
        <b-col xl="12" class="m-0 p-0">
            <moni-grid ref="plangrid" :items="displist" :rowitem="rowitem" @dbclick="editopen" class="m-0 p-0"></moni-grid>
        </b-col>
      </b-row>
</b-container>
</template>

<script>

import Vue from "vue";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import MoniGrid from './MoniGrid.vue';
import { mapState } from 'vuex'
import moment from 'moment';

export default {
  name: 'window',
  props: ["items","rowitem", "pos"],
  data() {
    return {
        selected: null,
        workdata: null,
        mcno: 0,
        dispno: [0,0,0,0],
        selectedRows: []
    }
  },
  watch: {
     mcno: function(val) {
       this.dispno[parseInt(this.pos)]=val;
       this.$emit("onchange", this.dispno);
     },
     disp: function(val) {
       this.mcno = val[parseInt(this.pos)];
       this.dispno = val;
     },
     items: function(val) {
       this.workday = val[0].workday;
       console.log("items:" + JSON.stringify(val))
     },
     rowitem: function(val) {
       console.log("rowitem:" + JSON.stringify(val))
     }
  },
  methods: {
     editopen: function(row) {
       this.$emit("rowopen",row);
     },
  },
  computed: {
      ...mapState({
        customerid: 'customerid',
        loginflg: 'loginflg',
        workerid: 'workerid',
        workername: 'workername',
        machines: 'machines'
      }),
      ...mapState("tabletsystem",{
        tabletServer: "tabletServer",
        fllowdata: "fllowData",
        productionlist: "productionList",
        smtlogs: "smtLogs",
        xraylogs: "xrayLogs",
        massage: "massage"
      }),
      displist: function(){
        var json = [];
        var posi = parseInt(this.pos);
        for (var i = posi; i < posi + 15; i++) { 

          var disp = {
            _id: "_" + i,
            type: 0,
            mcno: "",
            modelname: "",
            status: -1
          }

          for (var t in this.items) {
            if (this.items[t].boardpos==i) {
              disp._id = this.items[t]._id;
              disp.type = this.items[t].type;
              disp.mcno = this.items[t].mcno + "";
              disp.modelname = this.items[t].modelname;
              disp.status = this.items[t].status;
              disp.importance = this.items[t].importance
            }
          }
          json.push(disp);
        }
        return json;
      }
  },
  components: {
      "moni-grid": MoniGrid
  },
  mounted() {
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
