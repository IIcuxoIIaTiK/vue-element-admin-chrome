const content = chrome.extension.getURL('js/content.js')
const script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', content)
document.body.appendChild(script)

console.log('[chrome-ext] - inject initialized...')