import request from '@/content/components/admin-lite/utils/request'

export function getList (params) {
  return request({
    url: '#/table/list',
    method: 'get',
    params
  })
}
