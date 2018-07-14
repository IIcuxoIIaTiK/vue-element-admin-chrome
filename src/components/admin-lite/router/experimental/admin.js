/* Experimental - Admin Panels */
export const adminRouterMap = [
  {
    path: 'admin',
    name: 'AdminComponents',
    component: () => import('@/components/admin-lite/views/experimental/admin/index.vue'),
    meta: { title: 'Admin Panel', icon: 'example' },
    children: [
      // 1 - Search
      {
        path: 'element-ui',
        name: 'AdminElementUI',
        component: () => import('@/components/admin-lite/views/experimental/admin/element-ui.vue'),
        meta: { title: 'Element-UI', icon: 'example' }
      },
      {
        path: 'restful',
        name: 'AdminRestful',
        component: () => import('@/components/admin-lite/views/experimental/admin/restful.vue'),
        meta: { title: 'Restful', icon: 'example' }
      }
    ]
  }
]
