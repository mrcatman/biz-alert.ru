import Vue from 'vue';
import { Carousel, Slide } from 'vue-carousel';
const VueCarousel =  require('vue-carousel');
if (process.client) {
    Vue.use(VueCarousel);
    Vue.component('Carousel', Carousel);
    Vue.component('Slide', Slide);
}
