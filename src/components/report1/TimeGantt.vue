<template>
  <div class="container">
    <g-gantt-chart
        :chart-start="myChartStart"
        :chart-end="myChartEnd"
        :grid="grid"
      >
        <g-gantt-row
          v-for="row in rows"
          :key="row.label"
          :label="row.label"
          :bars="row.bars"
          bar-start="myStart"
          bar-end="myEnd"
        />
      </g-gantt-chart>
  </div>
</template>
 
<script>

import Vue from 'vue'
import {GGanttChart, GGanttRow} from 'vue-ganttastic'
Vue.component('g-gantt-chart',GGanttChart)
Vue.component('g-gantt-row',GGanttRow)

export default { 
  components: {
  },
  watch: {
  },
  data() {
    return {
      grid: true,
      myChartStart: null,
      myChartEnd: null,
      rows: [
        {
          label: "My row #1",
          bars: [
            {
              myStart: "2020-03-01 12:10",
              myEnd: "2020-03-01 16:35",
              ganttBarConfig: {
                background: "#bd3128",
                borderRadius: "3px"
              } 
            }
          ],
        }
     ]
    }
  },
  methods: {
     update_data: function(val){
        this.myChartStart = val.start;
        this.myChartEnd = val.last;   
     }
  }
}
</script>
 
<style>
.container {
  width: 100%;  
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 15px;
  max-width: 1500px;
  vertical-align:top;
}
</style>