/**
 * 全局仓库，用于完成简单的跨组件（非父子）传值
 */
let Heaven = {}

export default {
  setItem: (key, value) => {
    Heaven[key] = value
    return Heaven
  },
  getItem: (key) => {
    return Heaven[key]
  },
}
