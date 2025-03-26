import axios from "axios";

const monitor1 = {
    namespaced: true,
    state: {
      moniServer: "http://172.21.229.161:8126",
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

        }     
}
  
export default monitor1