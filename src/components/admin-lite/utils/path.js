/**
 * 通用路径操作模块。主要包含常规路径的解析和预处理
 *
 * 例如：hash一级和二级地址的解析，图片等三方资源的长短路径支持等
 */

/**
 * 根据等级解析当前的路由完整地址，主要用于导航菜单中的路径配置。也可以用于修复不规则路径
 * 例如
 * '/project/list'   =>  parseHashPath(router, 1)  =>   '/project'
 * '/project/list/used'   =>  parseHashPath(router, 2)  =>   '/project/list'
 * 不规则路径修复
 * '/project/'   =>  parseHashPath(router, 1)  =>   '/project'
 *
 * @param  {Object}   router    全局路由对象
 * @param  {Number}   grade     路由等级，不传值时，默认返回修复后的完整路径
 *
 * @returns {String}
 */
const parseHashPath = (router, grade) => {
  let path = router.path || ''
  let pathArr = path.split('/')

  if(!grade){
    return path.charAt(path.length - 1) === '/' ? path.substr(0, path.length - 1) : path
  }else{
    ++grade
  }

  return pathArr.slice(0, grade).join('/')
}

export {
  parseHashPath
}
