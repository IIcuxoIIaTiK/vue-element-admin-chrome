import Vue from 'vue'
import Router from 'vue-router'

/* Layout */
import Layout from '@/extension/popup/views/layout/Layout'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading
Vue.use(Router)

/** note: submenu only apppear when children.length>=1
*   detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
**/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const popupRouterMap = [
  { path: '/login', component: () => import('@/extension/popup/views/login/index'), hidden: true },
  { path: '/authredirect', component: () => import('@/extension/popup/views/login/authredirect'), hidden: true },
  { path: '/404', component: () => import('@/extension/popup/views/errorPage/404'), hidden: true },
  { path: '/401', component: () => import('@/extension/popup/views/errorPage/401'), hidden: true },

  /*
  {
    path: '/',
    component: Layout,
    // hidden: true,
    redirect: '/web-search',
    name: 'WebSearch',
    children: [
      {
        path: 'web-search',
        component: () => import('@/extension/popup/views/tab/index'),
        meta: { title: 'Web Search', icon: 'form' }
      }
    ]
  },
  */

  {
    path: '/',
    component: Layout,
    // hidden: true,
    redirect: '/popupsearch',
    name: 'PopupSearch',
    children: [
      {
        path: 'popupsearch',
        component: () => import('@/extension/popup/views/popupsearch/main.js'),
        meta: { title: 'Searx Search', icon: 'form' }
      }
    ]
  },

  {
    path: '/popupsearch',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'popupsearch',
        component: () => import('@/extension/popup/views/popupsearch/index'),
        meta: { title: 'Popup Search', icon: 'form' }
      }
    ]
  },

  {
    path: '/onetab',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'onetab',
        component: () => import('@/extension/popup/views/onetab/index'),
        meta: { title: 'OneTab', icon: 'form' }
      }
    ]
  },

  {
    path: '/viblo',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Viblo',
        component: () => import('@/extension/popup/views/viblo/index'),
        meta: { title: 'Viblo', icon: 'form' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', // Backend support can be opened
  scrollBehavior: () => ({ y: 0 }),
  routes: popupRouterMap
})

export const asyncPopupRouterMap = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/index',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: 'permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [{
      path: 'page',
      component: () => import('@/components/admin-lite/views/permission/page'),
      name: 'pagePermission',
      meta: {
        title: 'pagePermission',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    }, {
      path: 'directive',
      component: () => import('@/components/admin-lite/views/permission/directive'),
      name: 'directivePermission',
      meta: {
        title: 'directivePermission'
        // if do not set roles, means: this page does not require permission
      }
    }]
  },
  { path: '*', redirect: '/404', hidden: true }
]
