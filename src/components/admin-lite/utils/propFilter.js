/**
 * 去掉属性为空的字段
 *
 * @param {any} model
 * @returns
 */
function propFilter (model) {
  let newModel = {}
  for (let prop in model) {
    if(model[prop] !== '') {
      newModel[prop] = model[prop]
    }
  }
  return newModel
}

export{propFilter}
