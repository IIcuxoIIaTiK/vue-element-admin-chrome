import request from '@/components/admin-lite/utils/request'

export function userSearch (name) {
  return request({
    url: '/search/user',
    method: 'get',
    params: { name }
  })
}
