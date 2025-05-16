,<template>
   <b-container fluid class="p-0 m-0">
    <!-- User Interface controls -->
    <b-row class="h-10 titles2 m-0">
        <b-col xl="9">
          <h5 class="m-2" style="color:white">注文編集</h5>
        </b-col>
        <b-col xl="3">
          <b-button class="closebutton float-right m-2" size="sm" @click="closewindow">閉じる</b-button>
        </b-col>
    </b-row>
    <b-row class="h-80 ml-0 mr-0 mt-3 p-1">
      <b-col xl="12">
        <csv-grid :spec="mcdata" :filterflg="filterflg" :keyword="keyword" class="m-1" @select="onAddOrder"></csv-grid>
      </b-col>  
    </b-row>
    <b-row class="h-10 ml-0 mr-0 p-1">
      <b-col xl="4">
          <label class="mr-sm-2" for="inline-form-custom-select-pref">フィルター種類：</label>
          <b-form-select
            class="mb-2 mr-sm-2 mb-sm-0"
            v-model="filterflg"
            :options="filterlist"
            id="inline-form-custom-select-pref"
          > 
         </b-form-select>
      </b-col>
      <b-col xl="4">  
         <label class="mr-sm-2" for="inline-form-custom-select-pref">キーワード：</label>
         <b-form-input v-model="temp" placeholder="" :state="null" @keydown.enter.native="updateField"></b-form-input>
      </b-col>  
      <b-col xl="4"> 
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

import Vue from 'vue'
import axios from "axios";
import { mapState } from 'vuex'
import CsvGrid  from './CsvGrid2.vue'

  export default {
    name: 'editorder',
    props: ["mcdata"],
    components: {
      "csv-grid": CsvGrid,
    },  
    data() {
      return {
        filterlist: [
        { value: 0, text: "計画未登録のみ"},
        { value: 1, text: "計画登録済含む"},
        ],
        filterflg: 0,
        keyword: null,
        temp: null
      }
    },
    watch: {
    },
    created() {
    },
    mounted() { 
    },
    computed: {
        //共通変数
      ...mapState({
      }),
    },
    methods: {
      onAddOrder: function(e){
        this.$emit("select", e);
      },
      closewindow: function() {
         this.$emit("close", null);
      },
      updateField: function(e){
        if (e.which === 13) {
          this.keyword = this.temp;
        }
      }
    }
  } 

</script>

<style scoped>
 .titles2 {
    background-color: mediumseagreen;
 }

 .closebutton {
    background-color: mediumseagreen;
    border: 1px solid #ffffff;
 }

 .title {
    background-color: chocolate;
 }
 .labels {
    width: 200px;
}
</style>