import request from '@/components/admin-lite/utils/request'

export function getSearchResults (params) {
  return request({
    url: '/vcs/github/search',
    method: 'get',
    params
  })
}

export function getTree (params) {
  return request({
    url: '/vcs/github/tree',
    method: 'get',
    params
  })
}
