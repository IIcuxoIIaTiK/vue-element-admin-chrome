'use strict';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Relay the contentscript's message to the native app
    chrome.runtime.sendNativeMessage("org.snk.indexer", request)
    sendResponse({text: "OK"})
})

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, {
        file: "backend_request.js"
    })
})

console.log("'chrome events added...")

