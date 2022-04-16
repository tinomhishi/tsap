import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import TweetDashboard from '@/components/TweetDashboard' 

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TweetDashboard',
      component: TweetDashboard
    }
  ]
})
