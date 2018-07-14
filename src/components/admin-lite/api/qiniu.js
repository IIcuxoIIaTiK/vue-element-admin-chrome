import request from '@/components/admin-lite/utils/request'

export function getToken () {
  return request({
    url: '/qiniu/upload/token', // Fake address
    method: 'get'
  })
}
