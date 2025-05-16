import axios from "axios";

const tabletsystem = {
    namespaced: true,
    state: {
      tabletServer: "http://172.21.229.161:8125",
      fllowData: null,
      smtLogs: [],
      xrayLogs: [],
      massage: "",
      productionList: [
        { value: "通常", text: "通常"},
        { value: "新規", text: "新規"},
        { value: "修理", text: "修理"},
        { value: "イレギュラー", text: "イレギュラー"},
      ]
    },  
    getters: {
    },
    actions: { /////////////////// Actions ////////////////////////
        http_request( state, data) {
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
        http_post( state, data) {
          state.commit( "UPDATE_FLG" , { msg: "通信中" } );
          let promise = axios.post( data.url, data.param)  
          return promise.then((result) => {
          //    console.log("axios--" + JSON.stringify(result.data));
          state.commit( data.commit , result.data );
          state.commit( "UPDATE_FLG" , { msg: "" } );
          }).catch(error => {
          //   console.log("error " + error) 
              state.commit( "UPDATE_FLG" , { msg: "error " + error } );
          }) 
       }, 
       init_smtlogs( state, data) {
        state.commit( "INIT_SMTLOG", data );
     }, 
    },
    mutations: {/////////////////// mutations ////////////////////////
        DOWNLOAD_FLLOWDATA( state , data) {//機種更新
          //  console.log("download:" +JSON.stringify(data))
            state.fllowData = data.fllow;   
            state.massage = data.msg; 
         },
         DOWNLOAD_XRAYLOGS( state , data) {//機種更新
            console.log("xraylogs2:" +JSON.stringify(data))
            state.xrayLogs = data.retdata; 
            state.massage = data.msg;  
         },
        UPDATE_FLG( state , data) {//機種更新
            state.statusmsg = data.msg
         },
         INIT_SMTLOG( state , data) {//機種更新
          state.smtLogs = data;
       }
        }     
}
  
export default tabletsystem