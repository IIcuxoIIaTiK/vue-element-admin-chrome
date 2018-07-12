//格式化通用模块

/**
 * 金额按千位逗号分割
 *
 * @param {String/Number}  s      需要被格式化的字符串或数字
 * @param {Number}         type   保留的小数位
 */
export const moneyFormat = (s, type) => {
  if (/[^0-9\.]/.test(s))
      return "0"
  if (!s || s == null || s == "")
      return "0"
  s = s.toString().replace(/^(\d*)$/, "$1.")
  s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1")
  s = s.replace(".", ",")
  let re = /(\d)(\d{3},)/
  while (re.test(s))
      s = s.replace(re, "$1,$2")
  s = s.replace(/,(\d\d)$/, ".$1")
  if (!type || type == 0) {// 不带小数位(默认是有小数位)
      let a = s.split(".")
      if (a[1] == "00") {
          s = a[0]
      }
  }
  return s
}