import request from '@/content/components/admin/utils/request'

export function fetchList (query) {
  return request({
    url: '/transaction/list',
    method: 'get',
    params: query
  })
}
