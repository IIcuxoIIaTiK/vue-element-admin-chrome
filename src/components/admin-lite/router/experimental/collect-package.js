/* Experimental - Package Insighters */
export const packageRouterMap = [
  {
    path: 'package-hub',
    name: 'PackageHub',
    component: () => import('@/components/admin-lite/views/experimental/collect/vcs-package-hub.vue'),
    meta: { title: 'Package-Hub', icon: 'example' }
  }
]
