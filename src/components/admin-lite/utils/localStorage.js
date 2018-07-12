
const localStorage = {
  getItem: function (key) {
    if (window.localStorage) {
      let storage = window.localStorage
      let json = storage.getItem(key)
      return JSON.parse(json)
    } else {
      return {}
    }
  },
  setItem: function (key, data) {
    if (window.localStorage) {
      let storage = window.localStorage
      let dataStr = JSON.stringify(data)
      storage.setItem(key, dataStr)
    } else {

    }
  },

  removeItem: function (key) {
    if (window.localStorage) {
      let storage = window.localStorage
      storage.removeItem(key)
    } else {}
  }
}

export {
  localStorage
}
