import * as store from './localstore'
import Keys from './storekeys'

const path = '../assets/engines/'

/**
 * 所有的搜索引擎
 */
export const allEngines = [
  {
    name: 'Google',
    icon: `${path}google.png`,
    action: 'https://www.google.com/search',
    inputName: 'q'
  }, {
    name: 'Bing',
    icon: `${path}bing.png`,
    action: 'https://www.bing.com/search',
    inputName: 'q'
  }, {
    name: 'Yahoo',
    icon: `${path}yahoo.png`,
    action: 'https://search.yahoo.com/search?',
    inputName: 'p'
  }, {
    name: 'Stackoverflow',
    icon: `${path}stackoverflow.png`,
    action: 'https://stackoverflow.com/search?',
    inputName: 'q'
  }, {
    name: 'Baidu',
    icon: `${path}baidu.png`,
    action: 'https://www.baidu.com/s?',
    inputName: 'wd'
  }
]

/**
 * 获取默认的搜索引擎 index
 * @return {number}
 */
export const getEngineIndx = store.getData(Keys.ENGINIE).then(data => {
  // 没有默认的搜索引擎
  // 设置 谷歌
  if (store.isEmptyData(data)) {
    let defaults = {
      [Keys.ENGINIE]: 0
    }
    store.storeData(defaults)
    return defaults[Keys.ENGINIE]
  }
  return data[Keys.ENGINIE]
})

/**
 *  设置新的搜索引擎
 * @param {number} index
 */
export const setEngineIndx = index => {
  store.storeData({
    [Keys.ENGINIE]: index
  })
}
