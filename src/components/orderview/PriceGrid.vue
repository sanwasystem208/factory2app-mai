<template>
    <div>
      <div style="height: 77vh; border: solid 1px #545454;">
        <c-grid
          :data="records"
          :frozen-col-count="0"
          :theme="userTheme"
          :defaultRowHeight="24"
          >
          <c-grid-check-column 
            field="check" 
            width="50">
            選択
          </c-grid-check-column>  
          <c-grid-input-column
              field="orderno"
              width= "100"
              :column-style='column'
              min-width="0"
              sort="true"
            >
            生産No
          </c-grid-input-column>
          <c-grid-input-column
              field="modelname"
              width= "350"
              :column-style='column'
              min-width="0"
              sort="true"
            >
            品番
          </c-grid-input-column>
          <c-grid-input-column
              field="qty"
              width= "95"
              :column-style='column_num'
              min-width="0"
              sort="true"
              column-type="number"
            >
            ロット数
          </c-grid-input-column>
          <c-grid-input-column
              field="sum"
              width= "85"
              :column-style='column_num'
              min-width="0"
              sort="true"
              column-type="number"
            >
            検査数
          </c-grid-input-column>
          <c-grid-input-column
              field="price"
              width= "85"
              :column-style='column_num'
              min-width="0"
              sort="true"
              column-type="number"
            >
            単価
          </c-grid-input-column>
          <c-grid-input-column
              field="totalprice"
              width= "95"
              :column-style='column_num'
              min-width="0"
              sort="true"
              column-type="number"
            >
            売上金額
          </c-grid-input-column>
        </c-grid>
      </div>
      <div class="grid-sample"></div>
    </div>  
</template>
<script>

export default {
   name: 'csvgrid',
   props: ["items"],
   components: {
   },
   watch: {
     items: function(val){
        this.records = val;
     }
   },  
   computed: {
   },
   created() {
      this.records = this.items;
   },
   mounted() {
      this.onTheme();
   },
   data() {
       return {
          records: [],
          userTheme: null
       };
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
        frozenRowsBgColor: "#2196F3",
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
    column(rec) {
      var ret = null;
      if (rec.qty <= rec.checkqty) {
        ret = { bgColor: "silver", color: "#000", textAlign: "left"};
      } else {
        ret = { bgColor: "white", color: "#000", textAlign: "left"};
      }
      return ret
    },
    column_num(rec) {
      var ret = null;
      if (rec.qty <= rec.checkqty) {
        ret = { bgColor: "silver", color: "#000", textAlign: "right"};
      } else {
        ret = { bgColor: "white", color: "#000", textAlign: "right"};
      }
      return ret
    },
   },
};

</script>

<style scoped>
h3 {
 margin: 40px 0 0;
}
ul {
 list-style-type: none;
 padding: 0;
}
li {
 display: inline-block;
 margin: 0 10px;
}
a {
 color: #42b983;
}
</style>

