,<template>
   <b-container fluid class="bg-info p-0 m-0">
    <b-row class="h-30 bg-primary m-0 text-center">
        <b-col xl="12">
          <h5 class="m-2 text-white">実行中</h5>
        </b-col>
    </b-row>
    <b-row class="h-30 bg-primary m-0 text-center">
        <b-col xl="12">
          <b-button variant="primary" disabled>
            <b-spinner small type="grow"></b-spinner>
              Loading...
            </b-button>
        </b-col>
    </b-row>
   </b-container>
</template>

<script>
  export default {
    name: 'progressview',
    props: ["items"],
    components: {
    },  
    data() {
      return {
        msg: "",
      }
    },
    watch: {
    },
    created() {
    },
    mounted() {   
    },
    computed: {
    },
    methods: {
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