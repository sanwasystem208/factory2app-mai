import Vue from 'vue';
import Router from 'vue-router';
import HomePage from './components/HomePage.vue';
import Monitor1 from './components/Monitor1.vue';
import OrderView from './components/OrderView.vue';
import PriceList from './components/PriceList.vue';
import ReportView from './components/ReportView.vue';
import DryingView from './components/DryingView.vue';
import PartList from './components/PartList.vue';
import AgGridTest from './components/AgGridTest.vue';
import McScheduler from './components/McScheduler.vue';
import HolidayView from './components/HolidayView.vue';
import BuhinView from './components/BuhinView.vue';
import TestView from './components/TestView.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },
    {
      path: '/monitor1',
      name: 'Monitor1',
      component: Monitor1,
    },
    {
      path: '/part',
      name: 'part',
      component: PartList,
    },
    {
      path: '/order',
      name: 'order',
      component: OrderView,
    },
    {
      path: '/reportview',
      name: 'reportview',
      component: ReportView,
    },
    {
      path: '/dryingview',
      name: 'dryingview',
      component: DryingView,
    },
    {
      path: '/aggridtest',
      name: 'aggridtest',
      component: AgGridTest,
    },
    {
      path: '/mcscheduler',
      name: 'mcscheduler',
      component: McScheduler,
    },
    {
      path: '/holidayview',
      name: 'holidayview',
      component: HolidayView,
    },
    {
      path: '/buhinview',
      name: 'buhinview',
      component: BuhinView,
    },
    {
      path: '/testview',
      name: 'testview',
      component: TestView,
    },
    {
      path: '/price',
      name: 'price',
      component: PriceList,
    }
  ],
});