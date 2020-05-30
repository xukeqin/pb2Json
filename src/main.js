import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import JsonViewer from 'vue-json-viewer'

Vue.use(ElementUI)
Vue.use(JsonViewer)

new Vue({
  el: '#app',
  render: h => h(App)
})
