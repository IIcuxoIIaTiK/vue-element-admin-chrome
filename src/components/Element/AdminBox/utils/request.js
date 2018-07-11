import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/components/admin-lite/utils/auth'

// nb. temporary hack to switch between env or local backend, needs to be moved and wrapped by webpack...
export function checkBackendApiEnv () {
  var baseAPI = process.env.BASE_API
  if (typeof process.env.BASE_API === 'undefined' || !process.env.BASE_API) {
    baseAPI = 'http://localhost:3000/api'
  }
  // add override case by passing argument to function...
  return baseAPI
}

console.log('process.env.BASE_API', process.env.BASE_API)
console.log('checkBackendApiEnv()', checkBackendApiEnv())

// Create an axios instance
const service = axios.create({
  baseURL: checkBackendApiEnv(), // Api's base_url or local backend (dockerized or not...)
  timeout: 5000, // Request timeout
  headers: {'X-Auth-Token': 'sample_token'}
})

// Request interceptor
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['X-Token'] = getToken() // Let each request carry a custom token, please modify it according to the actual situation.
  }
  return config
}, error => {
  // Do something with request error
  if (store.getters.debug) {
    console.log(error) // for debug
  }
  Promise.reject(error)
})

// Response interceptor
service.interceptors.response.use(
  response => {
  /**
  * Code is non-20000 is a mistake can be combined with their own business to modify
  */
    if (store.getters.debug) {
      console.log('service.interceptors.response', response)
      console.log('service.interceptors.response.status', response.status)
      console.log('service.interceptors.response.data', response.data)
    }

    const res = response.data

    if (response.status !== 200) {
    // if (res.status !== 20000 || res.status !== 200) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // write a better wrapper for codeStatus error classification/notification
      /*
        eg:
        func (this StatusCode) Informational() bool { return this >= 100 && this < 200 }
        func (this StatusCode) Successful() bool    { return this >= 200 && this < 300 }
        func (this StatusCode) Redirection() bool   { return this >= 300 && this < 400 }
        func (this StatusCode) BadRequest() bool    { return this >= 400 && this < 500 }
        func (this StatusCode) ServerError() bool   { return this >= 500 && this < 600 }
      */
      if (response.status === 500) {
      // if (res.status === 50008 || res.status === 50012 || res.status === 50014 || res.status === 500) {
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 're-signin',
          cancelButtonText: 'cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()// In order to re-instantiate the vue-router object to avoid bugs
          })
        })
      }
      return Promise.reject(new Error('error, status: ' + response.status))
    } else {
      return response.data
    }
  },
  error => {
    if (store.getters.debug) {
      console.log('err' + error) // for debug
    }
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
