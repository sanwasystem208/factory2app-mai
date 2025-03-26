<template>
    <b-container fluid  class="p-0 m-0">
      <b-row class="h-10 titles2 m-0">
        <b-col xl="9">
          <h5 class="m-2" style="color:white">実績編集 {{ daystr }}</h5>
        </b-col>
        <b-col xl="3">
          <b-button class="closebutton float-right m-2" size="sm" @click="closewindow">閉じる</b-button>
        </b-col>
    </b-row> 
    <b-row class="h-80">
        <b-col class="col-xl-5">
          <b-row>
            <b-col class="col-xl-4"><p class="ml-2 mt-3">作業日:</p></b-col>
            <b-col class="col-xl-8"><b-form-input ref="dayinput" id="dayinput" type="date" v-model="daystr" class="ml-2 mt-2" autocomplete="off"></b-form-input></b-col>
          </b-row>
          <b-row>
            <b-col class="col-xl-4"><p class="ml-2 mt-3">予定数:</p></b-col>
            <b-col class="col-xl-8"><b-form-input ref="productinput" id="productinput" type="number" v-model="plan" class="ml-2 mt-2" autocomplete="off"></b-form-input></b-col>
          </b-row>
          <b-row>
            <b-col class="col-xl-4"><p class="ml-2 mt-3">実績数:</p></b-col>
            <b-col class="col-xl-8"><b-form-input ref="productinput" id="productinput" type="number" v-model="product" class="ml-2 mt-2" autocomplete="off"></b-form-input></b-col>
          </b-row>
          <b-row>
            <b-col class="col-xl-12">
              <b-button class="bg-primary float-left m-2 pt-0 pb-0" size="lg" @click="onSave">登録</b-button>
              <b-button class="bg-danger float-left m-2 pt-0 pb-0" size="lg" @click="onDelete" v-show="delbutton">削除</b-button>
            </b-col>
          </b-row>
        </b-col>
        <b-col class="col-xl-7">
          <div class="m-2">
            <div style="height: 28vh; border: solid 1px #c0c0c0;">
                <c-grid
                :data="records"
                :frozen-col-count="0"
                :theme="userTheme"
                :defaultRowHeight="26"
                >    
                <c-grid-check-column
                  field="check"
                  width="10%"
                  @changed-value="onChangedCheck($event)"
                >
                  選択
                </c-grid-check-column>
                <c-grid-input-column
                  field="workday"
                  width= "30%"
                  :column-style='column'
                  min-width="0"
                  sort="true"
                  columnType="text"
                >
                  作業日
                </c-grid-input-column>  
                <c-grid-input-column
                  field="plan"
                  width= "27%"
                  :column-style='column_num'
                  min-width="0"
                  sort="true"
                  columnType="number"
                >
                  予定数
                </c-grid-input-column>
                <c-grid-input-column
                  field="product"
                  width= "27%"
                  :column-style='column_num'
                  min-width="0"
                  sort="true"
                  columnType="number"
                  @changed-value="onChangeValue($event)"
                >
                  実績数
                </c-grid-input-column>
            </c-grid>
            </div>
            <div class="grid-sample"></div> 
          </div> 
        </b-col>
    </b-row> 
  </b-container>
</template>

<script>

import Vue from "vue";
import axios from "axios";
  import { mapState } from 'vuex'

export default {
  props: ["items"],
  components: {
  },
  data: function() {
    return {
      daystr: null,
      records: [],
      _id: null,
      userTheme: null,
      plan: 0,
      product: 0,
      delbutton: false,
      tasklist: []
    }
  },
  computed: {
    //共通変数
    ...mapState({
      mcplanserver: 'mcplanserver'
    }),
  },    
  watch: {
    daystr: function(val) {
      const result = this.tasklist.find((v) => v.daystr === val);
      if (result != undefined) {
        this.plan = result.count;
      }   
    }
  },
  created() {
    this.onTheme();
    this.daystr = this.items.day;
    this.records = this.items.task;
    this._id = this.items.id;
    this.tasklist = this.items.list;

    const result = this.tasklist.find((v) => v.daystr === this.daystr);
    if (result != undefined) {
      this.plan = result.count;
    }

  },
  mounted() {
    //this.onGetDayPlan();
  },
  methods: {
    onChangedCheck:function(e) {
      var newLine = this.records.filter(function(item, index){
          if (item.check==true) return true;
      }); 
      if (newLine.length > 0) {
        this.delbutton = true;
      } else {
        this.delbutton = false;
      }
    },
    onDelete: function() {
      var self = this;
      var ids = [];
      var newLine = this.records.filter(function(item, index){
          if (item.check==true) return true;
      }); 
      for (var i in newLine) {
        ids.push(newLine[i]._id);
      }
      var senddata = {
        ids: ids,
        ornerid: self._id,
        ornerqty: self.items.qty,
        tasklist: ""
      } 
      let promise = axios.post( self.mcplanserver + "/delproduct", senddata)  
      return promise.then((result) => {
        self.records = result.data.tasklist;
        self.$emit("update", null);     
      }).catch(error => {
        console.log("error " + error) 
      }) 
    },
    onSave: function(){
      var self = this;
      var senddata = {
        params: {  
          _id: self._id + ":" + self.daystr,
          ornerid: self._id,
          workday: self.daystr,
          plan: self.plan,
          product: self.product,
          tasklist: self.tasklist,
          ornerqty: self.items.qty,  
          tasklist: ""
        }
      } 
      let promise = axios.get( this.mcplanserver + "/setproduct", senddata)  
        return promise.then((result) => {
        self.records = result.data.tasklist;
        self.$emit("update", null);
      }).catch(error => {
        console.log("error " + error) 
      }) 
    },
    onWorkTime(rec){
      return rec.worktime.toFixed(1)
    },
    onclose: function(){
    },
    closewindow: function() {
       this.$emit("close", null);
    },
    onTheme() {
      var ret = {
        frozenRowsBgColor: "#40b883",
        frozenRowsColor: "white",
        //  frozenRowsBorderColor: "black",
        font: "normal normal normal 12px/1 FontAwesome",
        borderColor({ col, row, grid }) {
          if (row < 9) { // ヘッダー
            return [null /*top*/, "#c0c0c0" /*right and left*/, "#c0c0c0" /*bottom*/];
          } else {
            return [null /*top*/, "#c0c0c0" /*right and left*/,"#c0c0c0" /*bottom*/];
          }
        },
      }
      this.userTheme = ret;
    },
    column(rec) {
      if (rec.plan <= rec.product) {
        var ret = { bgColor: "silver", color: "#000", textAlign: "left"};
      } else {
        var ret = { bgColor: "white", color: "#000", textAlign: "left"};
      }
      return ret
    },
    column_num(rec) {
      if (rec.plan <= rec.product) {
        var ret = { bgColor: "silver", color: "#000", textAlign: "right"};
      } else {
        var ret = { bgColor: "white", color: "#000", textAlign: "right"};
      }
      return ret
    },
  },
  beforeMount() {
  }   
};
</script>

<style scoped>

</style>
