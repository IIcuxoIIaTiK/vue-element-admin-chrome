/**
 * 页面模块打印逻辑
 */
export default function (target) {
  let wrap = document.getElementById('print-area')
  if(!wrap) return

  let now = new Date().getTime()
  wrap.innerHTML = '<iframe id="iframe_' + now + '" style="position:absolute;width:0;height:0;left:-1000px;top:-1000px;"></iframe>'
  let contentWindow = document.getElementById('iframe_' + now).contentWindow
  let doc = contentWindow.document

  doc.write(target.innerHTML)
  doc.close()

  contentWindow.focus()
  setTimeout( function() {
    contentWindow.print()
  }, 1000)
}
