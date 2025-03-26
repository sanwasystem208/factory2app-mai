<template>
  <b-container fluid class="m-0 p-0">
      <b-row class="p-0 m-0">
        <b-col cols="12" class="m-0 pt-1 pb-0 pl-0 pr-0 text-center">
          <h6 class="m-0"><label class="text-light text-center p-0">{{ title }}</label></h6>
        </b-col>             
      </b-row>
      <b-row class="p-0 m-0 " v-on:click="onclick">   
        <b-col cols="12" class="text-center m-0 p-0">
          <h4 class="m-0"><label class="text-gold text-light text-center m-0 p-0">{{ num }}</label></h4>
        </b-col>        
      </b-row>
  </b-container>      
</template>

<script type="text/babel">

  export default {
    props: ["title","value", "id"],
    name: 'view',
    components: {
    },
    data() {
      return {
        num: 0
      };
    },
    watch: {
       num: function(val) { 
           this.$emit("input", val);
       },
       value: function(val) {
           this.num = val;       
       }
    },
    mounted() {
       this.num = this.value;
    },
    methods: {
      onclick() {
        this.$emit("tenkey", { ref: this.id, val: this.num })
      }
    }
  };
</script>

<style scoped>

  .whitetext {
    color: white;
  }

  .waku {
    border-bottom: 1px solid darkgray;
  } 

  .waku {
    border-radius: 2px;
    margin: 1;
  }

  .text-gold {
      color: chocolate;
  }
</style>