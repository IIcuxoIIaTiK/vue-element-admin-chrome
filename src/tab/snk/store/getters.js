// getters
const getters = {
  featrues: state => state.featrues,
  application: state => state.featrues ? state.featrues.application : null, // 防止空值异常
  bookmark: state => state.featrues ? state.featrues.bookmark : null,
  commonsites: state => state.featrues ? state.featrues.commonsites : null,
  bing: state => state.bing,
  color: state => state.color,
  getTopSites: state => state.topSites
}

export default getters
