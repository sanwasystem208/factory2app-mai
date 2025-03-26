/*_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * workmonitor 
 * Mitsuo Andou
 ver 1.0  2020-10-09 08:00 新規

_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/*/

import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

import axios from "axios";

import checkreport from './checkreport.js'
import monitor1 from './monitor1.js'

//import createPersistedState from "vuex-persistedstate";
import VueLocalStorage from 'vue-localstorage'
Vue.use(VueLocalStorage)

const state = {
  version: "1.0", 
  partserver:  "http://172.21.229.161:8302",
  homeserver:  "http://172.21.229.250:8105",
  reportserver:  "http://172.21.229.161:8005", 
  orderserver:  "http://172.21.229.161:8304", 
  dryingserver:  "http://172.21.229.161:8006",
  mcplanserver:  "http://172.21.229.161:8306",  
  holidayserver:  "http://172.21.229.161:8307",  
  priceserver:  "http://172.21.229.161:8308",  
 /* serverurl : "http://172.21.229.161:8100",      //DoubleCheck
  serverurl2 : "http://172.21.229.161:8101",     //AssyCheck
  newserverurl : "http://172.21.229.161:8100", */  //AssyCheck
  customers: [
    { value: 1002, text: 'JST' }
  ],
  customerid: 1001,//顧客ID
  customername: "JIGU",                        //顧客名
  workerid: 0,                                 //作業者ID
  workername: "",                              //作業者名
  managementlevel: -1,                         //管理レベル
  loginflg: false ,                            //ログインフラグ
  layout: "",
  ganttdata: { data:[], links: []},
  fllowdata: [],
  destinations: [],
  group: null,
  statusmsg: null,
  monthid: null,
  basicprocess: [],
  customer: {
    customerid: 0,
    customername: null,
    group: "",
    groupid: 0,
    monthid: null
  },
  title: [],
  types: [//内容
    { value: 0, text: '' },
    { value: 1, text: 'EHT(No1)' },
    { value: 2, text: 'XHT(No1)' },
    { value: 3, text: 'EHT(テーピング)' },
    { value: 4, text: 'XHT(テーピング)' },    
    { value: 5, text: 'PID' },
    { value: 6, text: 'TR' },    
    { value: 7, text: 'TV2' },
    { value: 8, text: 'PH' }, 
    { value: 9, text: 'XH-2' }, 
    { value: 10, text: 'TZ' },          
  ],
  status: [//内容
    { value: 0, text: '計画無', color: "secondary"  },
    { value: 1, text: '稼動OK', color: "primary" },
    { value: 2, text: '調整待', color: "danger"  },
    { value: 3, text: '組替待', color: "warning"  },
    { value: 4, text: '検査待', color: "success"  },
    { value: 5, text: '材料待', color: "info"  },   
    { value: 6, text: '指示待', color: "info"  },
    { value: 7, text: '人待ち', color: "info"  },
    { value: 8, text: 'ポスト待', color: "info"  },
    { value: 9, text: 'ﾊｳｼﾞﾝｸﾞ待', color: "info"  },      
    { value: 10, text: '稼働中', color: "primary"  },  
  ],
　importance: [//内容
    { value: 0, text: '通常' , color: "#7da7df"},
    { value: 1, text: '急' , color: "#a2ee64"},
    { value: 2, text: '特急' , color: "#a2ee64"},
    { value: 3, text: '緊急' , color: "#f87e7e"},
    { value: 4, text: '超特急' , color: "#f87e7e"} 
  ],
  machines: [
    { value: 0, text: 'EHT-11' },
    { value: 1, text: 'EHT-12' },
    { value: 2, text: 'EHT-14' },
    { value: 3, text: 'EHT-15' },
    { value: 4, text: 'EHT-18' },
    { value: 5, text: 'EHT-19' },
    { value: 6, text: 'EHT-20' },
    { value: 7, text: 'EHT-55' },
    { value: 8, text: 'EHT-56' },
    { value: 8, text: 'EHT-60' },
    { value: 9, text: 'EHT-61' },
    { value: 10, text: 'EHT-64' },
    { value: 11, text: 'EHT-66' },
    { value: 12, text: 'EHT-68' },
    { value: 13, text: 'TR-01' },
    { value: 14, text: 'TR-02' },
    { value: 15, text: 'XHT-01' },
    { value: 16, text: 'XHT-02' },
    { value: 17, text: 'XHT-04' },
    { value: 18, text: 'XH-2-01' }
  ],
  　times: [//内容
    { value: 0, text: '8:30' },
    { value: 1, text: '17:30' },
    { value: 2, text: '0:30' }
  ],
  　ranklist: [//内容
    { value: 1, text: "1" },
    { value: 2, text: "2" },
    { value: 3, text: "3" }
  ],
  shifttime: [
    { shift: "A勤", start: "08:30", last: "17:30", rangestart: "08:00", rangelast: "18:00"},
    { shift: "B勤", start: "17:30", last: "00:30", rangestart: "16:00", rangelast: "02:00"},
    { shift: "C勤", start: "00:30", last: "08:30", rangestart: "23:00", rangelast: "09:00"}, 
  ],
  modelist: [
    { value: 0, label: "部品繰越"},
    { value: 1, label: "部品入庫"},
    { value: 2, label: "部品消費"},
    { value: 3, label: "部品返却"},
    { value: 4, label: "部品吸湿"},
    { value: 5, label: "部品棚卸"},  
  ]

 /*
超特急
緊急
特急
急



 稼動OK
調整待
組替待
検査待
材料待
計画無
指示待
人待ち
ポスト待
ハウジング待
 */
}
/*const actions = {}
const getters = {}
const mutations = {}*/

export default new Vuex.Store({
  modules: {
    monitor1,
    checkreport
  },
  state,
  localStorage: {
    customerid: {
      type: Number,
      default: 0
    }
  },
  //plugins: [createPersistedState()],
  getters : {
    getServer (state) {       //DoubleCheck_URL
      return state.serverurl;
    },
    getServer2 (state) {      //AssyCheck_URL
      return state.serverurl2;
    },
    getWorkername (state) {   //現在の作業者名取得
      return state.workername ;
    },
    getWorkerid (state) {     //現在の作業者ID取得
      return state.workerid ;
    },
    getLoginFlg (state) {      //現在のログインフラグ
      return state.loginflg ;
    },
    getresourceprocess (state) {
      var dat = [];
      for (var i in state.basicprocess) {
        dat.push({ key: state.basicprocess[i].processno, label: state.basicprocess[i].processname, color: state.basicprocess[i].color})
      } 
      return dat; 
    },
    getoptionprocess (state) {
      var dat = [{ value: 0, text: "全工程"}];
      for (var i in state.basicprocess) {
        dat.push({ value: state.basicprocess[i].processno, text: state.basicprocess[i].processname})
      } 
      return dat; 
    },
    getfezu: (state) => (value) => {
      return state.fezu.find(fezu => fezu.value === value)
    },
    getpaint: (state) => (value) => {
      return state.paint.find(paint => paint.value === value)
    },
    getpartsupply: (state) => (value) => {
      return state.partsupply.find(partsupply => partsupply.value === value)
    },
    getpart: (state) => (value) => {
      return state.part.find(part => part.value === value)
    }, 
    getdesign: (state) => (value) => {
      return state.design.find(design => design.value === value)
    },
    getdraw: (state) => (value) => {
      return state.draw.find(draw => draw.value === value)
    }
  },
  actions : { /////////////////// Actions ////////////////////////
      http_request( state, data) {
        console.log("http_request:" + JSON.stringify(data))
        state.commit( "UPDATE_FLG" , { msg: "通信中" } );
        let promise = axios.get( data.url, data.param)  
        return promise.then((result) => {
        //    console.log("axios--" + JSON.stringify(result.data));
        state.commit( data.commit , result.data );
        state.commit( "UPDATE_FLG" , { msg: "" } );
        }).catch(error => {
        //   console.log("error " + error) 
            state.commit( "UPDATE_FLG" , { msg: "error " + error } );
        })  
    },
    async fetchDataAsync ({ commit },pram) {//Ajax 作業者情報取得
      let promise = axios.get(this.state.homeserver + '/getworkerlavel?workerid='+pram.workerid)
            
      return promise.then((result) => {
      //  console.log("1--:"+JSON.stringify(result.data));
        commit('WORKER_UPDATE', result.data)
      }).catch(error => {
     //   console.log("error " + error) 
      })
    },
    async layoutDataAsync ({ commit }) {//Ajax 作業者情報取得

      let promise = axios.get(this.state.serverurl3 + '/getiplist3')
            
      return promise.then((result) => {
        commit('GRID_UPDATE', result.data)
      }).catch(error => {
        console.log("error " + error) 
      })
    },
    customer_updata({ commit }, msg) {
      commit('CUSTOMER_UPDATE', msg)
    },
    destination_list({ commit }) {
      let promise = axios.get(this.state.newserverurl + '/getdestination')     
      return promise.then((result) => {
          commit('DESTINATION_LIST', result.data)
      }).catch(error => {
       //   console.log("error " + error) 
      })
    },
    destination_insert({ commit }, msg) {
      let promise = axios.get(this.state.newserverurl + '/setdestination?str='+msg)     
      return promise.then((result) => {
          commit('DESTINATION_LIST', result.data)
      }).catch(error => {
       //   console.log("error " + error) 
      })
    },
    logout({ commit }, msg) {
      commit('LOGOUT', msg)
    },
  },
  mutations : {/////////////////// mutations ////////////////////////
    DESTINATION_LIST (state, data) {//Ajax 作業者情報更新
      // console.log("2--: " + JSON.stringify(data) );
       if (data.length > 0) {
         state.destinations = data;
       }
     },
    WORKER_UPDATE (state, data) {//Ajax 作業者情報更新
     // console.log("2--: " + JSON.stringify(data) );
      if (data.length > 0) {
        state.workerid = data[0].workerid;
        state.workername = data[0].workername;
        state.managementlevel = data[0].managementlevel;
        state.loginflg = true; 
      } else {
        state.workerid = 0;
        state.workername = "";
        state.managementlevel = -1;
        state.loginflg = false;   
     // console.log("+++" + data[0])
      }
    },
    LOGOUT(state, data) {//ログアウト
        state.workerid = 0;
        state.workername = "";
        state.managementlevel = -1;
        state.loginflg = false; 
    },
    GRID_UPDATE(state, data) {
    //  console.log("1--:"+JSON.stringify(data));
      state.layout = data;

    },
    DISPLAY_UPDATE(state, data) {

      var newData = state.layout.filter(function(item, index){
        if (item.ipaddress != data.ipaddress) return true;
      });
      
      var changeData = state.layout.filter(function(item, index){
        if (item.ipaddress == data.ipaddress) return true;
      });

      if (changeData[0] != undefined) {
        changeData[0][data.field] = data.value;   
        newData.push(changeData[0]);
      }
      // [注意]
      // 最後にchangeArray[0]ではなくchangeArrayでpushすると
      // 更新されたデータだけ配列型で入ってしまう。
      
      state.layout = newData;

    },
    RET_GANTT(state, data) {
     // console.log("1--:"+JSON.stringify(data.retdata));
      state.ganttdata = data.retdata;

    },
    FLLOWLIST_UPDATE(state, data) {
      // console.log("1--:"+JSON.stringify(data));
       state.fllowdata = data;
 
     },
     CUSTOMER_UPDATE(state, data) {
      // console.log("1--:"+JSON.stringify(data));
       state.customerid = data.customerid;
       state.customername = data.customername;
     //  this.$localStorage.set( "customer", data);
     },
     UPDATE_FLG( state , data) {//機種更新
       state.statusmsg = data.msg
     },
     DOWNLOAD_CUSTOMERINFO( state , data) {//機種更新
      console.log("DOWNLOAD_CUSTOMERINFO:" + JSON.stringify(data))
      localStorage.setItem("customerid",data.customer.customerid);
      state.customer = data.customer;
      state.customerid = data.customer.customerid;
      state.customername = data.customer.customername;     
      state.basicprocess = data.process;
      state.group = data.group;
      state.groupid = data.groupid; 
      state.monthid = data.customer.month;  
      state.title = data.divisiontitle;  
      console.log("DOWNLOAD_CUSTOMERINFO:" + state.monthid)       
    },
     DOWNLOAD_BASICPROCESS( state , data) {//機種更新
       console.log("DOWNLOAD_BASICPROCESS:"+JSON.stringify(data));
       state.basicprocess = data   
     },
  }
})