<template>
  <b-container fluid class="p-0">
    <b-row class="p-0">
      <b-col xl="12" class="p-1 m-1">
        <h5 class="textwhite">{{ title }}</h5>
      </b-col>
    </b-row>
  </b-container>       
</template>

<script>
import Vue from "vue";
import { mapState } from 'vuex'

export default Vue.extend({
    props: ['name'],
    computed: {
    },  
    data(){
        return {
          title: null
          }
    },
    watch: {
    },
    mounted() {
    //  console.log("start:" + this.items);
      this.title = this.params.displayName;
    },
    methods:{

        /**
         * selectのchageイベントで選択値をグリッドに反映
         */
      /*  refresh(params) {
            if (params !== this.work) {
              this.work = params;
            }
            return true;
        },*/
        onChange(){
           // this.params.setValue(this.value);
        }
    },
    /**
     * 選択値の取得とリストの作成
     */
    beforeMount(){
     //   this.title = this.params.title;
    }
})
</script>

<style scoped>
  .body {
     height: 120px; 
  }

  .nowork {
     background-color: silver
  }

  .work1001 {
     background-color: dimgray;
     color: #ffffff;
     width: 40px;
  }

  .work1002 {
     background-color: deepskyblue;
     color: #ffffff;
     width: 40px;
  }

  .work1003 {
     background-color: green;
     color: #ffffff;
     width: 40px;
  }

  .work1004 {
     background-color: orange;
     color: #ffffff;
     width: 40px;
  }

  .work1005 {
     background-color: brown;
     color: #ffffff;
     width: 40px;
  }

  .work1006 {
     background-color: magenta;
     color: #ffffff;
     width: 40px;
  }

  .textwhite {
     color: #ffffff;
  }

  .work1000 {
     background-color:#ffffff;
     color: #ff0000;
     width: 40px; 
  }
</style>