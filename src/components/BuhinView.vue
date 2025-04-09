<template>
  <b-container fluid>
    <b-row>
      <b-col class="col-12 p-2">
        <b-form inline>
          <label class="mr-sm-2 mt-2" for="inline-form-custom-select-pref">抽出：</label>
          <b-form-input ref="filter-input" id="filter-input" type="text" v-model="filterstr" class="mt-1 mr-1 inputwidth" autocomplete="off" @keydown.enter="onListRefrash()"></b-form-input>
        </b-form>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="col-12 p-2">
        <div style="height: 85vh; border: solid 1px #545454;">
          <c-grid :data="records" :frozen-col-count="0" :theme="userTheme" :defaultRowHeight="24">
            <template v-slot:layout-header>
              <c-grid-layout-row>
                <c-grid-header width="10%">生産No</c-grid-header>
                <c-grid-header width="30%">機種名</c-grid-header>
                <c-grid-header width="10%">部品id</c-grid-header>
                <c-grid-header width="30%">部品名</c-grid-header>
                <c-grid-header width="10%">数量</c-grid-header>
              </c-grid-layout-row>
            </template>
            <template v-slot:layout-body>
              <c-grid-layout-row>
                <c-grid-column field="_id" rowspan="3"/>
                <c-grid-column field="modelname" rowspan="3"/>
                <c-grid-column :field="getRow0_0"/>
                <c-grid-column :field="getRow0_1"/>
                <c-grid-column :field="getRow0_2"/>
              </c-grid-layout-row>
              <c-grid-layout-row>
                <c-grid-column :field="getRow1_0"/>
                <c-grid-column :field="getRow1_1"/>
                <c-grid-column :field="getRow1_2"/>
              </c-grid-layout-row>
              <c-grid-layout-row>
                <c-grid-column :field="getRow2_0"/>
                <c-grid-column :field="getRow2_1"/>
                <c-grid-column :field="getRow2_2"/>
              </c-grid-layout-row>
            </template>
          </c-grid>
        </div>
      </b-col>
    </b-row>
  </b-container>  
</template>
<script>
import { mapState } from "vuex"
import axios from "axios";
export default {
  name: "csvgrid",
  props: ["items"],
  data() {
    return {
      records: [],
      userTheme: null
    };
  },
  components: {
  },
  watch: {
  },  
  computed: {
    //共通変数
    ...mapState({
      parttableserver: "parttableserver",
    }),
  },
  created() {
    this.onTheme();
  },
  mounted() {
    var url = "/getparttable";
    let promise = axios.post(this.parttableserver + url)  
    return promise.then((result) => {
      result.data.forEach(item => {
        var data = {
          _id:       item._id,
          modelname: item.modelname,
          partlist: item.partlist.slice(0, 3).map(part => ({
            partid: part.partid,
            partname: part.partname,
            qty: part.qty,
          })),
        }
        while (data.partlist.length < 3) {
          data.partlist.push({ partid: "", partname: "", qty: "" });
        }
        this.records.push(data)
      });
      console.log("result",result)
    })
  },
  methods: {
    getRow0_0(row){
      return row.partlist[0].partid
    },
    getRow1_0(row){
      return row.partlist[1].partid
    },
    getRow2_0(row){
      return row.partlist[2].partid
    },
    getRow0_1(row){
      return row.partlist[0].partname
    },
    getRow0_2(row){
      return row.partlist[0].qty
    },
    getRow1_1(row){
      return row.partlist[1].partname
    },
    getRow1_2(row){
      return row.partlist[1].qty
    },
    getRow2_1(row){
      return row.partlist[2].partname
    },
    getRow2_2(row){
      return row.partlist[2].qty
    },
    onTheme() {
      var ret = {
        font: "normal normal normal 16px/1 FontAwesome",
      /* borderColor: "#35495e",*/
        checkbox: {
          checkBgColor: "#35495e",
          borderColor: "#35495e",
        },  
        color: "#000",
        frozenRowsColor: "#fff",
        frozenRowsBorderColor: "white",
        frozenRowsBgColor: "#6c5dc4",
        button: {
          color: "#FDD",
          bgColor: "#20c997",
          fontSize: "9px"
        },
        borderColor({ col, row, grid }) {
          if (row < 1) {
              return [null /*top*/, "white" /*right and left*/, null /*bottom*/];
          } else {
              return [null /*top*/, "#616161" /*right and left*/,"#616161" /*bottom*/];
          }
        },
      }
      this.userTheme = ret; 
    }, 
  }
};

</script>

<style scoped>
.a{
  color: #6c5dc4;
}
</style>

