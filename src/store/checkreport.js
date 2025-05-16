import axios from "axios";

const checkreport = {
    namespaced: true,
    state: {
      checkServer: "http://172.21.229.161:8303",
      fllowData: null,
      smtLogs: [],
      checkLogs: [],
      massage: "",
      productionlist:[
        { value: 0, text: "中間" },
        { value: 1, text: "出検" },
      ],
      nglists: [     
        { text: 'キズ', value: 0 },
        { text: 'ワレ', value: 1 },
        { text: '切断不良', value: 2 },
        { text: '元不良', value: 3 },     
        { text: 'ピンキズ', value: 4 },
        { text: 'カジリ', value: 5 },
        { text: 'よごれ', value: 6 },
        { text: 'その他', value: 7 }
      ],
      ngjudgment: [     
        { text: 'ＯＫ', value: 0 },
        { text: 'ＮＧ', value: 1 }
      ],
      ngmethods: [     
        { text: '選別', value: 0 },
        { text: '保留', value: 1 }
      ],
      lotinfolist: [     
        { text: '未完了', value: 0 },
        { text: '完了', value: 1 },
        { text: '一時中止', value: 2 }
      ],
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
            state.smtLogs = data.smtlog;
            state.massage = data.msg; 
         },
         DOWNLOAD_XRAYLOGS( state , data) {//機種更新
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
  
export default checkreport