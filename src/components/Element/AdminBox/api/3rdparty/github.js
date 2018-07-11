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
    url: '/vcs/github/tree/large',
    method: 'get',
    params
  })
}

export function fetchPv (pv) {
  return request({
    url: '/vcs/github/search/pv',
    method: 'get',
    params: { pv }
  })
}

export function fetchArticle (id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function createArticle (data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle (data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}
