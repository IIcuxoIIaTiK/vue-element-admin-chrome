/* Experimental - Automation Panels */
export const automateRouterMap = [
  {
    path: 'automate',
    name: 'AutomateComponents',
    component: () => import('@/components/admin-lite/views/experimental/automate/index.vue'),
    meta: { title: 'Automate', icon: 'example' },
    children: [
      // 1 - Search
      {
        path: 'node-red',
        name: 'NodeRed',
        component: () => import('@/components/admin-lite/views/experimental/automate/index.vue'),
        meta: { title: 'Node-Red', icon: 'example' },
        children:
        [
          {
            path: 'node-red-uibuilder',
            name: 'NodeRedUIBuilder',
            component: () => import('@/components/admin-lite/views/experimental/automate/nodered-uibuilder.vue'),
            meta: { title: 'Repository', icon: 'example' }
          },
          {
            path: 'node-red-vueui',
            name: 'NodeRedVueUI',
            component: () => import('@/components/admin-lite/views/experimental/automate/nodered-vueui.vue'),
            meta: { title: 'File Tree', icon: 'example' }
          }
        ]
      },
      // 2 - Selector
      {
        path: 'linker',
        name: 'Linker',
        component: () => import('@/components/admin-lite/views/experimental/automate/linker.vue'),
        meta: { title: 'Linker', icon: 'example' }
      }/*,
      // 2 - Selector
      {
        path: 'selector',
        name: 'Selector',
        component: () => import('@/components/Custom/Automate/scrape/css-selector/component.vue'),
        meta: { title: 'Css Selector', icon: 'example' }
      }*/
    ]
  }
]
