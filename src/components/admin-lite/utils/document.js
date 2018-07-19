export const loadStyle = url => {
  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = url
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(link)
}

export const setTitle = function (title) {
  title = title ? `${title}` : 'NxAdmin'
  window.document.title = title
}