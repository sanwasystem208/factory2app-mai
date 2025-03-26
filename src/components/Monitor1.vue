<template>
  <b-container fluid class="darkheader">
    <b-row class="h-8 header">
        <b-col cols="12" class="pt-1 text-center lightheader">
          <b-button class="m-1 bg-info float-left" size="sm" variant="info" @click="onReturn">設定</b-button>
          <b-button class="m-1 bg-info float-left" size="sm" variant="success" @click="uodatelist">更新</b-button>
          <h2 class="title"> 【生産状況】</h2>
        </b-col>
    </b-row>
    <b-row class="h-92">
        <b-col class="col-4 p-0">
            <window :items="mclist" :rowitem="rowitem" pos="1" @rowopen="inportopen" class="m-0"></window>
        </b-col>
        <b-col class="col-4 p-0">
            <window :items="mclist" :rowitem="rowitem" pos="16" @rowopen="inportopen" class="m-0"></window>
        </b-col>
        <b-col class="col-4 p-0">
            <window :items="mclist" :rowitem="rowitem" pos="31" @rowopen="inportopen" class="m-0"></window>
            <modal name="inport-form"       
                :width="700"
                :height="400">
                <row-edit ref="rowedit" class="m-0" :items="selectrow" @close="inporthide" @onUpdate="updaterow"></row-edit> 
            </modal>
            <modal name="setting-form"       
                :width="1000"
                :height="750">
                <mc-edit ref="mcedit" class="m-0" :items="mclist" @close="settinghide" @update="updatesetting"></mc-edit> 
            </modal>
        </b-col>
    </b-row>
  </b-container>
</template>

<script>
//<ag-grid :items="modeldata" ></ag-grid>
import Vue from 'vue'

import Window from './monitor1/WorkWindow.vue'
import io from 'socket.io-client';

import { mapState } from 'vuex'
import VModal from 'vue-js-modal'
Vue.use(VModal)

import RowEdit from './monitor1/RowEdit.vue'
import McEdit from './monitor1/McEdit.vue'

export default {
  components: {
    "window": Window,
    "row-edit": RowEdit,
    "mc-edit": McEdit
  },
  data() {
    return {
      bc: "",
      workday: null,
      dispflg: false,
      mcno: 0,
      selectedRows: [],
      qty: 0,
      msg: "",
      socket : io('172.21.229.161:8003'),
      mclist: [],
      rowitem: null,
      selectrow: []
    }
  },
  computed: {
    //共通変数
      ...mapState({
        workerid: 'workerid',
        workername: 'workername',
        managementlevel: 'managementlevel',
        serverurl : 'serverurl',
        serverurl2 : 'serverurl2',
        customerid: 'customerid',
        customername: 'customername',
        loginflg: 'loginflg',
        fllowdata: "fllowdata"  
      }),
      ...mapState("monitor1", [
      ])
  },
  watch: {   
  },
  mounted() {

    this.uodatelist();

    var self = this;

    this.socket.on('RET_MCLIST', message => {
      //  console.log("return:" + message)
        self.mclist = message.mclist || [];
    })
    this.socket.on('RET_MCLIST_ONE', message => {
      //  console.log("return:" + message)
        self.rowitem = message.mclist || [];
    })
  } ,
  methods: {
    onReturn: function() {
      this.$modal.show("setting-form");
    },
    inportopen: function(row) {
      this.selectrow = row.data;
      this.$modal.show("inport-form"); 
    },
    inporthide: function() {
      this.$modal.hide("inport-form"); 
    },
    settinghide: function(){
      this.$modal.hide("setting-form"); 
    },
    updaterow: function(row) {
      row.title="RET_MCLIST_ONE";
      this.socket.emit('SET_MCLIST', row);
    },
    updatesetting: function(val){
      val.title = "RET_MCLIST"
      this.socket.emit('EDIT_MCLIST', val);
    },
    uodatelist: function(){
      var send = {
        title: "RET_MCLIST"
      }

      this.socket.emit('GET_MCLIST', send);      
    }
  }
}
/********************************************* 
                  共通関数
******************************************** */

//月日０埋め
var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

</script>

<style scoped>
.backcl {
  background-color: #ffffff;
}

.title {
  font-family:'Impact',sans-serif;
  font-weight: bold;
}

.header { 
    max-height: 60px;
    min-height: 40px;
}

.gantt {
 height: 200px;
}

.fa-icon {
  width: auto;
  height: 1em; /* or any other relative font sizes */
  max-width: 100%;
  max-height: 100%;

}
.vcenter {
  display: inline-block;
  vertical-align: middle;
  float: none;
}

.textwhite {
  color: white;
}
</style>
