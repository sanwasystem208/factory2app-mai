<template>
    <b-container fluid class="p-0 m-0">
      <!-- User Interface controls -->
      <b-row class="h-10 titles2 m-0">
            <b-col xl="10">
              <h5 class="m-2" style="color:white">機種一覧</h5>
            </b-col>
            <b-col xl="2">
              <b-button class="closebutton float-right m-2" size="sm" @click="onclose">閉じる</b-button>
            </b-col>
      </b-row>
      <b-row>
        <b-col xl="12">
              <div style="height: 38vh; border: solid 1px #545454;">
                  <c-grid
                  :data="ret.mclist"
                  :frozen-col-count="0"
                  :theme="userTheme"
                  :defaultRowHeight="24"
                  :key="updatekey"
                  >
                <c-grid-input-column
                    field="_id"
                    width= "20%"
                    :column-style='column'
                    min-width="0"
                    sort="true"
                  >
                 番号
                </c-grid-input-column>
                <c-grid-input-column
                    field="model_name"
                    width= "30%"
                    :column-style='column_num'
                    min-width="0"
                    sort="true"
                  >
                  型番
                </c-grid-input-column>
                <c-grid-input-column
                    field="typename"
                    width= "20%"
                    :column-style='column'
                    min-width="0"
                    sort="true"
                  >
                  種類
                  </c-grid-input-column>
              </c-grid>
              </div>
              <div class="grid-sample"></div>  
        </b-col>
      </b-row>
</b-container>
</template>
<script>

import Vue from "vue";

import Bootstrap from 'bootstrap';
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { mapState } from 'vuex';

export default {
  name: 'ModelView',
  props: [],
  data() {
    return {
        modellist: [],
        userTheme: null,
    }
  },
  watch: {
  },
  methods: {
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
        frozenRowsBgColor: "gray",
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
    onModelView: function() {
        this.modellist = [];
        var url = "/getmodelview";
        var senddata = {
          params: {
            retdata: null
          } 
        }    
        let promise = axios.get( this.orderserver + url, senddata)  
        return promise.then(this.onOrder).catch(error => {
        console.log("error " + error) 
        })  
    }, 
    onReturn: function() {
    },
    onclose() {
      this.$emit('close');
    }

  },
  computed: {
     ...mapState({
        orderserver: "orderserver"
     })
  },
  components: {
  },
  created() {
    this.onTheme();
  },
  mounted() {
    this.onModelView();
  },

};

</script>

<style scoped>
 .titles2 {
    background-color: mediumseagreen;
 }

 .closebutton {
    background-color: mediumseagreen;
    border: 1px solid #ffffff;
 }
 
.grid-cell {
  font-size: 16px;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 1100px;
  margin: 0px auto;
  padding: 3px 3px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 5px 0;
}

.modal-default-button {
  float: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.inputwidth {
  width: 60x;
}
</style>

<style module> 

  .inclass {
    width: 120px;
    font-size: 14px;
    padding: 3px 0 3px 0;
    border: 1px solid #bebebe;	/* 境界線を実線で指定 */
    border-radius: 3px;
    text-align: center;
  }

</style>