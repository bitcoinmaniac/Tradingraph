import Cryptochart from './Cryptochart.vue';

export default Cryptochart;

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component('crypto-chart', Cryptochart);
}
