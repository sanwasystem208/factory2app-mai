<template>
  <div id="app" class="h-90">
        <b-navbar toggleable="md" type="dark" variant="dark">
            <b-collapse is-nav id="nav_collapse">
                <b-nav is-nav-bar>
                    <b-nav-item to="/">HOME</b-nav-item>
                    <b-nav-item to="/part">部品一覧</b-nav-item>   
                    <b-nav-item to="/order">注文表示</b-nav-item>  
                    <b-nav-item to="/price">売上表示</b-nav-item>                  
                    <b-nav-item to="/reportview">検査日報</b-nav-item>  
                    <b-nav-item to="/dryingview">除湿日報</b-nav-item>                    
                    <b-nav-item to="/mcscheduler">機械計画</b-nav-item>  
                    <b-nav-item to="/holidayview">休日設定</b-nav-item> 
                    <b-nav-item to="/buhinview">部品表</b-nav-item> 
                    <b-nav-item to="/testview">TEST</b-nav-item>                     
                </b-nav>
                <b-nav is-nav-bar class="ml-auto">
                    <b-nav-form>
                        <b-form-select v-model="selected" :options="customers" size="md" class="pt-0 pb-0 mr-3 bg-dark text-light"/>
                        <label class="mr-2 text-light">Ver: {{ version }}</label>
                        <label class="mr-2 text-light">作業者ID:</label>
                        <label class="mr-2 text-light">{{ workername }}</label>
                        <b-button size="sm" class="my-2 my-sm-0" @click="login" variant="success" v-if="loginflg === false">ログイン</b-button>
                        <b-button size="sm" class="my-2 my-sm-0" @click="logout" variant="warning" v-else>ログアウト</b-button>  
                    </b-nav-form>
                </b-nav>
            </b-collapse>
        </b-navbar>
        <router-view ></router-view>
  </div>
</template>
<script>

/*###################
JIGU用システム
###################*/

import Vue from 'vue'
import axios from "axios";
import Bootstrap from 'bootstrap';
import BootstrapVue from 'bootstrap-vue'

import { mapState } from 'vuex'

Vue.use(BootstrapVue);

import ToggleSwitch from 'vuejs-toggle-switch'
Vue.use(ToggleSwitch)

// 追加
//import Vuesax from 'vuesax'
// 追加
//import 'vuesax/dist/vuesax.css'
//import 'material-icons/iconfont/material-icons.css'
// 追加
/*
Vue.use(Vuesax, {
  theme:{
    colors:{
      primary: 'rgb(31,116,255)',
      success: 'rgb(23, 201, 100)',
      danger: 'rgb(242, 19, 93)',
      warning: 'rgb(255, 130, 0)',
      dark: 'rgb(36, 33, 69)'
    }
  }
})*/
/*
--primary: 31,116,255;
    --danger: 255,71,87;
    --success: 70,201,58;
    --dark: 30,30,30;
    --warning: 255,186,0;
*/
import { library } from '@fortawesome/fontawesome-svg-core'
import { faList,faPrint,faIndustry,faStopwatch,faUsers,faStar, faForward, faBackward  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faList,faPrint,faIndustry,faStopwatch,faUsers,faStar, faForward, faBackward )

Vue.component('font-awesome-icon', FontAwesomeIcon)

export default {
  name: 'app',
  data () {
    return {
      selected: this.customerid,
      version: require('../package.json').version,
    }
  },
  computed: {  
      ...mapState({
        workerid: 'workerid',
        workername: 'workername',
        managementlevel: 'managementlevel',
        serverurl : 'serverurl',
        serverurl2 : 'serverurl2',
        newserverurl: 'newserverurl',
        customerid: 'customerid',
        customername: 'customername',
        loginflg: 'loginflg',
        customer: 'customer',
        customers: 'customers'
      })
  },
  watch: {
    selected: function (val) {
    //  this.$store.state.customerid = val;
    　console.log(JSON.stringify(val))
     // this.$store.dispatch('customer_updata',{ customerid: val, customername: "" })
      this.customer_download(val)
    },
    customer: function(val) {
     //  this.$router.push({ name: 'Home' })
       console.log("customer:" + JSON.stringify(val))
    }
  },
  methods: {
     login() {
        // 入力ダイアログを表示 ＋ 入力内容を user に代入
        var user = window.prompt("作業者IDを入力してください", "");
        if(user != "" && user != null){
          this.$store.dispatch('fetchDataAsync',{ workerid: user })
        }
        else{
          window.alert('キャンセルされました');
        }
     },
     logout() {
       this.$router.push('/home')
      // this.$store.commit('logout',null);
       this.$store.dispatch('logout', null );
     },
     customer_download (id) {
        var senddata = {
            param: {
              params: {            
                customerid: id,
                customername: "",
                customer: "", 
                process: "",
                divisiontitle: ""
              }
            },  

            commit: 'DOWNLOAD_CUSTOMERINFO',
            url: this.newserverurl + '/getcustomer'
          }
        this.$store.dispatch('http_request', senddata );
     },
  },
  mounted() { 
   // this.$router.push("/monitor1")
   // this.selected = 1001;
   // this.customer_download(this.selected)
  }   
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
 /* text-align: center;*/
  color: #2c3e50;
  margin-top: 3px;
  height: 92vh;
  margin: 0;
  padding: 0;
}

.grid-cell {
  font-size: 12px;
  padding: 0px;
  border-right: 1px solid lightgrey !important;
  text-align: left;
}

.grid-cell-dark {
  font-size: 12px;
  padding: 0px;
  border-right: 1px solid rgb(83, 83, 83) !important;
}

.grid-cell-h {
  font-size: 12px;
  padding: 0px;
  border-right: 1px solid lightgrey !important;
}

.grid-cell-num {
  font-size: 12px;
  text-align: right;
  padding: 0px;
   border-right: 1px solid lightgrey !important;
}

.grid-cell-num2 {
  font-size: 12px;
  text-align: right;
  padding: 0px;
   border-right: 3px solid lightgrey !important;
}

.table-header {
  padding-left: 0px !important;
  padding-right: 0px !important;
  width: 100%;
  text-align: left !important;
  border-right: 1px solid rgb(83, 83, 83) !important;
}

.table-header-h {
  padding-left: 0px !important;
  padding-right: 0px !important;
  width: 100%;
  text-align: left !important;
  border-right: 1px solid lightgrey !important;
}

.ag-header-cell-label {
  text-align: left !important;
}

.process-header-cells {
  font-size: 11px;
  padding: 0 0 0 0;
}

.titles { 
    background-color:#212529;
}

.titles2 {
    background-color: mediumseagreen;
}

.closebutton {
    background-color: mediumseagreen !important;
    border: 1px solid #ffffff !important;
}

.backyellow {
    background-color: yellow
}

.badgewidth70 {
    width: 70px;
}

.badgewidth80 {
    width: 80px;
}

.darkheader {
    background-color: #808080
}

.lightheader {
    background-color: #cacaca
}

.label {
  border-radius: 3px;
  text-align: left;
/* 上 | 右 | 下 | 左 */
  padding: 0px 7px 0px 7px;
  margin:  0px 5px 0px 5px;
  background-color: #07835a;
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-family: monospace;
  border : solid 1px rgb(255, 255, 255) ; 
  border-radius: 5px 0px 0px 5px;
}

.label2 {
  border-radius: 3px;
  text-align: left;
/* 上 | 右 | 下 | 左 */
  padding: 0px 2px 0px 2px;
  margin:  0px 0px 0px 0px;
  background-color: #07835a;
  color: rgb(255, 255, 255);
  font-size: 20px;
  font-family: monospace;
  border : solid 1px rgb(255, 251, 251) ; 
  filter: drop-shadow(0px 0px 0px rgba(201, 201, 201, 0.6));
  width: 100%;
}

.info {
  border-radius: 3px;
  text-align: left;
/* 上 | 右 | 下 | 左 */
 /* margin:  2px 10px 2px 2px;
  padding: 0px 5px 0px 5px;*/
  font-size: 28px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  border : solid 1px rgb(165, 165, 165) ; 
  width: 100%;
}

.text-gold {
  color: chocolate;
}

.nav-link {
  color: silver;
}


</style>
