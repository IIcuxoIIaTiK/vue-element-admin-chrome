const bodyOriginal = document.querySelectorAll('body > *')
// console.log(bodyOriginal)
const Registry = {
  bodyOriginal: bodyOriginal
}

Registry.install = function (Vue, options) {
  Vue.prototype.$getFromRegistry = (key) => {
    return Registry[key]
  }
}

export default Registry
