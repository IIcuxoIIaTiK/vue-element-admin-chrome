/**
 * 用于包装ajax模块，包括请求前后的拦截，登录状态及权限状态的判断等
 *
 * 使用范例:
 *
 * import service from '@/utils/fetch'
 *
 * service.get
 */
import axios from 'axios'
import qs from 'qs'

import {requestPath, LOGIN_PATH} from '@/config/path'
import { Message } from 'element-ui'

// 创建axios实例
const service = axios.create({
  baseURL: requestPath,
  timeout: 5 * 60 * 1000,
  responseType: 'text',
  // responseType: 'json',
  withCredentials: true, // 是否允许带cookie这些
  headers: {
    "Content-Type": "application/x-www-form-urlencodedcharset=utf-8"
  }
})

//POST传参序列化(添加请求拦截器)
service.interceptors.request.use(
  config => {
    // 在发送请求之前做某件事
    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      if(config.headers['Content-Type'] !== 'application/jsoncharset=utf-8') {
      // 序列化 如果json  不用序列化
        config.data = qs.stringify(config.data)
      }
    }

    return config
  },
  error => {
    Message({
      //  饿了么的消息弹窗组件,类似toast
      showClose: true,
      message: error,
      type: 'error'
    })
    return Promise.reject(error.data.error.message)
  }
)

//返回状态判断(添加响应拦截器)
service.interceptors.response.use(
  res => {
    const result = res.data || {}
    //针对返回结果做统一处理，若返回异常（主要是程序异常，如登录失效，权限不足等等），则统一提示
    if (!result || result.code != 200) {
      //登录状态失效
      if(result.code === '401'){
        location.href = LOGIN_PATH
        return
      }

      Message({
        //  饿了么的消息弹窗组件,类似toast
        showClose: true,
        message: result.message || '数据异常，请联系开发人员',
        type: "error"
      })

      return Promise.reject(result.message)
    }

    //将对应结果集直接到res对应key上，降低取值层次
    res._code = result.code
    res._data = result.data
    return res
  },
  error => {
    // 返回 response 里的错误信息，这里主要处理请求的网络异常等非逻辑问题
    return Promise.reject(error.data ? error.data.error.message : error.data)
  }
)

export default service
