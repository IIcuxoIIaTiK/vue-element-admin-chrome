/* Experimental - Github Helpers */
export const githubRouterMap = [
  {
    path: 'github',
    name: 'GithubComponents',
    component: () => import('@/components/admin-lite/views/experimental/collect/index.vue'),
    meta: { title: 'Search', icon: 'example' },
    children: [
      // 1 - Search
      {
        path: 'search',
        name: 'GithubSearch',
        component: () => import('@/components/admin-lite/views/vcs/github/index.vue'),
        meta: { title: 'Search', icon: 'example' },
        children:
        [
          {
            path: 'gh-repo',
            name: 'GithubSearchRepo',
            component: () => import('@/components/admin-lite/views/vcs/github/search.vue'),
            meta: { title: 'Repository', icon: 'example' }
          },
          {
            path: 'gh-tree',
            name: 'GithubRepoTree',
            component: () => import('@/components/admin-lite/views/vcs/github/tree.vue'),
            meta: { title: 'File Tree', icon: 'example' }
          }
        ]
      }
      // 2 - ...
    ]
  }
]
