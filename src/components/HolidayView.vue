<template>
  <b-container fluid>
   <b-row class="h-10">
      <b-col cols="12" class="p-2">
        <mc-select ref="monthselect" class="float-left mt-2" @update="getMcName"></mc-select> 
      </b-col>
   </b-row>
   <b-row class="h-90">
       <b-col cols="12" class="p-2">
         <FullCalendar ref="fullCalendar" :options="calendarOptions" class="eventDeal-wrap"/>
        <!-- <full-calendar 
           ref="calendar"
           class="my-2"
           :eventDisplay="background"
           :events="events" 
           :config="calendarOptions"
           selectable="true"
           @event-selected="eventClick"
           @day-click="dayClick"
           @event-render="eventRender"
           @view-render="changemonth"
           @selectionInfo="eventSelected"
           >
         </full-calendar>-->
       </b-col>
    </b-row>
 </b-container> 
</template>

<script>
import axios from "axios";
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'

import McSelect  from './mcscheduler/McSelect.vue'
//import '@fullcalendar/core/fullcalendar.css'
//import '@fullcalendar/daygrid/main.css'
//共通関数//
//import Decimal from 'decimal.js';
import { mapState } from 'vuex'
import date_func from '../api/date_func'
 const { 
   toDoubleDigits,
   formatDay,
   addnextmonth,
   make_id,
   isNumber,
   addnextstart,
   addnextlast,
   make_daylist,
   formatStartDay,
   month_startday,
   getOffsetMonth
 } = date_func();

export default {
 name: 'DEMO',
 components: {
   FullCalendar,
   "mc-select": McSelect
 },
 data () {
   return {
      // suu: new Decimal(10),
       startstr: null,
       endstr: null,
       monthoffset: 0,
       startday: month_startday(new Date()),
        defaultworktime: 0,
       mc: "-",
       calendarApi: null,
       calendarOptions: {
         // 引入的插件
         plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
         // 日历头部按钮位置
         headerToolbar: {
           left: 'prev,next',
           center: 'title',
           right: 'myLink myLink2, myLink3'
         },
         customButtons: {
           next: {
               click: () => this.onchangemonth(1) // assuming you use Vue Router
           },
           prev: {
               click: () => this.onchangemonth(-1) // assuming you use Vue Router
           },
           myLink: {
               text: "＋１時間",
               click: () => this.onCustomClick(1) // assuming you use Vue Router
           },
           myLink2: {
               text: "－１時間",
               click: () => this.onCustomClick(-1) // assuming you use Vue Router
           },
           myLink3: {
               text: "基本休日",
               click: () => this.onSetWeekEnd() // assuming you use Vue Router
           }
         },
         // 日历头部按钮中文转换
         buttonText: {
           today: '',
           month: ''
         },
         initialView: 'dayGridMonth', // 指定默认显示视图
         locale: 'ja', // 切换语言，当前为中文
         dayCellContent: function(arg){
           return arg.date.getDate();
         },
         events: [],//[{color: "silver", display:"",end:"2024-12-22",start: "2024-12-22",status:0, textColor:"black",title:"休日",worktime:0,_id:"2024-12-22"}],
         firstDay: '1', // 设置一周中显示的第一天是周几，周日是0，周一是1，以此类推
         weekNumberCalculation: 'ISO', // 与firstDay配套使用
         eventCOlor: '#3d8eec', // 全部日历日程背景色
         timeGridEventMinHeight: '20', // 设置事件的最小高度
         aspectRatio: '1.5', // 设置日历单元格宽高比
         displayEventTime: false, // 是否显示事件时间
         allDaySlot: false, // 周、日视图时，all-day不显示
         eventLimit: true, // 设置月日程，与all-day slot 的最大显示数量，超过的通过弹窗展示
         eventTimeFormat: {
           hour: 'numeric',
           minute: '2-digit',
           hour12: false
         },
         slotLabelFormat: {
           hour: '2-digit',
           minute: '2-digit',
           meridiem: false,
           hour12: false // 设置时间为24小时制
         },
         // 事件
         editable: false, // 変更可/否
         eventStartEditable: false, //開始時刻の変更可否
         eventDurationEditable: false, //期間の変更可否
         selectable: true, //グリッドの変更可否
         selectMirror: true,
         selectMinDistance: 0, //選択したカレンダー グリッド間の最小距離
         weekends: true,
         navLinks: true, //リンク
         selectHelper: false,
         selectEventOverlap: false, //イベントの重複視覚化
         dayMaxEvents: true,
         dateClick: this.handleDateClick, // 日にちクリック
         eventsSet: this.handleEvents, // イベントクリック
         eventClick: this.handleEventClick, // スケジュールクリック情報表示
         eventDrop: this.handleEventDrop, // ラッグイベントをスケジュールする
         eventResize: this.eventResize, // ズームイベントをスケジュールする
         select: this.selectionInfo,
         eventContent: this.eventRender,
         eventChange: this.eventChange,
         height: '80vh'
       }
   }
 },
 computed: { 
   //共通変数
   ...mapState({
     holidayserver: "holidayserver" 
   })
 },
 watch: {
   customeridglobal: function(val){
     this.$emit("setday", this.currenttitle);
   },
 /*  items: function(val){
     this.make_list(val);
     this.updatekey += 1;
   },*/
   events: function(val){
     console.log(val);
     this.updatekey += 1;
   },
   mc: function(val){
     this.onUpdateDay(this.startday);
   }
 },
 mounted () {
   this.calendarApi = this.$refs.fullCalendar.getApi()
   this.onUpdateDay(this.startday);
 },
 created () {

 },
 methods: {
     onchangemonth: function(i) {
       this.monthoffset += i;
       this.startday = getOffsetMonth(new Date(),this.monthoffset);
       this.calendarApi.gotoDate(new Date(this.startday));
       this.onUpdateDay(this.startday);
     },
     eventChange: function(data) {
     },
     getMcName: function(data) {
       this.mc = data.text;
     },
     eventranderling: function(event, element) {
        element.qtip({
           content: event.title + " " + event.worktime
        })
     },
   // 日程保存
     selectionInfo: function(e) {
        console.log(e);
        this.startstr = e.startStr;
        this.endstr = e.endStr;
     },
     onCustomClick: function(i) {
       var self = this;
       var daystr = self.calendarOptions.events[0].id;
       var querystr = { num: i, day: daystr, startday: self.startstr, endday: self.endstr , defaultworktime: self. defaultworktime, modeltype: self.mc, events: []};
           var senddata = {
               params: querystr
           }    
           let promise = axios.get( self.holidayserver + "/changeworktime", senddata)  
           return promise.then((ret) => { 
              self.calendarOptions.events = ret.data.events; 
             // self.calendarApi.refetchEvents();
           }).catch(() => {
           console.log("error " + error) 
           })  
     },
     saveEvent (val) {
       let eventsArr = this.calendarOptions.events
       try {
         if (eventsArr.length === 0) {
           eventsArr.push(val)
         } else {
           eventsArr.forEach((item, index, eventsArr) => {
             // 若为修改日程
             if (item.eventID === val.eventID) {
               throw new Error(index)
             }
           })
           // 若为新增日程
           eventsArr.push(val)
         }
       } catch (e) {
         // 若为修改日程
         eventsArr.splice(e.message, 1, val)
       }
     },
     // 日程删除
     deleteEvent (val) {
       let eventsArr = this.calendarOptions.events
       try {
         eventsArr.forEach((item, index, eventsArr) => {
           if (item.eventID === val) {
             throw new Error(index)
           }
         })
       } catch (e) {
         // 删除指定日程
         eventsArr.splice(parseInt(e.message), 1)
       }
     },
     // 日程事件点击
     handleEvents (info) {
       console.log('handleEvents.info:', info)

      // this.calendarApi = this.$refs.fullCalendar.getApi();
      // var ret = this.calendarApi.getView();
      // console.log(ret);
       // this.currentEvents = events
     },
     handleWeekendsToggle () {
       console.log('handleWeekendsToggle')
       this.calendarOptions.weekends = !this.calendarOptions.weekends
     },
     // 日期点击
     handleDateClick (selectInfo) {
      // if (confirm('您是否要在【' + selectInfo.dateStr + '】添加一个新的事件？')) {
         // 父组件直接调用子组件方法
        // this.$refs['eventDialogue'].openDialog('add')
         // 父组件直接修改子组件变量
         // this.$refs['eventDialogue'].dialogVisible = true
      // }
     },
     // 日程点击信息展示
     handleEventClick (info) {
       this.daystr = info.event.id;
       var self = this;
       var status = 0;
       if (self.onGetStatus(self.daystr)==0) {
         status = 1;
       }
       var querystr = { status: status, day: self.daystr , defaultworktime: self. defaultworktime, modeltype: self.mc, events: []};
           var senddata = {
               params: querystr
           }    
           let promise = axios.get( self.holidayserver + "/changeholiday", senddata)  
           return promise.then((ret) => { 
              self.calendarOptions.events = ret.data.events; 
              self.startstr = null;
              self.endstr = null;
             // self.calendarApi.refetchEvents();
           }).catch(() => {
           console.log("error " + error) 
           })  
     //  console.log('handleEventClick.info:', info)
     //  info.el.style.borderColor = 'red'
      // this.$refs['eventDialogue'].openDialog('view', info)
     },
     // 日程事件触发
     eventClick (info) {
       console.log('eventClick.info:', info)
       info.el.style.borderColor = 'red'
     },
     // 日程拖动事件
     handleEventDrop (info) {
       this.$refs['eventDialogue'].eventFormModel.start = info.event.start
       this.$refs['eventDialogue'].eventFormModel.end = info.event.end
     },
     // 日程缩放事件
     eventResize (info) {
       this.$refs['eventDialogue'].eventFormModel.start = info.event.start
       this.$refs['eventDialogue'].eventFormModel.end = info.event.end
     },
     onUpdateDay: function(day) {
       var querystr = { count: 365, day: day , modeltype: this.mc, daylist: "", defaultworktime: null, events: []};
       var self = this;
       self.currenttitle = day;
       var senddata = {
           params: querystr
       } 
       let promise = axios.get( self.holidayserver + "/getholiday", senddata)  
         return promise.then((result) => {
           self.calendarOptions.events = result.data.events; 
           self.defaultworktime = result.data.defaultworktime;  
           self.startstr = null;
           self.endstr = null;
       }).catch(error => {
           console.log("error " + error) 
       })

     },
     eventSetStart: function(e){
       console.log(e)
     },
     changemonth(start, end) {
        this.currenttitle = start.title.replace(" ","") + "-01";
        this.onUpdateDay(this.currenttitle);
     },
     ontaskUpdate: function(task) {
       var newLine = this.shipmentlist.filter(function(item, index){
             if (item._id==task.data._id) return true;
       });
       newLine[0].product = task.data.product;
       this.$emit("update", newLine[0]);
       this.updatekey += 1;
     },
     eventRender: function(eventInfo) {
        return { html: eventInfo.event.title + "<br> " + this.onGetHour(eventInfo.event.id) + "H"}
     },
     onGetStatus: function(title) {
       var newLine = this.calendarOptions.events.filter(function(item, index){
             if (item.id==title) return true;
       });
       return newLine[0].status;
     },
     onGetHour: function(title) {
       var newLine = this.calendarOptions.events.filter(function(item, index){
             if (item.id==title) return true;
       });
       return newLine[0].worktime
     },
     eventClick: function(info) {
       this.daystr = info.daystr;
       var self = this;
       var status = 0;
       if (info.status==0) {
         status = 1;
       }
       var querystr = { status: status, day: self.daystr , modeltype: self.mc, events: []};
           var senddata = {
               params: querystr
           }    
           let promise = axios.get( self.holidayserver + "/changeholiday", senddata)  
           return promise.then((ret) => { 
              self.events = ret.data.events; 
            //  self.$refs.calendar.$emit('refetch-events');
           }).catch(() => {
           console.log("error " + error) 
           })        
     },
     dayClick: function(info) {
         console.log(info);
         this.daylist=[];    
     },
     refreshEvents() {
      // this.$refs.calendar.$emit('refetch-events')
     },
     onclose: function() {
       this.$emit("close", null);
     },
     onSetWeekEnd: function() {
       var dia = confirm("１年先まで土日を休みにしますか？");
       if (dia == true){
           var self = this;
           var querystr = { count: 365, day: this.currenttitle , modeltype: self.mc, events: [], defaultworktime: 0, mcspec: ""}; 
           var senddata = {
               params: querystr
           }    
           let promise = axios.get( self.holidayserver + "/setholiday", senddata)  
           return promise.then((ret) => { 
              self.events = ret.data.events; 
           }).catch(() => {
           console.log("error " + error) 
           }) 
       }
 
     }
 }
}
</script>
<style>

</style>
