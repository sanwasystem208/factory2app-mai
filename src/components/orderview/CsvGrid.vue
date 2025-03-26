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
            width="50"
            @changed-value="onChangedCheck($event)">
            選択
          </c-grid-check-column>  
          <c-grid-button-column
            caption="編集"
            width="80"
            @click="onClickRow"
          >
            編集
          </c-grid-button-column>
          <c-grid-input-column
              field="_id"
              width= "5%"
              :column-style='column2'
              min-width="0"
              sort="true"
            >
            生産No
          </c-grid-input-column>
          <c-grid-input-column
              field="modelid"
              width= "5%"
              :column-style='column'
              min-width="0"
              sort="true"
            >
            品番
          </c-grid-input-column>
          <c-grid-input-column
              field="modelname"
              width= "17%"
              :column-style='column'
              min-width="0"
              sort="true"
            >
            製品名
          </c-grid-input-column>
          <c-grid-input-column
              field="destination"
              width= "5%"
              :column-style='column'
              min-width="0"
              sort="true"
            >
            仕向け
          </c-grid-input-column>
          <c-grid-input-column
              field="date"
              width= "7%"
              :column-style='column'
              min-width="0"
              sort="true"
            >
            納期
          </c-grid-input-column>
          <c-grid-input-column
              :field="onFormatQty"
              width= "5%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            受注数量
          </c-grid-input-column>
          <c-grid-input-column
              :field="onFormatCheckQty"
              width= "5%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            総検査済
          </c-grid-input-column>
          <c-grid-input-column
              field="monthcheckqty"
              width= "7%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            当月検査済
          </c-grid-input-column>
          <c-grid-input-column
              :field="onPrice"
              width= "5%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            単価
          </c-grid-input-column>
          <c-grid-input-column
              :field="onTotalPrice"
              width= "6%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            受注金額
          </c-grid-input-column> 
          <c-grid-input-column
              :field="onCheckPrice"
              width= "6%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            出荷金額
          </c-grid-input-column>   
          <c-grid-input-column
              :field="onSabunPrice"
              width= "6%"
              :column-style='column_num'
              min-width="0"
              sort="true"
            >
            差分金額
          </c-grid-input-column>   
          <c-grid-input-column
              field="monthcheckprice"
              width= "6%"
              :column-style='column_num'
              column-type='number'
              min-width="0"
              sort="true"
            >
            当月金額
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
    setupdaterow: function(rec){
      const index = this.records.findIndex((v) => v._id === rec._id);
      if (rec.endplan || rec.disable) {
        this.records.splice(index, 1);
      } else {
        this.records.splice(index, 1, rec);
      }
      //this.grid.invalidate();
    },
    onClickRow(row){
      this.$emit("click", row);
    },
    onSabunPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.qty != undefined && rec.checkqty != undefined) {
        price = (rec.checkqty * rec.price)-(rec.qty * rec.price);
      }
      return price.toLocaleString();
    },
    onPrice(rec){
      var price = 0;
      if (rec.price != undefined) {
        price = rec.price;
      }
      return price.toLocaleString();
    },
    onTotalPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.qty != undefined) {
        price = rec.qty * rec.price;
      }
      return price.toLocaleString();
    },
    onFormatQty(rec){
      return rec.qty.toLocaleString() || 0;
    },
    onFormatCheckQty(rec){
      var qty = 0;
      if (rec.checkqty != undefined) {
        qty = rec.checkqty;
      }
      return qty.toLocaleString();
    },
    onFormatMonthQty(rec){
      var qty = 0;
      if (rec.monthcheckqty != undefined) {
        qty = rec.monthcheckqty;
      }
      return qty.toLocaleString();
    },
    onFormatShipmentQty(rec){
      var qty = 0;
      if (rec.shipmentqty != undefined) {
        qty = rec.shipmentqty;
      }
      return qty.toLocaleString();
    },
    onCheckPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.checkqty != undefined) {
        price = rec.checkqty * rec.price;
      }
      return price.toLocaleString();
    },
    onMonthPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.monthcheckqty != undefined) {
        price = rec.monthcheckqty * rec.price;
      }
      return price.toLocaleString();
    },
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
    column2(rec) {
      var ret = null;
      if (rec.qty <= rec.checkqty) {
        ret = { bgColor: "silver", color: "#000", textAlign: "left"};
      } else {
        ret = { bgColor: "white", color: "#000", textAlign: "left"};
      }
      if (rec.makeinstruct) {
        ret = { bgColor: "yellow", color: "#000", textAlign: "left"};
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
    onChangedCheck(event) {
      this.$emit("check", event)
      // event からチェックされた行のデータや状態を取得
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

