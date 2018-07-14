/* Experimental - Data Collectors */
// import { githubRouterMap } from './collect-github'
import { packageRouterMap } from './collect-package'
import { searchRouterMap } from './collect-search'

export const collectRouterMap = [
  {
    path: 'collectors',
    name: 'CollectComponents',
    component: () => import('@/components/admin-lite/views/experimental/collect/index.vue'),
    meta: { title: 'Collectors', icon: 'example' },
    children: [ packageRouterMap, searchRouterMap ] // githubRouterMap
  }
]
