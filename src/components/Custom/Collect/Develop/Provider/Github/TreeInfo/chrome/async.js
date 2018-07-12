'use strict';

function startDoSomething(script, callback) {
    // Fire off the tabs query and continue in the callback
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        
        // Check API for any errors thrown
        if (chrome.runtime.lastError) {
            // Handle errors from chrome.tabs.query
        }
        else {
            var activeTab = tabs[0];

            // Fire off the injected script and continue in the callback
            chrome.tabs.executeScript(activeTab.id, { code: script }, function(results) {
                
                // Check API for any errors thrown, again
                if (chrome.runtime.lastError) {
                    // Handle errors from chrome.tabs.executeScript
                }
                else {
                    var firstScriptResult = results[0];
                    callback(firstScriptResult);
                }
            });
        }
    });
}