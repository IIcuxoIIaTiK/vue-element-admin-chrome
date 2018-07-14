/* Experimental - Search Interfaces */
export const searchRouterMap = [
  {
    path: 'search',
    name: 'SearchComponents',
    component: () => import('@/components/admin-lite/views/experimental/collect/index.vue'),
    meta: { title: 'Search', icon: 'example' },
    children: [
      // 1 - Search
      {
        path: 'search-elastic',
        name: 'SearchElastic',
        component: () => import('@/components/admin-lite/views/experimental/collect/index.vue'),
        meta: { title: 'Search', icon: 'example' },
        children:
        [
          {
            path: 'inner-search',
            name: 'InnerSearch',
            component: () => import('@/components/admin-lite/views/experimental/collect/search-inner.vue'),
            meta: { title: 'Inner Elastic', icon: 'example' }
          },
          {
            path: 'search-elasticitems',
            name: 'SearchElasticItems',
            component: () => import('@/components/admin-lite/views/experimental/collect/search-elasticitems.vue'),
            meta: { title: 'Elastic Items', icon: 'example' }
          },
          {
            path: 'search-itemsapi',
            name: 'SearchItemsApi',
            component: () => import('@/components/admin-lite/views/experimental/collect/search-itemsapi.vue'),
            meta: { title: 'Items Api', icon: 'example' }
          }
        ]
      },
      // 2 - ...
      {
        path: 'search-gateway',
        name: 'SearchGateway',
        component: () => import('@/components/admin-lite/views/experimental/collect/index.vue'),
        meta: { title: 'Search', icon: 'example' },
        children:
        [
          {
            path: 'popup-search',
            name: 'PopupSearch',
            component: () => import('@/components/admin-lite/views/experimental/collect/search-popup.vue'),
            meta: { title: 'Popup', icon: 'example' }
          }
        ]
      }
    ]
  }
]
