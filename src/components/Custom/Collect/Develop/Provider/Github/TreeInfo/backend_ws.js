"use strict";

// backend websocket controllers
var BACKEND_WS_HOST = "localhost:";
var BACKEND_WS_PORT = 35729;
var BACKEND_WS_ENDPOINT = "/sniperkit";
var connection = new WebSocket(
  "ws://" + BACKEND_WS_HOST + BACKEND_WS_PORT + BACKEND_WS_ENDPOINT
);

connection.onerror = function(error) {
  console.log("reload connection got error:", error);
};

connection.onmessage = function(e) {
  if (e.data) {
    var data = JSON.parse(e.data);

    if (data && data.command === "reload") {
      chrome.runtime.reload();
    } else if (data && data.command === "hello") {
      console.log("hello backend ws !!!");
    } else {
      console.log(data.command);
    }
  }
};
