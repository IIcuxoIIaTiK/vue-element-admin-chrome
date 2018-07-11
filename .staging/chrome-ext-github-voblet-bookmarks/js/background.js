(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var db = require('./lib/db.js');
var bookmarksDb = require('./lib/bookmarksDb.js');
var queueDb = require('./lib/queueDb.js');
var constants = require('./lib/constants.js');
var util = require('./lib/util.js');
var notify = require('./lib/notify.js');
var api = require('./lib/api.js');
var message = require('./lib/message.js');
var gaEventCategory = "background";

if (util.getBrowser() == constants.Firefox) {
    onFirefoxStart();
} else {
    chrome.runtime.onInstalled.addListener(function (details) {
        console.log("onInstalled called");
        onInstalled(details);
    });

    activateListeners();

    chrome.runtime.onStartup.addListener(function () {
        console.log("onStartup called");
        onStartup();
    });

    chrome.management.onEnabled.addListener(function (ExtensionInfo) {
        console.log("onEnabled called");
        onStartup();
        util.injectContentScript();
    });
}

function onFirefoxStart() {
    //FTODO: this doesnot work before firefox 45.0 please check , 90% users are above this
    var deviceId = db.getDeviceId();
    if (!deviceId) {
        //when device is not set.
        //FTODO: this means every install will have a new uuid ???
        deviceId = util.generateUUID();
        db.setDeviceId(deviceId);
    }
    bookmarksDb.setup();
    queueDb.setup();
    message.activateListener();
    //FTODO: gcm listener
    if (db.getAuthToken()) {
        api.refreshTokenIfRequired();
        api.createContextMenus();
        api.syncDeviceList(function (success) {
            if (success) {
                api.createContextMenus();
            }
        });
        queueDb.updateViewedCount();
    } else {
        api.handleUnauthorizedRequest();
    }
}

function onInstalled(details) {
    if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        //FTODO: better location for managing defaults fro updates etc
        db.setGithubFeatureDefaults();
    }
    util.gaEvent(gaEventCategory, 'onInstalled');

    bookmarksDb.setup();
    queueDb.setup();

    var deviceId = db.getDeviceId();
    util.injectContentScript();
    if (!deviceId) {
        db.emptyLocalStorage();
        //when device is not set.
        deviceId = chrome.runtime.id;
        db.setDeviceId(deviceId);
    }

    //FODO: dont do regsiter with gcm if token is already present?? so if something wrng happens
    //user has to delete chrome extension and install it
    if (db.getGcmToken()) {
        refreshAuthTokenAndSetup();
    } else {
        registerWithGcmAndLogin();
    }
}

function onStartup() {
    bookmarksDb.setup();
    queueDb.setup();
    refreshAuthTokenAndSetup();
    util.gaEvent(gaEventCategory, 'onStartup');
}

function refreshAuthTokenAndSetup() {
    api.refreshTokenIfRequired();
    if (db.getAuthToken()) {
        api.createContextMenus();
        api.syncDeviceList(function (success) {
            if (success) {
                api.createContextMenus();
            }
        });
        queueDb.updateViewedCount();
    } else {
        api.handleUnauthorizedRequest();
    }
}

function activateListeners() {
    message.activateListener();
    notify.activateGCMListener();
    api.activateCommandListener();
}

function registerWithGcmAndLogin() {
    var senderIds = [constants.GoogleProjectNumber];
    chrome.gcm.register(senderIds, function (registrationId) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            db.setItem(constants.GCMErrorKey, chrome.runtime.lastError);
            util.gaEvent(gaEventCategory, 'chromeGCMRegistrationError', chrome.runtime.lastError);
            return;
        }
        db.setGcmToken(registrationId);
        api.getAuthTokenAndLogin();
    });
}

},{"./lib/api.js":2,"./lib/bookmarksDb.js":3,"./lib/constants.js":4,"./lib/db.js":5,"./lib/message.js":6,"./lib/notify.js":7,"./lib/queueDb.js":8,"./lib/util.js":9}],2:[function(require,module,exports){
'use strict';

var db = require('./db.js');
var constants = require('./constants.js');
var util = require('./util.js');
var notify = require('./notify.js');
var queueDb = require('./queueDb.js');
var bookmarksDb = require('./bookmarksDb.js');
var jwtDecode = require('jwt-decode');
var gaEventCategory = "api";
var gaContextMenuEventCategory = "contexMenu";

var getRequestObj = function getRequestObj(url, reqType, data) {
  return $.ajax({
    url: url,
    type: reqType,
    beforeSend: function beforeSend(request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(constants.AuthTokenKey));
    },
    data: data,
    complete: function complete(jqXHR, textStatus) {
      if (jqXHR.status == 401) {
        handleUnauthorizedRequest();
      } else if (url != constants.RefreshTokenApi) {
        refreshTokenIfRequired();
      }
    }
  });
};

var handleUnauthorizedRequest = function handleUnauthorizedRequest() {
  var pageUrl = window.location.href;
  if (pageUrl && pageUrl.indexOf("_generated_background_page.html") < 0) {
    //not background page
    window.location.href = constants.LoginPageUrl;
    //send message to activateTabListener
    util.sendMessage({ "name": constants.MessageActivateTabListener });
  } else {
    activateTabListener();
    //FTODO: make this work on firefox
    notify.showLoginNotification();
  }
  chrome.browserAction.setPopup({ popup: '/html/login.html' });
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({ "id": "1", "title": "Click on Voblet icon in menu to Login", contexts: ["all"] });
};

var logoutUser = function logoutUser() {
  //clear auth Token
  logoutDeviceOnServerSide();
  db.setAuthToken("");
  db.setQueueLastUpdatedTimestamp(0);
  db.setBookmarksLastUpdatedTimestamp(0);
  db.updateDevicesList([]);
  util.setBadgeText(":(");

  queueDb.deleteAll().then(function (deleteCount) {}).catch(function (err) {
    console.log(err);
    //FTODO: what to do if this fails?
  });

  bookmarksDb.deleteAll().then(function (deleteCount) {}).catch(function (err) {
    console.log(err);
    //FTODO: what to do if this fails?
  });

  handleUnauthorizedRequest();
  util.gaEvent(gaEventCategory, "logoutUser");
};

var getJsonPostRequestObj = function getJsonPostRequestObj(url, data) {
  return $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    contentType: "application/json; charset=UTF-8",
    beforeSend: function beforeSend(request) {
      request.setRequestHeader("Authorization", "Bearer " + db.getAuthToken());
    },
    data: JSON.stringify(data),
    complete: function complete(jqXHR, textStatus) {
      if (jqXHR.status == 401) {
        handleUnauthorizedRequest();
      } else {
        refreshTokenIfRequired();
      }
    }
  });
};

var getLoginRequestObj = function getLoginRequestObj() {
  var deviceName = db.getDeviceName();
  if (!deviceName) {
    deviceName = "chrome";
    db.setDeviceName(deviceName);
  }

  return $.ajax({
    type: 'POST',
    url: constants.ChromeLoginUrl,
    data: {
      deviceId: db.getDeviceId(),
      pushToken: db.getGcmToken(),
      deviceName: deviceName
    }
  });
};

var refreshTokenIfRequired = function refreshTokenIfRequired() {
  var authToken = db.getAuthToken();
  //FTODO: if authToken is invalid jwt token - this breaks, handle error
  try {
    var decoded = jwtDecode(authToken);
    var currentTime = Date.now() / 1000;
    if (decoded.exp - currentTime < constants.FifteenDays) {
      //refresh requrired
      var reqObj = getRequestObj(constants.RefreshTokenApi, "POST", {});
      reqObj.success(function (data) {
        db.setAuthToken(data.authToken);
        util.gaEvent(gaEventCategory, "refreshTokenIfRequiredSuccess");
      });
      reqObj.fail(function (jqXHR, textStatus, error) {
        util.gaEvent(gaEventCategory, "refreshTokenIfRequiredFail");
        //ignore if fails
      });
    }
  } catch (err) {
    //Invalid jwt token , ignore
  }
};

function getAuthTokenAndLogin() {
  var deviceName = db.getDeviceName();
  if (!deviceName) {
    handleUnauthorizedRequest();
    return;
  }
  var reqObj = getLoginRequestObj();

  reqObj.success(function (data) {
    db.setAuthToken(data.authToken);
    db.setDirectedId(data.directedId);
    if (!db.isDefaultsSet()) {
      db.setDefualts();
    }

    chrome.browserAction.setPopup({ popup: 'html/main.html' });

    syncDeviceList(function (success) {
      if (success) {
        createContextMenus();
      }
    });
    syncBookmarkTags();

    createContextMenus();
    //Deactivate tab listener
    deactivateTabListener();
    util.setBadgeText(0);
    queueDb.updateViewedCount();
    util.gaEvent(gaEventCategory, "getAuthTokenAndLoginSuccess");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    handleUnauthorizedRequest();
    util.gaEvent(gaEventCategory, "getAuthTokenAndLoginFail");
  });
}

function onSuccessfulLoginListener(tabId, changeInfo, tab) {
  console.log(tab.url + " " + constants.HomePageUrl);
  if (changeInfo.status == "complete" && tab.url.indexOf(constants.HomePageUrl) > -1) {
    //User logged in , try to get auth token fro chrome
    getAuthTokenAndLogin();
    chrome.tabs.remove(tab.id, function () {});
  }
}

function activateTabListener() {
  console.log("activateTabListener called");
  chrome.tabs.onUpdated.addListener(onSuccessfulLoginListener);
}

function deactivateTabListener() {
  chrome.tabs.onUpdated.removeListener(onSuccessfulLoginListener);
}

var syncDeviceList = function syncDeviceList(callback) {
  var reqObj = getRequestObj(constants.DevicesApi, "GET", {});

  reqObj.success(function (json) {
    db.updateDevicesList(json.devices);
    callback(constants.Success);

    util.gaEvent(gaEventCategory, "syncDeviceListSuccess");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    callback(constants.Fail);
    util.gaEvent(gaEventCategory, "syncDeviceListFail", jqXHR.status);
  });
};

var logoutDeviceOnServerSide = function logoutDeviceOnServerSide() {
  var reqObj = getJsonPostRequestObj(constants.DevicesApi + "/" + db.getDeviceId(), { "action": constants.ActionLogout });
  reqObj.success(function (json) {
    util.gaEvent(gaEventCategory, "logoutDeviceOnServerSideSuccess");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    util.gaEvent(gaEventCategory, "logoutDeviceOnServerSideFail", jqXHR.status);
  });
};

var syncBookmarkTags = function syncBookmarkTags(callback) {
  var reqObj = getRequestObj(constants.TagsApi, "GET", {});
  reqObj.success(function (json) {
    db.updateBookmarkTags(json.tags);
    if (callback) {
      callback(constants.Success);
    }
    util.gaEvent(gaEventCategory, "syncBookmarkTagsSucces");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    if (callback) {
      callback(constants.Fail);
    }
    util.gaEvent(gaEventCategory, "syncBookmarkTagsFail", jqXHR.status);
  });
};

var addToQueueRequest = function addToQueueRequest(note, url, urlTitle, urlImage, urlIcon) {
  var data = {
    "note": note,
    "url": url,
    "urlTitle": urlTitle,
    "urImage": urlImage,
    "urlIcon": urlIcon
  };
  var reqObj = getJsonPostRequestObj(constants.QueueApi, data);
  reqObj.success(function (json) {
    util.showToastInTab(constants.QueueSuccessMessage);
    queueDb.addItem(json).then(function (result) {
      queueDb.updateViewedCount();
    }).catch(function (error) {});
    util.gaEvent(gaContextMenuEventCategory, "addToQueueSuccess");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    util.showToastInTab(constants.QueueFailedMessage);
    util.gaEvent(gaContextMenuEventCategory, "addToQueueFail", jqXHR.status);
  });
};

var addUrlToSharedRequest = function addUrlToSharedRequest(destination, note, content, urlTitle, urlImage, urlIcon, action) {
  var data = {
    "type": constants.TypeUrl,
    "note": note,
    "content": content,
    "urlTitle": urlTitle,
    "urImage": urlImage,
    "urlIcon": urlIcon,
    "destination": destination,
    "action": action
  };
  console.log("Sending data " + JSON.stringify(data));
  var reqObj = getJsonPostRequestObj(constants.SharedApi, data);
  reqObj.success(function (json) {
    util.showToastInTab(constants.SharedSuccessMessage);
    db.addToShared(json);
    util.gaEvent(gaContextMenuEventCategory, "addToSharedSuccess");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    util.showToastInTab(constants.SharedFailedMessage);
    util.gaEvent(gaContextMenuEventCategory, "addToSharedFail", jqXHR.status);
  });
};

var addToBookmarksRequest = function addToBookmarksRequest(note, url, urlTitle, urlImage, urlIcon) {
  var data = {
    "note": note,
    "url": url,
    "tagIds": [],
    "urlTitle": urlTitle,
    "urImage": urlImage,
    "urlIcon": urlIcon
  };
  var reqObj = getJsonPostRequestObj(constants.BookmarkApi, data);
  reqObj.success(function (json) {
    util.showToastInTab(constants.BookmarkSuccessMessage);
    bookmarksDb.addItem(json.bookmarkItem).then(function (result) {}).catch(function (error) {});
    util.gaEvent(gaContextMenuEventCategory, "saveBookmarkSuccess");
  });

  reqObj.fail(function (jqXHR, textStatus, error) {
    util.showToastInTab(constants.BookmarkFailedMessage);
    util.gaEvent(gaContextMenuEventCategory, "saveBookmarkFail", jqXHR.status);
  });
};

var activateCommandListener = function activateCommandListener() {
  chrome.commands.onCommand.addListener(function (command) {
    console.log("command fired " + command);
    if (command == "add-to-bookmarks") {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function (tabs) {
        if (db.getBoolean(constants.ShowBookmarkTagsDialog)) {
          util.showAddTagsDialog(db.getBookmarkTags());
        } else {
          var urlImage = "";
          chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {
              name: constants.MessageGetUrlImage
            }, function (vUrlImage) {
              urlImage = vUrlImage;
            });
          });
          setTimeout(addToBookmarksRequest(null, tabs[0].url, tabs[0].title, urlImage, tabs[0].favIconUrl), 250);
        }
      });
    } else if (command == "add-to-queue") {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function (tabs) {
        var urlImage = "";
        chrome.tabs.getSelected(null, function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            name: constants.MessageGetUrlImage
          }, function (vUrlImage) {
            urlImage = vUrlImage;
          });
        });
        setTimeout(addToQueueRequest("", tabs[0].url, tabs[0].title, urlImage, tabs[0].favIconUrl), 250);
      });
    }

    util.gaEvent(gaEventCategory, "onCommand", command);
  });
};

//FTODO: moving contextMenu fucntions here - as both are interlinked - seperate them after you solve cyclic dependency

function addToShared(info, tab) {
  var destination = info.menuItemId.split(";")[0];
  var action = info.menuItemId.split(';')[1];
  var url = info.pageUrl;
  var urlTitle = tab.title;
  var urlIcon = tab.favIconUrl;
  var urlImage = "";
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      name: constants.MessageGetUrlImage
    }, function (vUrlImage) {
      urlImage = vUrlImage;
    });
  });
  setTimeout(addUrlToSharedRequest(destination, null, url, urlTitle, urlImage, urlIcon, action), 250);
}

function addToSharedContextLink(info, tab) {
  console.log("addToSharedContextLink called " + info.linkUrl);
  var destination = info.menuItemId.split(";")[1];
  var action = info.menuItemId.split(';')[2];
  var url = info.linkUrl;
  var urlTitle = "";
  var urlIcon = "";
  var urlImage = "";

  addUrlToSharedRequest(destination, null, url, urlTitle, urlImage, urlIcon, action);
}

function addToQueue(info, tab) {
  console.log("Add to queue called");
  var url = info.pageUrl;
  var urlTitle = tab.title;
  var urlIcon = tab.favIconUrl;
  var urlImage = "";
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      name: constants.MessageGetUrlImage
    }, function (vUrlImage) {
      urlImage = vUrlImage;
    });
  });
  setTimeout(addToQueueRequest(null, url, urlTitle, urlImage, urlIcon), 350);
}

function addToQueueContextLink(info, tab) {
  console.log("addToQueueContextLink called " + info.linkUrl);
  var url = info.linkUrl;
  var urlTitle = "";
  var urlIcon = "";
  var urlImage = "";
  addToQueueRequest(null, url, urlTitle, urlImage, urlIcon);
}

function saveBookmark(info, tab) {
  console.log("saveBookmark called " + db.getBoolean(constants.ShowBookmarkTagsDialog));
  if (db.getBoolean(constants.ShowBookmarkTagsDialog)) {
    util.showAddTagsDialog(db.getBookmarkTags());
  } else {
    var url = info.pageUrl;
    var urlTitle = tab.title;
    var urlIcon = tab.favIconUrl;
    var urlImage = "";
    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, function (tabs) {
      chrome.tabs.sendMessage(tab[0].id, {
        name: constants.MessageGetUrlImage
      }, function (vUrlImage) {
        urlImage = vUrlImage;
      });
    });
    setTimeout(addToBookmarksRequest(null, url, urlTitle, urlImage, urlIcon), 350);
  }
}

function saveBookmarkContextLink(info, tab) {
  console.log("saveBookmarkContextLink called " + info.linkUrl);
  var url = info.linkUrl;
  var urlTitle = "";
  var urlIcon = "";
  var urlImage = "";
  addToBookmarksRequest(null, url, urlTitle, urlImage, urlIcon);
}

function showSettingsPage() {
  console.log("showSettingsPage called");
  chrome.tabs.create({ 'url': chrome.extension.getURL('html/settings.html'), 'active': true });
  util.gaEvent(gaContextMenuEventCategory, "showSettingsPage");
}

var createContextMenus = function createContextMenus() {
  console.log("Create contextMenus called");
  chrome.contextMenus.removeAll(function () {
    if (db.getBoolean(constants.ShowContextMenuQueue)) {
      chrome.contextMenus.create({ "id": "queue", "title": "View later", contexts: ["page"], "onclick": addToQueue });

      chrome.contextMenus.create({ "id": "queue;link", "title": "View later", contexts: ["link"], "onclick": addToQueueContextLink });
    }

    if (db.getBoolean(constants.ShowContextMenuBookmarks)) {
      chrome.contextMenus.create({ "id": "bookmark", "title": "Save as bookmark", contexts: ["page"], "onclick": saveBookmark });
      chrome.contextMenus.create({ "id": "bookmark;link", "title": "Save as bookmark", contexts: ["link"], "onclick": saveBookmarkContextLink });
    }

    var devicesList = db.getOtherDevicesList();
    if (devicesList.length > 1) {
      //FTODO: if the list of devices is null after skipping it show add to shared ?
      //FTODO
      /*
              chrome.contextMenus.create({
                "id": constants.AllDevices + ";",
                "title": "Send Url to All Devices",
                contexts: ["page"],
                "onclick": addToShared
              });
              */
    }
    var blockedDevicesList = db.getBlockedDeviceIds();

    for (var i = 0; i < devicesList.length; i++) {
      console.log(devicesList[i]);
      if (blockedDevicesList.indexOf(devicesList[i].itemId) > -1) {
        console.log("isBlocked");
        continue;
      }
      console.log("isNotBlocked");
      var deviceType = devicesList[i].type;
      //For all device types.
      chrome.contextMenus.create({
        "id": devicesList[i].itemId + ";",
        "title": "Send link to " + devicesList[i].name,
        contexts: ["page"],
        "onclick": addToShared
      });

      chrome.contextMenus.create({
        "id": "link;" + devicesList[i].itemId + ";",
        "title": "Send link to " + devicesList[i].name,
        contexts: ["link"],
        "onclick": addToSharedContextLink
      });

      if (deviceType == constants.AndroidDeviceType) {
        if (db.getBoolean(constants.ShowContextMenuSendToWhatsapp)) {
          chrome.contextMenus.create({
            "id": devicesList[i].itemId + ";" + constants.ActionWhatsapp,
            "title": "Send link to Whatsapp on " + devicesList[i].name,
            contexts: ["page"],
            "onclick": addToShared
          });
        }

        if (db.getBoolean(constants.ShowContextMenuOpenOnPhone)) {
          chrome.contextMenus.create({
            "id": devicesList[i].itemId + ";" + constants.ActionOpenUrl,
            "title": "Open link on " + devicesList[i].name,
            contexts: ["page"],
            "onclick": addToShared
          });
        }
      }
    }

    chrome.contextMenus.create({
      "id": "settings",
      "title": "Settings",
      contexts: ["all"],
      "onclick": showSettingsPage
    }, function () {
      console.log("settings error:" + chrome.runtime.lastError);
    });
    util.gaEvent(gaContextMenuEventCategory, "createContextMenus");
  });
};

module.exports = {
  syncDeviceList: syncDeviceList,
  getRequestObj: getRequestObj,
  getJsonPostRequestObj: getJsonPostRequestObj,
  getLoginRequestObj: getLoginRequestObj,
  getAuthTokenAndLogin: getAuthTokenAndLogin,
  syncBookmarkTags: syncBookmarkTags,
  activateCommandListener: activateCommandListener,
  refreshTokenIfRequired: refreshTokenIfRequired,
  activateTabListener: activateTabListener,
  createContextMenus: createContextMenus,
  logoutUser: logoutUser,
  handleUnauthorizedRequest: handleUnauthorizedRequest
};

},{"./bookmarksDb.js":3,"./constants.js":4,"./db.js":5,"./notify.js":7,"./queueDb.js":8,"./util.js":9,"jwt-decode":13}],3:[function(require,module,exports){
'use strict';

var Dexie = require("dexie");
var db = require('./db.js');
var util = require('./util.js');
var constants = require('./constants.js');
var gaEventCategory = "bookmarksDb";

var bookmarkDb = new Dexie("Bookmarks");
var joinChar = "fds{|}";

function setup() {
  try {
    bookmarkDb.version(1).stores({
      bookmarks: "itemId,url,created,updated"
    });
  } catch (err) {
    console.log(err);
  }

  bookmarkDb.open().catch(function (error) {
    console.log("error " + error);
  });
}

function addItem(bookmarkItem, callback) {
  bookmarkItem.searchText = getSearchText(bookmarkItem);
  return new Promise(function (resolve, reject) {
    bookmarkDb.bookmarks.put(bookmarkItem).then(function (result) {
      resolve(result);
      broadcastBookmarksUpdatedMessage();
    }).catch(function (error) {
      reject(error);
    });
  });
}

function deleteItem(itemId) {
  return new Promise(function (resolve, reject) {
    bookmarkDb.bookmarks.delete(itemId).then(function (result) {
      resolve(result);
      broadcastBookmarksUpdatedMessage();
    }).catch(function (error) {
      reject(error);
    });
  });
}

function bulkInsert(bookmarkItems, callback) {
  bookmarkDb.transaction('rw', bookmarkDb.bookmarks, function () {
    for (var i = 0; i < bookmarkItems.length; i++) {
      var bookmarkItem = bookmarkItems[i];
      bookmarkItem.searchText = getSearchText(bookmarkItem);
      bookmarkDb.bookmarks.put(bookmarkItem).catch(function (err) {
        db.setBookmarksLastUpdatedTimestamp(0);
        callback(constants.Fail, constants.DatabaseErr, err);
      });
    }
  }).then(function (result) {
    broadcastBookmarksUpdatedMessage();
    callback(constants.Success);
  }).catch(function (err) {
    db.setBookmarksLastUpdatedTimestamp(0);
    callback(constants.Fail, constants.DatabaseErr, err);
    util.gaEvent(gaEventCategory, "bulkInsertFail");
  });
}

function bulkInsertBasedOnUpdateAction(bookmarkItems, callback) {
  bookmarkDb.transaction('rw', bookmarkDb.bookmarks, function () {
    for (var i = 0; i < bookmarkItems.length; i++) {
      var bookmarkItem = bookmarkItems[i];

      if (bookmarkItem.updateAction != "D") {
        bookmarkItem.searchText = getSearchText(bookmarkItem);
        bookmarkDb.bookmarks.put(bookmarkItem).catch(function (err) {
          db.setBookmarksLastUpdatedTimestamp(0);
          callback(constants.Fail, constants.DatabaseErr, err);
        });
      } else {
        bookmarkDb.bookmarks.delete(bookmarkItem.itemId).catch(function (err) {
          db.setBookmarksLastUpdatedTimestamp(0);
          callback(constants.Fail, constants.DatabaseErr, err);
        });
      }
    }
  }).then(function (result) {
    callback(constants.Success);
    broadcastBookmarksUpdatedMessage();
  }).catch(function (err) {
    db.setBookmarksLastUpdatedTimestamp(0);
    callback(constants.Fail, constants.DatabaseErr, err);
    util.gaEvent(gaEventCategory, "bulkInsertOnUpdateActionFail");
  });
}

function getAll(callback) {
  bookmarkDb.bookmarks.orderBy('created').reverse().toArray(function (bookmarks) {
    callback(constants.Success, bookmarks);
  }).catch(function (err) {
    console.log(err);
    callback(constants.Fail, constants.DatabaseErr, err);
  });
}

function getItemsWithUrlPrefix(prefix) {
  return bookmarkDb.bookmarks.where('url').startsWithIgnoreCase(prefix);
}

function getSearchText(bookmarkItem) {
  var searchText = bookmarkItem.note + joinChar + bookmarkItem.url + joinChar + bookmarkItem.urlTitle + joinChar + bookmarkItem.urlImage;
  return searchText.toLowerCase();
}

function deleteAll() {
  return bookmarkDb.bookmarks.clear();
}

function broadcastBookmarksUpdatedMessage() {
  if (chrome.tabs) {
    chrome.tabs.query({ url: "*://github.com/*" }, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.sendMessage(tabs[i].id, { name: constants.MessageBookmarksUpdated });
      }
    });
  }
}

module.exports = {
  setup: setup,
  bookmarkDb: bookmarkDb,
  addItem: addItem,
  deleteItem: deleteItem,
  getAll: getAll,
  getItemsWithUrlPrefix: getItemsWithUrlPrefix,
  deleteAll: deleteAll,
  bulkInsert: bulkInsert,
  bulkInsertBasedOnUpdateAction: bulkInsertBasedOnUpdateAction
};

},{"./constants.js":4,"./db.js":5,"./util.js":9,"dexie":10}],4:[function(require,module,exports){
"use strict";

var ApiEndpoint = "https://api.voblet.com";
//var ApiEndpoint = "http://localhost:3000";
var WebsiteEndPoint = "https://voblet.com";
//var WebsiteEndPoint = "http://localhost:5000";
var Firefox = "Firefox";
var Chrome = "Chrome";

module.exports = Object.freeze({
  GoogleProjectNumber: "594496440754",
  GoogleAnalyticsCode: "UA-86885186-3",
  SessionApi: ApiEndpoint + '/v1/session',
  SharedApi: ApiEndpoint + '/v1/shared',
  QueueApi: ApiEndpoint + '/v1/queue',
  BookmarkApi: ApiEndpoint + '/v1/bookmark',
  BookmarkBulkApi: ApiEndpoint + '/v1/bookmarkbulk',
  DevicesApi: ApiEndpoint + '/v1/devices',
  TagsApi: ApiEndpoint + '/v1/tags',

  Firefox: Firefox,
  Chrome: Chrome,

  ChromeLoginUrl: WebsiteEndPoint + '/chromelogin',
  WebsiteLoginPageUrl: WebsiteEndPoint + '/login',
  HomePageUrl: WebsiteEndPoint + '/home',
  RefreshTokenApi: WebsiteEndPoint + '/refreshtoken',

  LoginPageUrl: chrome.extension.getURL("html/login.html"),
  SettingsPageUrl: chrome.extension.getURL("html/settings.html"),
  MainPageUrl: chrome.extension.getURL("html/main.html"),
  VobletPageUrl: chrome.extension.getURL("html/voblet.html"),

  MainTag: "main-tag",

  errorImage: "errorImage.png",

  AuthTokenKey: "authToken",

  Tendays: 864000,
  OneDay: 86400,
  HalfDay: 43200,
  FifteenDays: 1296000,
  Indefinite: 3600000,

  FiveMinutesInMs: 300000,
  TenMinutesInMs: 600000,

  ListSelectedColor: "rgba(0, 0, 0, 0.2)",
  BodyColor: "#ededed",
  BlackColor: "#000",

  QueueResponseCount: 200,
  BookmarkResponseCount: 200,
  MaxSessionsLimit: 20,
  UpdatedSinceCountPerRequest: 200,
  SharedResponseCount: 30,
  NoteMaxLength: 200,
  BookmarkTagMaxLength: 25,
  SessionNameMaxLength: 50,
  TagsMaxCount: 50,
  MaxUrlsInASession: 40,

  ActionGetUpdatedSince: "get_updated_since",
  ActionGetAfter: "get_after",
  ActionMarkAsViewed: "mark_as_viewed",
  ActionMarkAsNotViewed: "mark_as_not_viewed",
  ActionLogout: "logout",

  RefreshContextMenu: "refreshContextMenu",
  LoginNotificationId: "loginNotification",

  ShowContextMenuDevices: "contextMenuDevices",
  ShowContextMenuQueue: "contextMenuQueue",
  ShowContextMenuBookmarks: "contextMenuBookmarks",
  ShowContextMenuSendToWhatsapp: "contextMenuSendToWhatsapp",
  ShowContextMenuOpenOnPhone: "contextMenuOpenOnPhone",
  ShowBookmarkTagsDialog: "showBookmarkTagsDialog",
  ShowBookmarksOptionsKey: "showBookmarksOptionsKey",
  GithubSavedCountKey: "githubSavedCount",

  DisplayNotificationsKey: "displayNotificationsKey",
  QueueOpenNewTabKey: "queueOpenNewTabKey",
  SharedNotificationsKey: "sharedNotificationsKey",
  SharedOpenNewTabKey: "sharedOpenNewTabKey",
  BookmarksLastUpdateTimestamp: "bookmarksLastUpdateTimestamp",
  QueueLastUpdateTimestamp: "queueLastUpdateTimestamp",
  ShowMarkAsViewedKey: "showMarkAsViewed",
  //FTODO: implement this in settings page , default true and in v2 should be part of user settings which propagates to other devices
  DeleteAfterMoveToBookmarks: "deleteAfterMoveToBookmarks",
  GithubFirstTimeUserKey: "githubFirstTimeUserKey",

  ActionWhatsapp: "whatsapp",
  ActionOpenUrl: "openUrl",
  ActionFavoriteBookmark: "favorite",
  ActionUnfavoriteBookmark: "unfavorite",
  ActionUpdateTags: "update_tags",

  RecentFirst: "recentFirst",
  OldestFirst: "oldestFirst",
  ShowViewedItems: "showViewedItems",
  ShowQueue: "showQueue",

  BookmarkSuccessMessage: "Bookmark saved",
  BookmarkFailedMessage: "Failed to save Bookmark.Please try again.",
  QueueSuccessMessage: "Added to View later",
  QueueFailedMessage: "Failed to add.Please try again.",
  SharedSuccessMessage: "Sent successfully",
  SharedFailedMessage: "Failed to send.Please try again.",
  RequestFailedMessage: "Request failed.Please try again.",

  ContentScriptYoutube: "contentScriptYoutube",
  ContentScriptGithub: "contentScriptGithub",

  TypeUrl: "url",
  TypeText: "text",
  AllDevices: "all",

  GCMTypeQueue: "queue",
  GCMTypeShared: "shared",
  GCMTypeTagsUpdate: "tags_update",
  GCMTypeDevicesUpdate: "devices_update",
  GCMTypeLogout: "logout",

  InvalidInputDataErr: "invalid_input_data",
  MissingRequiredFieldsErr: "missing_required_fields",

  MessageShowToast: "showToast",
  MessageShowAddTagsDialog: "messageShowAddTagsDialog",
  MessageCloseAddTagsDialog: "messageCloseAddTagsDialog",
  MessageGetOpenTabUrls: "getOpenTabUrls",
  MessageAddBookmark: "messageAddBookmark",
  MessageUpdateBookmark: "messageUpdateBookmark",
  MessageDeleteBookmark: "messageDeleteBookmark",
  MessageAddToQueue: "addToQueue",
  MessageDeleteFromQueue: "deleteFromQueue",
  ResponseOpenTabUrls: "responseOpenTabUrls",
  MessageActivateTabListener: "activateTabListener",
  MessageGetUrlImage: "getUrlImage",
  MessageGetQueueItem: "getQueueItem",
  MessageMarkAsViewed: "markAsViewed",
  MessageGetBookmarkTags: "getBookmarkTags",
  MessageGetGithubLinksInQueue: "getGithubLinksInQueue",
  MessageGetGithubLinksInBookmarks: "getGithubLinksInBookmarks",
  MessageGetValueLocalDb: "getValueLocalDb",
  MessageSetValueLocalDb: "setValueLocalDb",
  MessageBookmarksUpdated: "bookmarksUpdated",
  MessageQueueUpdated: "queueUpdated",
  MessageOpenUrlInRightNav: "openUrlInRightNav",
  MessageGAEvent: "gaEvent",

  GithubPrefix: "https://github.com",

  GetBookmarksAndTags: "GetBookmarksAndTags",
  SyncBookmarks: "SyncBookmarks",

  AndroidDeviceType: "android",
  Success: true,
  Fail: false,

  DatabaseErr: "databaseErr",
  NetworkErr: "networkErr",
  GCMErrorKey: "gcmErrorKey",

  TwitterIcon: "../img/twitter_icon.png",
  FacebookIcon: "../img/fb_icon.png",
  YoutubeIcon: "../img/youtube_icon.png"
});

},{}],5:[function(require,module,exports){
"use strict";

var constants = require('./constants.js');

var GcmTokenKey = "gcmToken";
var DeviceIdKey = "deviceId";
var DeviceNameKey = "deviceName";
var DeviceListKey = "deviceList";
var DirectedIdKey = "directedId";
var SessionsKey = "sessions";
var QueueKey = "queue";
var SharedKey = "shared";
var BlockedDevicesKey = "blockedDevices";
var BookmarkTagsKey = "bookmarkTags";
var DefaultsSetKey = "defaultsSet";

function getJsonData(key) {
  var data = localStorage.getItem(key);
  if (data == null) {
    return [];
  } else {
    return JSON.parse(data);
  }
}

function setJsonData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

var getItem = function getItem(key) {
  return localStorage.getItem(key);
};

var setItem = function setItem(key, value) {
  localStorage.setItem(key, value);
};

var getBoolean = function getBoolean(key) {
  var value = localStorage.getItem(key);
  if (value == "true") {
    return true;
  } else {
    return false;
  }
};

var setBoolean = function setBoolean(key, value) {
  localStorage.setItem(key, value);
};

var getAuthToken = function getAuthToken() {
  return localStorage.getItem(constants.AuthTokenKey);
};

var setAuthToken = function setAuthToken(authToken) {
  localStorage.setItem(constants.AuthTokenKey, authToken);
};

var getGcmToken = function getGcmToken() {
  return localStorage.getItem(GcmTokenKey);
};

var setGcmToken = function setGcmToken(registrationId) {
  localStorage.setItem(GcmTokenKey, registrationId);
  localStorage.setItem(constants.GCMErrorKey, "");
};

var getDeviceId = function getDeviceId() {
  return localStorage.getItem(DeviceIdKey);
};

var setDeviceId = function setDeviceId(deviceId) {
  localStorage.setItem(DeviceIdKey, deviceId);
};
var getDirectedId = function getDirectedId() {
  return localStorage.getItem(DirectedIdKey);
};

var setDirectedId = function setDirectedId(directedId) {
  localStorage.setItem(DirectedIdKey, directedId);
};

var getDeviceName = function getDeviceName() {
  console.log("device name is " + localStorage.getItem(DeviceNameKey));
  return localStorage.getItem(DeviceNameKey);
};

var setDeviceName = function setDeviceName(deviceName) {
  localStorage.setItem(DeviceNameKey, deviceName);
};

var getBookmarksLastUpdatedTimestamp = function getBookmarksLastUpdatedTimestamp() {
  var timestamp = Number(localStorage.getItem(constants.BookmarksLastUpdateTimestamp));
  if (isNaN(timestamp)) {
    return 0;
  } else {
    return timestamp;
  }
};

var setBookmarksLastUpdatedTimestamp = function setBookmarksLastUpdatedTimestamp(timestamp) {
  localStorage.setItem(constants.BookmarksLastUpdateTimestamp, timestamp);
};

var getQueueLastUpdatedTimestamp = function getQueueLastUpdatedTimestamp() {
  var timestamp = Number(localStorage.getItem(constants.QueueLastUpdateTimestamp));
  if (isNaN(timestamp)) {
    return 0;
  } else {
    return timestamp;
  }
};

var setQueueLastUpdatedTimestamp = function setQueueLastUpdatedTimestamp(timestamp) {
  localStorage.setItem(constants.QueueLastUpdateTimestamp, timestamp);
};

var getDevicesList = function getDevicesList() {
  return getJsonData(DeviceListKey);
};

var updateDevicesList = function updateDevicesList(newData) {
  if (!newData) {
    setJsonData(DeviceListKey, []);
  } else {
    setJsonData(DeviceListKey, newData);
  }
};

var getOtherDevicesList = function getOtherDevicesList() {
  var data = getJsonData(DeviceListKey);
  var deviceId = localStorage.getItem(DeviceIdKey);
  var newData = data.filter(function (el) {
    return el.itemId != deviceId;
  });
  return newData;
};

var getBlockedDeviceIds = function getBlockedDeviceIds() {
  return getJsonData(BlockedDevicesKey);
};

var addBlockedDeviceIds = function addBlockedDeviceIds(deviceId) {
  var data = getJsonData(BlockedDevicesKey);
  data.push(deviceId);
  //remove duplicates if present
  data = data.filter(function (value, index, array) {
    return array.indexOf(value) == index;
  });
  setJsonData(BlockedDevicesKey, data);
};

var removeBlockedDeviceIds = function removeBlockedDeviceIds(deviceId) {
  var data = getJsonData(BlockedDevicesKey);
  var index = data.indexOf(deviceId);
  if (index > -1) {
    data.splice(index, 1);
  }
  setJsonData(BlockedDevicesKey, data);
};

var setDefualts = function setDefualts() {
  if (!isDefaultsSet()) {
    localStorage.setItem(constants.DisplayNotificationsKey, true);
    localStorage.setItem(constants.ShowBookmarkTagsDialog, true);
    localStorage.setItem(constants.QueueNotificationsKey, true);
    localStorage.setItem(constants.SharedNotificationsKey, true);

    localStorage.setItem(constants.QueueOpenNewTabKey, false);
    localStorage.setItem(constants.SharedOpenNewTabKey, true);

    localStorage.setItem(constants.ShowMarkAsViewedKey, true);

    localStorage.setItem(constants.ShowContextMenuDevices, true);
    localStorage.setItem(constants.ShowContextMenuBookmarks, true);
    localStorage.setItem(constants.ShowContextMenuQueue, true);
    localStorage.setItem(constants.GithubFirstTimeUserKey, true);

    localStorage.setItem(DefaultsSetKey, true);
  }
};

var setGithubFeatureDefaults = function setGithubFeatureDefaults() {
  if (getItem(constants.GithubFirstTimeUserKey) == undefined) {
    setItem(constants.GithubFirstTimeUserKey, true);
  }
};

var emptyLocalStorage = function emptyLocalStorage() {
  localStorage.clear();
};

var getQueueData = function getQueueData() {
  return getJsonData(QueueKey);
};

var addToQueue = function addToQueue(queueItem) {
  var isPresent = false;
  var currentData = getJsonData(QueueKey);
  for (var i = 0; i < currentData.length; i++) {
    if (currentData[i].itemId == queueItem.itemId) {
      isPresent == true;
      break;
    }
  }
  if (isPresent == false) {
    currentData.unshift(queueItem);
    setJsonData(QueueKey, currentData);
  }
};

var updateQueueData = function updateQueueData(newData) {
  if (!newData) {
    setJsonData(QueueKey, []);
  } else {
    setJsonData(QueueKey, newData);
  }
};

var deleteFromQueue = function deleteFromQueue(itemId) {
  var currentData = getJsonData(QueueKey);
  var newData = currentData.filter(function (el) {
    return el.itemId != itemId;
  });
  setJsonData(QueueKey, newData);
};

var getSessionsData = function getSessionsData() {
  return getJsonData(SessionsKey);
};

var addToSessions = function addToSessions(sessionItem) {
  var isPresent = false;
  var currentData = getJsonData(SessionsKey);
  for (var i = 0; i < currentData.length; i++) {
    if (currentData[i].itemId == sessionItem.itemId) {
      isPresent == true;
      break;
    }
  }
  if (isPresent == false) {
    currentData.unshift(sessionItem);
    setJsonData(SessionsKey, currentData);
  }
};

var updateSessionsData = function updateSessionsData(newData) {
  if (!newData) {
    setJsonData(SessionsKey, []);
  } else {
    setJsonData(SessionsKey, newData);
  }
};

var deleteFromSessions = function deleteFromSessions(itemId) {
  var currentData = getJsonData(SessionsKey);
  var newData = currentData.filter(function (el) {
    return el.itemId != itemId;
  });
  setJsonData(SessionsKey, newData);
};

var getSharedData = function getSharedData() {
  return getJsonData(SharedKey);
};

var getSharedItem = function getSharedItem(itemId) {
  var currentData = getJsonData(SharedKey);
  for (var i = 0; i < currentData.length; i++) {
    if (currentData[i].itemId == itemId) {
      return currentData[i];
    }
  }
  return undefined;
};

var addToShared = function addToShared(sharedItem) {
  var isPresent = false;
  var currentData = getJsonData(SharedKey);
  for (var i = 0; i < currentData.length; i++) {
    if (currentData[i].itemId == sharedItem.itemId) {
      isPresent == true;
      break;
    }
  }
  if (isPresent == false) {
    currentData.unshift(sharedItem);
    setJsonData(SharedKey, currentData);
  }
};

var updateSharedData = function updateSharedData(newData) {
  if (!newData) {
    setJsonData(SharedKey, []);
  } else {
    setJsonData(SharedKey, newData);
  }
};

var deleteFromShared = function deleteFromShared(itemId) {
  var currentData = getJsonData(SharedKey);
  var newData = currentData.filter(function (el) {
    return el.itemId != itemId;
  });
  setJsonData(SharedKey, newData);
};

var getBookmarkTags = function getBookmarkTags() {
  var tags = getJsonData(BookmarkTagsKey);
  tags.sort(function (a, b) {
    var nameA = a.name.toLowerCase(),
        nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0; //no sorting
  });
  return tags;
};

var addBookmakTag = function addBookmakTag(item) {
  var isPresent = false;
  var currentData = getJsonData(BookmarkTagsKey);
  var newData = currentData.filter(function (el) {
    return el.itemId != item.itemId;
  });
  if (!newData) {
    newData = [];
  }
  newData.unshift(item);
  setJsonData(BookmarkTagsKey, newData);
};

var updateBookmarkTags = function updateBookmarkTags(newData) {
  if (!newData) {
    setJsonData(BookmarkTagsKey, []);
  } else {
    setJsonData(BookmarkTagsKey, newData);
  }
};

var deleteBookmarkTag = function deleteBookmarkTag(itemId) {
  var currentData = getJsonData(BookmarkTagsKey);
  var newData = currentData.filter(function (el) {
    return el.itemId != itemId;
  });
  setJsonData(BookmarkTagsKey, newData);
};

var isDefaultsSet = function isDefaultsSet() {
  return getBoolean(DefaultsSetKey);
};

module.exports = {
  getItem: getItem,
  setItem: setItem,
  getBoolean: getBoolean,
  setBoolean: setBoolean,
  getAuthToken: getAuthToken,
  setAuthToken: setAuthToken,
  getGcmToken: getGcmToken,
  setGcmToken: setGcmToken,
  getDeviceId: getDeviceId,
  setDeviceId: setDeviceId,
  getDirectedId: getDirectedId,
  setDirectedId: setDirectedId,
  getDeviceName: getDeviceName,
  setDeviceName: setDeviceName,
  emptyLocalStorage: emptyLocalStorage,
  getDevicesList: getDevicesList,
  getOtherDevicesList: getOtherDevicesList,
  updateDevicesList: updateDevicesList,
  setDefualts: setDefualts,
  isDefaultsSet: isDefaultsSet,
  getSessionsData: getSessionsData,
  addToSessions: addToSessions,
  updateSessionsData: updateSessionsData,
  deleteFromSessions: deleteFromSessions,

  getSharedItem: getSharedItem,
  getSharedData: getSharedData,
  addToShared: addToShared,
  updateSharedData: updateSharedData,
  deleteFromShared: deleteFromShared,

  getBookmarksLastUpdatedTimestamp: getBookmarksLastUpdatedTimestamp,
  setBookmarksLastUpdatedTimestamp: setBookmarksLastUpdatedTimestamp,

  getQueueLastUpdatedTimestamp: getQueueLastUpdatedTimestamp,
  setQueueLastUpdatedTimestamp: setQueueLastUpdatedTimestamp,

  getBookmarkTags: getBookmarkTags,
  addBookmakTag: addBookmakTag,
  updateBookmarkTags: updateBookmarkTags,
  deleteBookmarkTag: deleteBookmarkTag,

  getBlockedDeviceIds: getBlockedDeviceIds,
  addBlockedDeviceIds: addBlockedDeviceIds,
  removeBlockedDeviceIds: removeBlockedDeviceIds,

  setGithubFeatureDefaults: setGithubFeatureDefaults
};

},{"./constants.js":4}],6:[function(require,module,exports){
'use strict';

var constants = require('./constants.js');
var api = require('./api.js');
var db = require('./db.js');
var bookmarksDb = require('./bookmarksDb.js');
var queueDb = require('./queueDb.js');
var util = require('./util.js');
var gaEventCategory = "message";

var activateListener = function activateListener() {
  console.log("activateListener called");
  if (util.getBrowser() == constants.Firefox) {
    browser.runtime.onMessage.addListener(handleMessage);
  } else {
    chrome.extension.onMessage.addListener(handleMessage);
  }
};

function handleMessage(request, sender, sendResponse) {
  console.log("Message received " + JSON.stringify(request));
  if (request.name == constants.MessageGetOpenTabUrls) {
    sendUrlListOfTabs();
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.RefreshContextMenu) {
    api.createContextMenus();
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageAddBookmark) {
    //FTODO: move this fucntion to another package
    var reqObj = api.getJsonPostRequestObj(constants.BookmarkApi, request.data);
    reqObj.success(function (json) {
      console.log("got response " + JSON.stringify(json));
      bookmarksDb.addItem(json.bookmarkItem, function () {
        //Ignore if this fails
      });
      if (json.newTagItems) {
        for (var i = 0; i < json.newTagItems.length; i++) {
          db.addBookmakTag(json.newTagItems[i]);
        }
      }
      //FTODO: some tags addition might have failed , but silently ignoring for now. resolve this as quickly as possible
      sendResponse({
        status: constants.Success,
        bookmarkItem: json.bookmarkItem,
        newTagItems: json.newTagItems
      });
    });
    reqObj.fail(function (jqXHR, textStatus, error) {
      sendResponse({ status: constants.Fail });
    });
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageUpdateBookmark) {
    //FTODO: write common fucntion for all api requests
    var reqObj = api.getJsonPostRequestObj(constants.BookmarkApi + "/" + request.itemId, request.data);
    reqObj.success(function (json) {
      console.log("got response " + JSON.stringify(json));
      bookmarksDb.addItem(json.bookmarkItem, function () {
        //Ignore if this fails
      });
      if (json.newTagItems) {
        for (var i = 0; i < json.newTagItems.length; i++) {
          db.addBookmakTag(json.newTagItems[i]);
        }
      }
      //FTODO: some tags addition might have failed , but silently ignoring for now. resolve this as quickly as possible
      sendResponse({
        status: constants.Success,
        bookmarkItem: json.bookmarkItem,
        newTagItems: json.newTagItems
      });
    });
    reqObj.fail(function (jqXHR, textStatus, error) {
      sendResponse({ status: constants.Fail });
    });
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageDeleteBookmark) {
    var new_request;

    (function () {
      var itemId = request.data.itemId;
      new_request = api.getRequestObj(constants.BookmarkApi + "/" + itemId, "DELETE", {});

      new_request.success(function (json) {
        bookmarksDb.deleteItem(itemId).then(function (result) {}).catch(function (error) {});
        sendResponse({ status: constants.Success });
        util.gaEvent(gaEventCategory, 'deleteBookmarkSuccess');
      });
      new_request.fail(function (jqXHR, textStatus, error) {
        sendResponse({ status: constants.Fail });
      });
      util.gaEvent(gaEventCategory, request.name);
    })();
  } else if (request.name == constants.MessageAddToQueue) {
    var reqObj = api.getJsonPostRequestObj(constants.QueueApi, request.data);
    reqObj.success(function (queueItem) {
      queueDb.addItem(queueItem).then(function (result) {
        queueDb.updateViewedCount();
      }).catch(function (error) {
        console.log(error);
      });
      sendResponse({ status: constants.Success, queueItem: queueItem });
    });
    reqObj.fail(function (jqXHR, textStatus, error) {
      sendResponse({ status: constants.Fail });
    });
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageDeleteFromQueue) {
    var new_request;

    (function () {
      var itemId = request.data.itemId;
      new_request = api.getRequestObj(constants.QueueApi + "/" + itemId, "DELETE", {});

      new_request.success(function (json) {
        queueDb.deleteItem(itemId).then(function (result) {
          queueDb.updateViewedCount();
        }).catch(function (error) {});
        sendResponse({ status: constants.Success });
        util.gaEvent(gaEventCategory, 'deleteQueueSuccess');
      });
      new_request.fail(function (jqXHR, textStatus, error) {
        sendResponse({ status: constants.Fail });
      });
      util.gaEvent(gaEventCategory, request.name);
    })();
  } else if (request.name == constants.MessageActivateTabListener) {
    api.activateTabListener();
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageGetQueueItem) {
    if (db.getAuthToken() && db.getBoolean(constants.ShowMarkAsViewedKey)) {
      queueDb.getItemByUrl(request.data.url).toArray(function (queueItems) {
        if (queueItems.length > 0) {
          console.log(queueItems[0]);
          sendResponse(queueItems[0]);
        } else {
          sendResponse(undefined);
        }
      });
    } else {
      sendResponse(undefined);
    }
  } else if (request.name == constants.MessageMarkAsViewed) {
    var queueItem = request.data;
    if (queueItem && queueItem.itemId) {
      var data = {
        action: constants.ActionMarkAsViewed
      };
      var new_request = api.getJsonPostRequestObj(constants.QueueApi + "/" + queueItem.itemId, data);
      new_request.success(function (json) {
        util.gaEvent(gaEventCategory, 'markAsViewSuccess');
        sendResponse(200);
        queueDb.addItem(json).then(function (result) {
          queueDb.updateViewedCount();
        });
      });
      new_request.fail(function (jqXHR, textStatus, error) {
        sendResponse(jqXHR.status);
        util.gaEvent(gaEventCategory, 'markAsViewFail');
      });
    }
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageGetBookmarkTags) {
    sendResponse(db.getBookmarkTags());
  } else if (request.name == constants.MessageGetGithubLinksInQueue) {
    queueDb.getItemsWithUrlPrefix(constants.GithubPrefix).toArray(function (queueItems) {
      sendResponse(queueItems);
    });
  } else if (request.name == constants.MessageGetGithubLinksInBookmarks) {
    bookmarksDb.getItemsWithUrlPrefix(constants.GithubPrefix).toArray(function (bookmarks) {
      sendResponse(bookmarks);
    });
  } else if (request.name == constants.MessageOpenUrlInRightNav) {
    //pass the request to current open tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, request);
    });
  } else if (request.name == constants.MessageGetValueLocalDb) {
    sendResponse(db.getItem(request.key));
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageSetValueLocalDb) {
    sendResponse(db.setItem(request.key, request.value));
    util.gaEvent(gaEventCategory, request.name);
  } else if (request.name == constants.MessageGAEvent) {
    util.gaEvent(request.eventCategory, request.eventAction);
  }
  return true;
}

function sendUrlListOfTabs(callback) {
  chrome.tabs.query({
    "currentWindow": true
  }, function (tabs) {
    console.log("list of tabs is " + tabs);
    var urls = [];
    for (var i = 0; i < tabs.length; i++) {
      urls.push(tabs[i].url);
    }
    chrome.extension.sendMessage({
      "message": constants.ResponseOpenTabUrls,
      "data": urls
    }, function () {});
  });
}

module.exports = {
  activateListener: activateListener
};

},{"./api.js":2,"./bookmarksDb.js":3,"./constants.js":4,"./db.js":5,"./queueDb.js":8,"./util.js":9}],7:[function(require,module,exports){
'use strict';

var constants = require('./constants.js');
var db = require('./db.js');
var util = require('./util.js');
var queueDb = require('./queueDb.js');

var QueueNotificationTitle = "New link added to View later";
var SharedNotificationUrlTitle = "Received a link";
var SharedNotificationTextTitle = "Received a text";
var gaEventCategory = "notify";

var activateGCMListener = function activateGCMListener() {
  var hasListeners = chrome.gcm.onMessage.hasListeners();
  console.log("hasListeners:" + hasListeners);
  if (!hasListeners) {
    chrome.gcm.onMessage.addListener(function (message) {
      console.log("gcm message - " + JSON.stringify(message));
      //Check if device is logged in
      if (db.getAuthToken() && db.getAuthToken().length > 0) {
        var msgObj = message.data;
        var message;
        if (msgObj.message) {
          message = JSON.parse(msgObj.message);
        }
        if (db.getDirectedId() == msgObj.directedId) {
          handleGcmMessage(msgObj.type, msgObj.action, message);
        } else {
          console.log("Directed id not equal " + msgObj.directedId);
        }
      }
    });

    //Setup notifications click listeners too
    chrome.notifications.onClicked.addListener(handleNotificationClick);
    chrome.notifications.onButtonClicked.addListener(handleNotificationClick);
  }
};
//FTODO: after solving cyclic dependency use common fucntion
var getRequestObj = function getRequestObj(url, reqType, data) {
  return $.ajax({
    url: url,
    type: reqType,
    beforeSend: function beforeSend(request) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(constants.AuthTokenKey));
    },
    data: data
  });
};

var handleGcmMessage = function handleGcmMessage(type, action, item) {
  util.gaEvent(gaEventCategory, 'handleGcmMessage', type);
  if (type == constants.GCMTypeQueue) {
    handleQueueGCM(action, item);
    return;
  } else if (type == constants.GCMTypeShared) {
    handleSharedGCM(action, item);
    return;
  } else if (type == constants.GCMTypeTagsUpdate) {
    var reqObj = getRequestObj(constants.TagsApi, "GET", {});
    reqObj.success(function (json) {
      db.updateBookmarkTags(json.tags);
      util.gaEvent(gaEventCategory, "syncBookmarkTagsSucces");
    });

    reqObj.fail(function (jqXHR, textStatus, error) {
      util.gaEvent(gaEventCategory, "syncBookmarkTagsFail", jqXHR.status);
    });
  } else if (type == constants.GCMTypeDevicesUpdate) {
    var reqObj = getRequestObj(constants.DevicesApi, "GET", {});
    reqObj.success(function (json) {
      db.updateDevicesList(json.devices);
      //FTODO: update context menu
      util.gaEvent(gaEventCategory, "syncDeviceListSuccess");
    });
    reqObj.fail(function (jqXHR, textStatus, error) {
      util.gaEvent(gaEventCategory, "syncBookmarkTagsFail", jqXHR.status);
    });
  } else if (type == constants.GCMTypeLogout) {
    //FTODO
    //api.logoutUser();
  }
};

var handleQueueGCM = function handleQueueGCM(action, item) {
  console.log("queueDb is " + queueDb.getItem + " " + queueDb.addItem);
  var currentTime = Date.now();
  //FTODO: this get item fucntion is not working. make it work fast[BUG]
  queueDb.getItem(item.itemId).then(function (result) {
    queueDb.addItem(item).then(function (result) {
      queueDb.updateViewedCount();
    }).catch(function (error) {
      //ignore
    });

    if (result != undefined) {
      showQueueNotification(item);
    } else {
      //FTODO: test this
      if (result.created != item.created) {
        showQueueNotification(item);
      } else if (item.updated - currentTime < constants.FiveMinutesInMs) {
        showQueueNotification(item);
      }
    }
  }).catch(function (error) {
    queueDb.addItem(item).then(function (result) {
      queueDb.updateViewedCount();
    }).catch(function (error) {
      //ignore
    });
    showQueueNotification(item);
  });
};

function showQueueNotification(item) {
  //FTODO: ignoting notification, as queue is renamed as view later
  return;
  if (db.getBoolean(constants.DisplayNotificationsKey)) {
    if (db.getBoolean(constants.QueueNotificationsKey)) {
      //FTODO: should not do both . think more about this ? in settings page user should be able to select one or both
      displayUrlNotification(createNotificationId(constants.GCMTypeQueue, item.itemId), QueueNotificationTitle, item.url);
      if (db.getBoolean(constants.QueueOpenNewTabKey)) {
        openUrlInNewTab(item.url);
      }
    }
  }
}

var handleSharedGCM = function handleSharedGCM(action, item) {
  var sharedItem = db.getSharedItem(item.itemId);
  db.addToShared(item);
  var showNotification = true;
  var currentTime = Date.now();
  if (sharedItem != undefined) {
    //FTODO:test this , and decide whether this is good
    if (sharedItem.created - currentTime > constants.FiveMinutesInMs) {
      showNotification = false;
    }
  }
  if (showNotification && db.getBoolean(constants.DisplayNotificationsKey)) {
    if (item.type == constants.TypeUrl) {
      if (db.getBoolean(constants.SharedNotificationsKey)) {
        displayUrlNotification(createNotificationId(constants.GCMTypeShared, item.itemId), SharedNotificationUrlTitle, item.content);
        if (db.getBoolean(constants.SharedOpenNewTabKey)) {
          openUrlInNewTab(item.content);
        }
      }
    } else {
      if (db.getBoolean(constants.SharedNotificationsKey)) {
        displayTextNotification(createNotificationId(constants.GCMTypeShared, item.itemId), SharedNotificationTextTitle, item.content);
      }
    }
  }
};

function openUrlInNewTab(url) {
  chrome.tabs.create({
    url: url
  });
}

function displayUrlNotification(notificationId, title, message) {
  console.log("Display url notification called " + title);
  var options = {
    type: "basic",
    title: title,
    message: message,
    iconUrl: "icon128.png",
    buttons: [{
      "title": "open"
    }]
  };

  chrome.notifications.create(notificationId, options, null);
}

function displayTextNotification(notificationId, title, message) {

  var options = {
    type: "basic",
    title: title,
    message: message,
    iconUrl: "icon128.png",
    buttons: [{
      "title": "copy"
    }]
  };

  chrome.notifications.create(notificationId, options, null);
}

var showLoginNotification = function showLoginNotification() {
  console.log("showLoginNotification called");
  var options = {
    type: "basic",
    title: "Login to Voblet",
    message: "You are not logged in to Voblet.Click to login",
    iconUrl: "icon128.png"
  };

  chrome.notifications.create(constants.LoginNotificationId, options, null);
};

function handleNotificationClick(notificationId) {
  console.log("handleNotificationClick " + notificationId);
  chrome.notifications.clear(notificationId);
  if (notificationId == constants.LoginNotificationId) {
    openUrlInNewTab(constants.LoginPageUrl);
    return;
  }
  var res = notificationId.split(";");
  var type = res[0];
  var itemId = res[1];
  if (type == constants.GCMTypeQueue) {
    queueDb.getCollection(itemId).each(function (queueItem) {
      if (queueItem && queueItem.itemId == itemId) {
        openUrlInNewTab(queueItem.url);
        return false;
      }
    }).catch(function (error) {
      console.error(error);
    });
  } else if (type == constants.GCMTypeShared) {
    var data = db.getSharedData();
    for (var i = 0; i < data.length; i++) {
      if (data[i].itemId.toString() == itemId) {
        if (data[i].type == constants.TypeUrl) {
          openUrlInNewTab(data[i].content);
        } else {
          copyTextToClipboard(data[i].content);
        }
      }
    }
  }
}

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

function createNotificationId(type, itemId) {
  return type + ";" + itemId;
}

module.exports = {
  activateGCMListener: activateGCMListener,
  showLoginNotification: showLoginNotification,
  handleQueueGCM: handleQueueGCM
};

},{"./constants.js":4,"./db.js":5,"./queueDb.js":8,"./util.js":9}],8:[function(require,module,exports){
'use strict';

var Dexie = require("dexie");
var db = require('./db.js');
var constants = require('./constants.js');
var util = require('./util.js');
var gaEventCategory = "queueDb";
var queueDb = new Dexie("Queue");
var joinChar = "fds{|}";

function setup() {
  try {
    queueDb.version(1).stores({
      queue: "itemId,url,created,updated"
    });
  } catch (err) {
    console.log(err);
  }

  queueDb.open().catch(function (error) {
    console.log(error);
  });
}

function addItem(queueItem) {
  queueItem.searchText = getSearchText(queueItem);

  return new Promise(function (resolve, reject) {
    queueDb.queue.put(queueItem).then(function (result) {
      resolve(result);
      broadcastQueueUpdatedMessage();
    }).catch(function (error) {
      reject(error);
    });
  });
}

function deleteItem(itemId) {
  return new Promise(function (resolve, reject) {
    queueDb.queue.delete(itemId).then(function (result) {
      resolve(result);
      broadcastQueueUpdatedMessage();
    }).catch(function (error) {
      reject(error);
    });
  });
}

function getItem(itemId) {
  return queueDb.queue.get(itemId);
}

function getCollection(itemId) {
  //FTODO: wrote this fucntion becuase getItem was not working for nofiticaion on click
  return queueDb.queue.reverse();
}

function getItemByUrl(url) {
  return queueDb.queue.where('url').equalsIgnoreCase(url).limit(1);
}

function getItemsWithUrlPrefix(prefix) {
  return queueDb.queue.where('url').startsWithIgnoreCase(prefix);
}

function bulkInsert(queueItems, callback) {
  queueDb.transaction('rw', queueDb.queue, function () {
    for (var i = 0; i < queueItems.length; i++) {
      var queueItem = queueItems[i];
      queueItem.searchText = getSearchText(queueItem);
      queueDb.queue.put(queueItem).catch(function (err) {
        db.setQueueLastUpdatedTimestamp(0);
        callback(constants.Fail, constants.DatabaseErr, err);
      });
    }
  }).then(function (result) {
    callback(constants.Success);
    broadcastQueueUpdatedMessage();
  }).catch(function (err) {
    db.setQueueLastUpdatedTimestamp(0);
    callback(constants.Fail, constants.DatabaseErr, err);
    util.gaEvent(gaEventCategory, "bulkInsertFail");
  });
}

function bulkInsertBasedOnUpdateAction(queueItems, callback) {
  queueDb.transaction('rw', queueDb.queue, function () {
    for (var i = 0; i < queueItems.length; i++) {
      var queueItem = queueItems[i];
      if (queueItem.updateAction != "D") {
        queueItem.searchText = getSearchText(queueItem);
        queueDb.queue.put(queueItem).catch(function (err) {
          db.setQueueLastUpdatedTimestamp(0);
          callback(constants.Fail, constants.DatabaseErr, err);
        });
      } else {
        queueDb.queue.delete(queueItem.itemId).catch(function (err) {
          db.setQueueLastUpdatedTimestamp(0);
          callback(constants.Fail, constants.DatabaseErr, err);
        });
      }
    }
  }).then(function (result) {
    callback(constants.Success);
    broadcastQueueUpdatedMessage();
  }).catch(function (err) {
    db.setQueueLastUpdatedTimestamp(0);
    callback(constants.Fail, constants.DatabaseErr, err);
    util.gaEvent(gaEventCategory, "bulkInsertOnUpdateActionFail");
  });
}

function getAll(sortBy, callback) {
  if (sortBy == constants.OldestFirst) {
    queueDb.queue.orderBy('created').toArray(function (queue) {
      callback(constants.Success, queue);
    }).catch(function (err) {
      callback(constants.Fail, constants.DatabaseErr, err);
    });
  } else {
    //Default to newest first
    queueDb.queue.orderBy('created').reverse().toArray(function (queue) {
      callback(constants.Success, queue);
    }).catch(function (err) {
      callback(constants.Fail, constants.DatabaseErr, err);
    });
  }
}

function updateViewedCount() {
  console.log("update viewed count called ");
  var count = 0;
  queueDb.queue.filter(function (queueItem) {
    return queueItem.isViewed === false;
  }).count(function (count) {
    console.log("I have superb" + count);
    util.setBadgeText(count);
  });
}

function getSearchText(queueItem) {
  var searchText = queueItem.note + joinChar + queueItem.url + joinChar + queueItem.urlTitle + joinChar + queueItem.urlImage;
  return searchText.toLowerCase();
}

function deleteAll() {
  return queueDb.queue.clear();
}

function broadcastQueueUpdatedMessage() {
  if (chrome.tabs) {
    chrome.tabs.query({ url: "*://github.com/*" }, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.sendMessage(tabs[i].id, { name: constants.MessageQueueUpdated });
      }
    });
  }
}

module.exports = {
  setup: setup,
  addItem: addItem,
  getItem: getItem,
  getAll: getAll,
  getCollection: getCollection,
  getItemByUrl: getItemByUrl,
  getItemsWithUrlPrefix: getItemsWithUrlPrefix,
  deleteAll: deleteAll,
  bulkInsert: bulkInsert,
  deleteItem: deleteItem,
  updateViewedCount: updateViewedCount,
  bulkInsertBasedOnUpdateAction: bulkInsertBasedOnUpdateAction
};

},{"./constants.js":4,"./db.js":5,"./util.js":9,"dexie":10}],9:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var constants = require('./constants.js');

var getVersionNumber = function getVersionNumber() {
  return chrome.app.getDetails().version;
};

var getBrowser = function getBrowser() {
  //FTODO: this works to differentiate between firefox and chrome . if you support  opera, edge in future write better fucntion
  //FTODO: for now everything is chrome
  /*
    if(/chrome/i.test( navigator.userAgent )){
      return constants.Chrome;
    }else{
      return constants.Firefox;
    }
    */
  return constants.Chrome;
};

var sendMessage = function sendMessage(data) {
  if (getBrowser() == constants.Firefox) {
    browser.runtime.sendMessage(data);
  } else {
    chrome.extension.sendMessage(data, null);
  }
};

var showToastInTab = function showToastInTab(message) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: constants.MessageShowToast,
      message: message
    }, null);
  });
};

var showAddTagsDialog = function showAddTagsDialog(tags) {
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: constants.MessageShowAddTagsDialog,
      tags: tags
    }, null);
  });
};

var closeAddTagsDialog = function closeAddTagsDialog(message) {
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendMessage(tab.id, {
      type: constants.MessageCloseAddTagsDialog,
      message: message
    }, null);
  });
};

var generateUUID = function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return uuid;
};

var getReadableTime = function getReadableTime(timestamp) {
  //FTODO: implement timeago here for times less than 1 day
  var original_date = new Date(timestamp);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = original_date.getFullYear();
  var month = months[original_date.getMonth()];
  var date = original_date.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  if (month < 10) {
    month = '0' + month;
  }
  var hour = original_date.getHours();
  var ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  if (hour < 10) {
    hour = '0' + hour;
  }
  /*
    var s = ["th", "st", "nd", "rd"],
      v = date % 100;
    var oridnal = (s[(v - 20) % 10] || s[v] || s[0]);
    */
  var min = original_date.getMinutes();
  if (min < 10) {
    min = '0' + min;
  }
  var sec = original_date.getSeconds();
  if (sec < 10) {
    sec = '0' + sec;
  }
  var time = month + ' ' + date + ', ' + hour + ':' + min + ' ' + ampm;
  return time;
};

var getDomainName = function getDomainName(data) {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
};

function isValidUrl(value) {
  var urlregex = /(http|https|chrome-extension):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if (urlregex.test(value)) {
    return true;
  }
  return false;
}

var areArraysEqual = function areArraysEqual(a, b) {
  if (a == null) {
    a = [];
  }
  if (b == null) {
    b = [];
  }
  return a.sort().toString() == b.sort().toString();
};

var isValidBookmarkTag = function isValidBookmarkTag(tagName) {
  if (tagName.length > constants.BookmarkTagMaxLength) {
    return false;
  }
  if (tagName.indexOf(',') > -1) {
    return false;
  }
  return true;
};

var removeDuplicatesInArray = function removeDuplicatesInArray(a) {
  var seen = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for (var i = 0; i < len; i++) {
    var item = a[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
};

var gaEvent = function gaEvent(eventCategory, eventAction, eventLabel) {
  console.log(typeof _gaq === 'undefined' ? 'undefined' : _typeof(_gaq));
  if ((typeof _gaq === 'undefined' ? 'undefined' : _typeof(_gaq)) != undefined) {
    _gaq.push(['_trackEvent', eventCategory, eventAction, eventLabel]);
  }
};

function getWidth() {
  if (self.innerWidth) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}

var getOffsetPosition = function getOffsetPosition(id) {

  var element = document.getElementById(id); //replace elementId with your element's Id.
  var rect = element.getBoundingClientRect();
  var mainTag = document.getElementById(constants.MainTag);

  var elementLeft, elementTop, elementRight; //x and y
  var scrollTop = 0;
  var scrollLeft = 0;
  if (mainTag) {
    scrollTop = mainTag.scrollTop ? mainTag.scrollTop : document.body.scrollTop;
    scrollLeft = mainTag.scrollLeft ? mainTag.scrollLeft : document.body.scrollLeft;
  }
  elementTop = rect.top + scrollTop;
  elementLeft = rect.left + scrollLeft;
  elementRight = getWidth() - rect.right;
  return { top: elementTop, left: elementLeft, right: elementRight };
};

var getUrlData = function getUrlData(url) {
  var title = "";
  var og_title = "";
  var twitter_title = "";
  var og_image = "";
  var twitter_image = "";
  var final_title = "";
  var final_desc = "";
  var final_image = "";
  var result = _defineProperty({
    title: ""
  }, 'title', "");
  // Take the provided url, and add it to a YQL query. Make sure you encode it!
  var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + '"') + 'and xpath=\'//head\'';
  $.ajax({
    url: yql,
    type: 'get',
    dataType: 'html',
    async: false,
    timeout: 500,
    success: function success(data) {
      var $xml = $(data);
      var title = $xml.find("title").text();
      console.log("meta data " + $xml.find('meta').text());
      $(data).find('meta').each(function () {
        var $entry = $(this);
        if ($entry.attr('property') == "og:title") {
          og_title = $entry.attr('content');
        }
        if ($entry.attr('property') == "og:image") {
          og_image = $entry.attr('content');
        }
        if ($entry.attr('name') == "twitter:title" || $entry.attr('property') == "twitter:title") {
          twitter_title = $entry.attr('content');
        }

        if ($entry.attr('name') == "twitter:image" || $entry.attr('property') == "twitter:image") {
          twitter_image = $entry.attr('content');
        }
      });

      if (title != "") {
        final_title = title;
      } else if (og_title != "") {
        final_title = og_title;
      } else if (twitter_title != "") {
        final_title = twitter_title;
      }
      if (og_image != "") {
        final_image = og_image;
      } else if (twitter_image != "") {
        final_image = twitter_image;
      }
      result = {
        title: final_title,
        image: final_image
      };
    }
  });
  return result;
};

var setBadgeText = function setBadgeText(text) {
  if (text == 0) {
    //FTODO: decide badge color if green is good ?
    chrome.browserAction.setBadgeBackgroundColor({ color: "#50BCB6" });
    chrome.browserAction.setBadgeText({ text: "" });
  } else {
    chrome.browserAction.setBadgeBackgroundColor({ color: "#50BCB6" });
    chrome.browserAction.setBadgeText({
      text: "" + text
    });
  }
};

var getUrlImageForThisDomain = function getUrlImageForThisDomain(domain) {
  if (domain == "facebook.com" || domain == "m.facebook.com" || domain == "fb.com") {
    return constants.FacebookIcon;
  } else if (domain == "www.youtube.com" || domain == "youtube.com" || domain == "m.youtube.com" || domain == "youtu.be") {
    return constants.YoutubeIcon;
  } else if (domain == "twitter.com" || domain == "m.twitter.com" || domain == "t.co") {
    return constants.TwitterIcon;
  }
  return "";
};

function updateContextMenu() {
  chrome.runtime.sendMessage({
    name: constants.RefreshContextMenu
  }, null);
}

function injectContentScript() {
  // Get all windows
  chrome.windows.getAll({
    populate: true
  }, function (windows) {
    var w = windows.length;
    var currentWindow;
    for (var i = 0; i < w; i++) {
      currentWindow = windows[i];
      var t = currentWindow.tabs.length;
      for (var j = 0; j < t; j++) {
        var tab = currentWindow.tabs[j];
        if (tab.url.match(/(chrome|chrome-extension):\/\//gi)) {
          continue;
        }
        //FTODO: get file names like this http://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
        chrome.tabs.insertCSS(tab.id, { file: "css/contentScriptStyle.css" });
        chrome.tabs.executeScript(tab.id, { file: "js/jquery-2.1.1.min.js" });
        chrome.tabs.executeScript(tab.id, { file: "contentScript.js" });
      }
    }
  });
}

module.exports = {
  getVersionNumber: getVersionNumber,
  generateUUID: generateUUID,
  getDomainName: getDomainName,
  getReadableTime: getReadableTime,
  showToastInTab: showToastInTab,
  isValidUrl: isValidUrl,
  areArraysEqual: areArraysEqual,
  removeDuplicatesInArray: removeDuplicatesInArray,
  showAddTagsDialog: showAddTagsDialog,
  closeAddTagsDialog: closeAddTagsDialog,
  gaEvent: gaEvent,
  getOffsetPosition: getOffsetPosition,
  isValidBookmarkTag: isValidBookmarkTag,
  getUrlData: getUrlData,
  setBadgeText: setBadgeText,
  getUrlImageForThisDomain: getUrlImageForThisDomain,
  updateContextMenu: updateContextMenu,
  injectContentScript: injectContentScript,
  getBrowser: getBrowser,
  sendMessage: sendMessage
};

},{"./constants.js":4}],10:[function(require,module,exports){
(function (global){
(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   global.Dexie = factory();
}(this, function () { 'use strict';

   // By default, debug will be true only if platform is a web platform and its page is served from localhost.
   // When debug = true, error's stacks will contain asyncronic long stacks.
   var debug = typeof location !== 'undefined' &&
   // By default, use debug mode if served from localhost.
   /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

   function setDebug(value, filter) {
       debug = value;
       libraryFilter = filter;
   }

   var libraryFilter = function () {
       return true;
   };

   var NEEDS_THROW_FOR_STACK = !new Error("").stack;

   function getErrorWithStack() {
       "use strict";

       if (NEEDS_THROW_FOR_STACK) try {
           // Doing something naughty in strict mode here to trigger a specific error
           // that can be explicitely ignored in debugger's exception settings.
           // If we'd just throw new Error() here, IE's debugger's exception settings
           // will just consider it as "exception thrown by javascript code" which is
           // something you wouldn't want it to ignore.
           getErrorWithStack.arguments;
           throw new Error(); // Fallback if above line don't throw.
       } catch (e) {
           return e;
       }
       return new Error();
   }

   function prettyStack(exception, numIgnoredFrames) {
       var stack = exception.stack;
       if (!stack) return "";
       numIgnoredFrames = numIgnoredFrames || 0;
       if (stack.indexOf(exception.name) === 0) numIgnoredFrames += (exception.name + exception.message).split('\n').length;
       return stack.split('\n').slice(numIgnoredFrames).filter(libraryFilter).map(function (frame) {
           return "\n" + frame;
       }).join('');
   }

   function nop() {}
   function mirror(val) {
       return val;
   }
   function pureFunctionChain(f1, f2) {
       // Enables chained events that takes ONE argument and returns it to the next function in chain.
       // This pattern is used in the hook("reading") event.
       if (f1 == null || f1 === mirror) return f2;
       return function (val) {
           return f2(f1(val));
       };
   }

   function callBoth(on1, on2) {
       return function () {
           on1.apply(this, arguments);
           on2.apply(this, arguments);
       };
   }

   function hookCreatingChain(f1, f2) {
       // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
       // This pattern is used in the hook("creating") event.
       if (f1 === nop) return f2;
       return function () {
           var res = f1.apply(this, arguments);
           if (res !== undefined) arguments[0] = res;
           var onsuccess = this.onsuccess,
               // In case event listener has set this.onsuccess
           onerror = this.onerror; // In case event listener has set this.onerror
           this.onsuccess = null;
           this.onerror = null;
           var res2 = f2.apply(this, arguments);
           if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
           if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
           return res2 !== undefined ? res2 : res;
       };
   }

   function hookDeletingChain(f1, f2) {
       if (f1 === nop) return f2;
       return function () {
           f1.apply(this, arguments);
           var onsuccess = this.onsuccess,
               // In case event listener has set this.onsuccess
           onerror = this.onerror; // In case event listener has set this.onerror
           this.onsuccess = this.onerror = null;
           f2.apply(this, arguments);
           if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
           if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
       };
   }

   function hookUpdatingChain(f1, f2) {
       if (f1 === nop) return f2;
       return function (modifications) {
           var res = f1.apply(this, arguments);
           extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
           var onsuccess = this.onsuccess,
               // In case event listener has set this.onsuccess
           onerror = this.onerror; // In case event listener has set this.onerror
           this.onsuccess = null;
           this.onerror = null;
           var res2 = f2.apply(this, arguments);
           if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
           if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
           return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
       };
   }

   function reverseStoppableEventChain(f1, f2) {
       if (f1 === nop) return f2;
       return function () {
           if (f2.apply(this, arguments) === false) return false;
           return f1.apply(this, arguments);
       };
   }

   function promisableChain(f1, f2) {
       if (f1 === nop) return f2;
       return function () {
           var res = f1.apply(this, arguments);
           if (res && typeof res.then === 'function') {
               var thiz = this,
                   i = arguments.length,
                   args = new Array(i);
               while (i--) {
                   args[i] = arguments[i];
               }return res.then(function () {
                   return f2.apply(thiz, args);
               });
           }
           return f2.apply(this, arguments);
       };
   }

   var keys = Object.keys;
   var isArray = Array.isArray;
   var _global = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;

   function extend(obj, extension) {
       if (typeof extension !== 'object') return obj;
       keys(extension).forEach(function (key) {
           obj[key] = extension[key];
       });
       return obj;
   }

   var getProto = Object.getPrototypeOf;
   var _hasOwn = {}.hasOwnProperty;
   function hasOwn(obj, prop) {
       return _hasOwn.call(obj, prop);
   }

   function props(proto, extension) {
       if (typeof extension === 'function') extension = extension(getProto(proto));
       keys(extension).forEach(function (key) {
           setProp(proto, key, extension[key]);
       });
   }

   function setProp(obj, prop, functionOrGetSet, options) {
       Object.defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
   }

   function derive(Child) {
       return {
           from: function (Parent) {
               Child.prototype = Object.create(Parent.prototype);
               setProp(Child.prototype, "constructor", Child);
               return {
                   extend: props.bind(null, Child.prototype)
               };
           }
       };
   }

   var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

   function getPropertyDescriptor(obj, prop) {
       var pd = getOwnPropertyDescriptor(obj, prop),
           proto;
       return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
   }

   var _slice = [].slice;
   function slice(args, start, end) {
       return _slice.call(args, start, end);
   }

   function override(origFunc, overridedFactory) {
       return overridedFactory(origFunc);
   }

   function doFakeAutoComplete(fn) {
       var to = setTimeout(fn, 1000);
       clearTimeout(to);
   }

   function assert(b) {
       if (!b) throw new exceptions.Internal("Assertion failed");
   }

   function asap(fn) {
       if (_global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
   }

   /** Generate an object (hash map) based on given array.
    * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
    *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
    *        current item wont affect the resulting object.
    */
   function arrayToObject(array, extractor) {
       return array.reduce(function (result, item, i) {
           var nameAndValue = extractor(item, i);
           if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
           return result;
       }, {});
   }

   function trycatcher(fn, reject) {
       return function () {
           try {
               fn.apply(this, arguments);
           } catch (e) {
               reject(e);
           }
       };
   }

   function tryCatch(fn, onerror, args) {
       try {
           fn.apply(null, args);
       } catch (ex) {
           onerror && onerror(ex);
       }
   }

   function rejection(err, uncaughtHandler) {
       // Get the call stack and return a rejected promise.
       var rv = Promise.reject(err);
       return uncaughtHandler ? rv.uncaught(uncaughtHandler) : rv;
   }

   function getByKeyPath(obj, keyPath) {
       // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
       if (hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
       if (!keyPath) return obj;
       if (typeof keyPath !== 'string') {
           var rv = [];
           for (var i = 0, l = keyPath.length; i < l; ++i) {
               var val = getByKeyPath(obj, keyPath[i]);
               rv.push(val);
           }
           return rv;
       }
       var period = keyPath.indexOf('.');
       if (period !== -1) {
           var innerObj = obj[keyPath.substr(0, period)];
           return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
       }
       return undefined;
   }

   function setByKeyPath(obj, keyPath, value) {
       if (!obj || keyPath === undefined) return;
       if ('isFrozen' in Object && Object.isFrozen(obj)) return;
       if (typeof keyPath !== 'string' && 'length' in keyPath) {
           assert(typeof value !== 'string' && 'length' in value);
           for (var i = 0, l = keyPath.length; i < l; ++i) {
               setByKeyPath(obj, keyPath[i], value[i]);
           }
       } else {
           var period = keyPath.indexOf('.');
           if (period !== -1) {
               var currentKeyPath = keyPath.substr(0, period);
               var remainingKeyPath = keyPath.substr(period + 1);
               if (remainingKeyPath === "") {
                   if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
               } else {
                   var innerObj = obj[currentKeyPath];
                   if (!innerObj) innerObj = obj[currentKeyPath] = {};
                   setByKeyPath(innerObj, remainingKeyPath, value);
               }
           } else {
               if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
           }
       }
   }

   function delByKeyPath(obj, keyPath) {
       if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
           setByKeyPath(obj, kp, undefined);
       });
   }

   function shallowClone(obj) {
       var rv = {};
       for (var m in obj) {
           if (hasOwn(obj, m)) rv[m] = obj[m];
       }
       return rv;
   }

   function deepClone(any) {
       if (!any || typeof any !== 'object') return any;
       var rv;
       if (isArray(any)) {
           rv = [];
           for (var i = 0, l = any.length; i < l; ++i) {
               rv.push(deepClone(any[i]));
           }
       } else if (any instanceof Date) {
           rv = new Date();
           rv.setTime(any.getTime());
       } else {
           rv = any.constructor ? Object.create(any.constructor.prototype) : {};
           for (var prop in any) {
               if (hasOwn(any, prop)) {
                   rv[prop] = deepClone(any[prop]);
               }
           }
       }
       return rv;
   }

   function getObjectDiff(a, b, rv, prfx) {
       // Compares objects a and b and produces a diff object.
       rv = rv || {};
       prfx = prfx || '';
       keys(a).forEach(function (prop) {
           if (!hasOwn(b, prop)) rv[prfx + prop] = undefined; // Property removed
           else {
                   var ap = a[prop],
                       bp = b[prop];
                   if (typeof ap === 'object' && typeof bp === 'object' && ap && bp && ap.constructor === bp.constructor)
                       // Same type of object but its properties may have changed
                       getObjectDiff(ap, bp, rv, prfx + prop + ".");else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
               }
       });
       keys(b).forEach(function (prop) {
           if (!hasOwn(a, prop)) {
               rv[prfx + prop] = b[prop]; // Property added
           }
       });
       return rv;
   }

   // If first argument is iterable or array-like, return it as an array
   var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
   var getIteratorOf = iteratorSymbol ? function (x) {
       var i;
       return x != null && (i = x[iteratorSymbol]) && i.apply(x);
   } : function () {
       return null;
   };

   var NO_CHAR_ARRAY = {};
   // Takes one or several arguments and returns an array based on the following criteras:
   // * If several arguments provided, return arguments converted to an array in a way that
   //   still allows javascript engine to optimize the code.
   // * If single argument is an array, return a clone of it.
   // * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
   //   case to the two bullets below.
   // * If single argument is an iterable, convert it to an array and return the resulting array.
   // * If single argument is array-like (has length of type number), convert it to an array.
   function getArrayOf(arrayLike) {
       var i, a, x, it;
       if (arguments.length === 1) {
           if (isArray(arrayLike)) return arrayLike.slice();
           if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];
           if (it = getIteratorOf(arrayLike)) {
               a = [];
               while (x = it.next(), !x.done) {
                   a.push(x.value);
               }return a;
           }
           if (arrayLike == null) return [arrayLike];
           i = arrayLike.length;
           if (typeof i === 'number') {
               a = new Array(i);
               while (i--) {
                   a[i] = arrayLike[i];
               }return a;
           }
           return [arrayLike];
       }
       i = arguments.length;
       a = new Array(i);
       while (i--) {
           a[i] = arguments[i];
       }return a;
   }

   var concat = [].concat;
   function flatten(a) {
       return concat.apply([], a);
   }

   var dexieErrorNames = ['Modify', 'Bulk', 'OpenFailed', 'VersionChange', 'Schema', 'Upgrade', 'InvalidTable', 'MissingAPI', 'NoSuchDatabase', 'InvalidArgument', 'SubTransaction', 'Unsupported', 'Internal', 'DatabaseClosed', 'IncompatiblePromise'];

   var idbDomErrorNames = ['Unknown', 'Constraint', 'Data', 'TransactionInactive', 'ReadOnly', 'Version', 'NotFound', 'InvalidState', 'InvalidAccess', 'Abort', 'Timeout', 'QuotaExceeded', 'Syntax', 'DataClone'];

   var errorList = dexieErrorNames.concat(idbDomErrorNames);

   var defaultTexts = {
       VersionChanged: "Database version changed by other database connection",
       DatabaseClosed: "Database has been closed",
       Abort: "Transaction aborted",
       TransactionInactive: "Transaction has already completed or failed"
   };

   //
   // DexieError - base class of all out exceptions.
   //
   function DexieError(name, msg) {
       // Reason we don't use ES6 classes is because:
       // 1. It bloats transpiled code and increases size of minified code.
       // 2. It doesn't give us much in this case.
       // 3. It would require sub classes to call super(), which
       //    is not needed when deriving from Error.
       this._e = getErrorWithStack();
       this.name = name;
       this.message = msg;
   }

   derive(DexieError).from(Error).extend({
       stack: {
           get: function () {
               return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
           }
       },
       toString: function () {
           return this.name + ": " + this.message;
       }
   });

   function getMultiErrorMessage(msg, failures) {
       return msg + ". Errors: " + failures.map(function (f) {
           return f.toString();
       }).filter(function (v, i, s) {
           return s.indexOf(v) === i;
       }) // Only unique error strings
       .join('\n');
   }

   //
   // ModifyError - thrown in WriteableCollection.modify()
   // Specific constructor because it contains members failures and failedKeys.
   //
   function ModifyError(msg, failures, successCount, failedKeys) {
       this._e = getErrorWithStack();
       this.failures = failures;
       this.failedKeys = failedKeys;
       this.successCount = successCount;
   }
   derive(ModifyError).from(DexieError);

   function BulkError(msg, failures) {
       this._e = getErrorWithStack();
       this.name = "BulkError";
       this.failures = failures;
       this.message = getMultiErrorMessage(msg, failures);
   }
   derive(BulkError).from(DexieError);

   //
   //
   // Dynamically generate error names and exception classes based
   // on the names in errorList.
   //
   //

   // Map of {ErrorName -> ErrorName + "Error"}
   var errnames = errorList.reduce(function (obj, name) {
       return obj[name] = name + "Error", obj;
   }, {});

   // Need an alias for DexieError because we're gonna create subclasses with the same name.
   var BaseException = DexieError;
   // Map of {ErrorName -> exception constructor}
   var exceptions = errorList.reduce(function (obj, name) {
       // Let the name be "DexieError" because this name may
       // be shown in call stack and when debugging. DexieError is
       // the most true name because it derives from DexieError,
       // and we cannot change Function.name programatically without
       // dynamically create a Function object, which would be considered
       // 'eval-evil'.
       var fullName = name + "Error";
       function DexieError(msgOrInner, inner) {
           this._e = getErrorWithStack();
           this.name = fullName;
           if (!msgOrInner) {
               this.message = defaultTexts[name] || fullName;
               this.inner = null;
           } else if (typeof msgOrInner === 'string') {
               this.message = msgOrInner;
               this.inner = inner || null;
           } else if (typeof msgOrInner === 'object') {
               this.message = msgOrInner.name + ' ' + msgOrInner.message;
               this.inner = msgOrInner;
           }
       }
       derive(DexieError).from(BaseException);
       obj[name] = DexieError;
       return obj;
   }, {});

   // Use ECMASCRIPT standard exceptions where applicable:
   exceptions.Syntax = SyntaxError;
   exceptions.Type = TypeError;
   exceptions.Range = RangeError;

   var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
       obj[name + "Error"] = exceptions[name];
       return obj;
   }, {});

   function mapError(domError, message) {
       if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
       var rv = new exceptionMap[domError.name](message || domError.message, domError);
       if ("stack" in domError) {
           // Derive stack from inner exception if it has a stack
           setProp(rv, "stack", { get: function () {
                   return this.inner.stack;
               } });
       }
       return rv;
   }

   var fullNameExceptions = errorList.reduce(function (obj, name) {
       if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
       return obj;
   }, {});

   fullNameExceptions.ModifyError = ModifyError;
   fullNameExceptions.DexieError = DexieError;
   fullNameExceptions.BulkError = BulkError;

   function Events(ctx) {
       var evs = {};
       var rv = function (eventName, subscriber) {
           if (subscriber) {
               // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
               var i = arguments.length,
                   args = new Array(i - 1);
               while (--i) {
                   args[i - 1] = arguments[i];
               }evs[eventName].subscribe.apply(null, args);
               return ctx;
           } else if (typeof eventName === 'string') {
               // Return interface allowing to fire or unsubscribe from event
               return evs[eventName];
           }
       };
       rv.addEventType = add;

       for (var i = 1, l = arguments.length; i < l; ++i) {
           add(arguments[i]);
       }

       return rv;

       function add(eventName, chainFunction, defaultFunction) {
           if (typeof eventName === 'object') return addConfiguredEvents(eventName);
           if (!chainFunction) chainFunction = reverseStoppableEventChain;
           if (!defaultFunction) defaultFunction = nop;

           var context = {
               subscribers: [],
               fire: defaultFunction,
               subscribe: function (cb) {
                   if (context.subscribers.indexOf(cb) === -1) {
                       context.subscribers.push(cb);
                       context.fire = chainFunction(context.fire, cb);
                   }
               },
               unsubscribe: function (cb) {
                   context.subscribers = context.subscribers.filter(function (fn) {
                       return fn !== cb;
                   });
                   context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
               }
           };
           evs[eventName] = rv[eventName] = context;
           return context;
       }

       function addConfiguredEvents(cfg) {
           // events(this, {reading: [functionChain, nop]});
           keys(cfg).forEach(function (eventName) {
               var args = cfg[eventName];
               if (isArray(args)) {
                   add(eventName, cfg[eventName][0], cfg[eventName][1]);
               } else if (args === 'asap') {
                   // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                   // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                   var context = add(eventName, mirror, function fire() {
                       // Optimazation-safe cloning of arguments into args.
                       var i = arguments.length,
                           args = new Array(i);
                       while (i--) {
                           args[i] = arguments[i];
                       } // All each subscriber:
                       context.subscribers.forEach(function (fn) {
                           asap(function fireEvent() {
                               fn.apply(null, args);
                           });
                       });
                   });
               } else throw new exceptions.InvalidArgument("Invalid event config");
           });
       }
   }

   //
   // Promise Class for Dexie library
   //
   // I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
   // https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
   //
   // Modifications needed to be done to support indexedDB because it wont accept setTimeout()
   // (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
   // This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45
   //
   // This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
   // the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise.
   //
   // In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
   // tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
   // another strategy now that simplifies everything a lot: to always execute callbacks in a new tick, but have an own microTick
   // engine that is used instead of setImmediate() or setTimeout().
   // Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
   // Also with inspiration from bluebird, asyncronic stacks in debug mode.
   //
   // Specific non-standard features of this Promise class:
   // * Async static context support (Promise.PSD)
   // * Promise.follow() method built upon PSD, that allows user to track all promises created from current stack frame
   //   and below + all promises that those promises creates or awaits.
   // * Detect any unhandled promise in a PSD-scope (PSD.onunhandled).
   //
   // David Fahlander, https://github.com/dfahlander
   //

   // Just a pointer that only this module knows about.
   // Used in Promise constructor to emulate a private constructor.
   var INTERNAL = {};

   // Async stacks (long stacks) must not grow infinitely.
   var LONG_STACKS_CLIP_LIMIT = 100;
   var MAX_LONG_STACKS = 20;
   var stack_being_generated = false;
   /* The default "nextTick" function used only for the very first promise in a promise chain.
      As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
      emulated in this module. For indexedDB compatibility, this means that every method needs to 
      execute at least one promise before doing an indexedDB operation. Dexie will always call 
      db.ready().then() for every operation to make sure the indexedDB event is started in an
      emulated micro tick.
   */
   var schedulePhysicalTick = typeof setImmediate === 'undefined' ?
   // No support for setImmediate. No worry, setTimeout is only called
   // once time. Every tick that follows will be our emulated micro tick.
   // Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug
   function () {
       setTimeout(physicalTick, 0);
   } :
   // setImmediate supported. Modern platform. Also supports Function.bind().
   setImmediate.bind(null, physicalTick);

   // Confifurable through Promise.scheduler.
   // Don't export because it would be unsafe to let unknown
   // code call it unless they do try..catch within their callback.
   // This function can be retrieved through getter of Promise.scheduler though,
   // but users must not do Promise.scheduler (myFuncThatThrows exception)!
   var asap$1 = function (callback, args) {
       microtickQueue.push([callback, args]);
       if (needsNewPhysicalTick) {
           schedulePhysicalTick();
           needsNewPhysicalTick = false;
       }
   };

   var isOutsideMicroTick = true;
   var needsNewPhysicalTick = true;
   var unhandledErrors = [];
   var rejectingErrors = [];
   var currentFulfiller = null;
   var rejectionMapper = mirror;
   // Remove in next major when removing error mapping of DOMErrors and DOMExceptions

   var globalPSD = {
       global: true,
       ref: 0,
       unhandleds: [],
       onunhandled: globalError,
       //env: null, // Will be set whenever leaving a scope using wrappers.snapshot()
       finalize: function () {
           this.unhandleds.forEach(function (uh) {
               try {
                   globalError(uh[0], uh[1]);
               } catch (e) {}
           });
       }
   };

   var PSD = globalPSD;

   var microtickQueue = []; // Callbacks to call in this or next physical tick.
   var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
   var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.

   // Wrappers are not being used yet. Their framework is functioning and can be used
   // to replace environment during a PSD scope (a.k.a. 'zone').
   /* **KEEP** export var wrappers = (() => {
       var wrappers = [];

       return {
           snapshot: () => {
               var i = wrappers.length,
                   result = new Array(i);
               while (i--) result[i] = wrappers[i].snapshot();
               return result;
           },
           restore: values => {
               var i = wrappers.length;
               while (i--) wrappers[i].restore(values[i]);
           },
           wrap: () => wrappers.map(w => w.wrap()),
           add: wrapper => {
               wrappers.push(wrapper);
           }
       };
   })();
   */

   function Promise(fn) {
       if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
       this._listeners = [];
       this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.

       // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
       // execute the microtask engine implicitely within the call to resolve() or reject().
       // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
       // only contains library code when calling resolve() or reject().
       // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
       // global scope (event handler, timer etc)!
       this._lib = false;
       // Current async scope
       var psd = this._PSD = PSD;

       if (debug) {
           this._stackHolder = getErrorWithStack();
           this._prev = null;
           this._numPrev = 0; // Number of previous promises (for long stacks)
           linkToPreviousPromise(this, currentFulfiller);
       }

       if (typeof fn !== 'function') {
           if (fn !== INTERNAL) throw new TypeError('Not a function');
           // Private constructor (INTERNAL, state, value).
           // Used internally by Promise.resolve() and Promise.reject().
           this._state = arguments[1];
           this._value = arguments[2];
           if (this._state === false) handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
           return;
       }

       this._state = null; // null (=pending), false (=rejected) or true (=resolved)
       this._value = null; // error or result
       ++psd.ref; // Refcounting current scope
       executePromiseTask(this, fn);
   }

   props(Promise.prototype, {

       then: function (onFulfilled, onRejected) {
           var _this = this;

           var rv = new Promise(function (resolve, reject) {
               propagateToListener(_this, new Listener(onFulfilled, onRejected, resolve, reject));
           });
           debug && (!this._prev || this._state === null) && linkToPreviousPromise(rv, this);
           return rv;
       },

       _then: function (onFulfilled, onRejected) {
           // A little tinier version of then() that don't have to create a resulting promise.
           propagateToListener(this, new Listener(null, null, onFulfilled, onRejected));
       },

       catch: function (onRejected) {
           if (arguments.length === 1) return this.then(null, onRejected);
           // First argument is the Error type to catch
           var type = arguments[0],
               handler = arguments[1];
           return typeof type === 'function' ? this.then(null, function (err) {
               return(
                   // Catching errors by its constructor type (similar to java / c++ / c#)
                   // Sample: promise.catch(TypeError, function (e) { ... });
                   err instanceof type ? handler(err) : PromiseReject(err)
               );
           }) : this.then(null, function (err) {
               return(
                   // Catching errors by the error.name property. Makes sense for indexedDB where error type
                   // is always DOMError but where e.name tells the actual error type.
                   // Sample: promise.catch('ConstraintError', function (e) { ... });
                   err && err.name === type ? handler(err) : PromiseReject(err)
               );
           });
       },

       finally: function (onFinally) {
           return this.then(function (value) {
               onFinally();
               return value;
           }, function (err) {
               onFinally();
               return PromiseReject(err);
           });
       },

       // Deprecate in next major. Needed only for db.on.error.
       uncaught: function (uncaughtHandler) {
           var _this2 = this;

           // Be backward compatible and use "onuncatched" as the event name on this.
           // Handle multiple subscribers through reverseStoppableEventChain(). If a handler returns `false`, bubbling stops.
           this.onuncatched = reverseStoppableEventChain(this.onuncatched, uncaughtHandler);
           // In case caller does this on an already rejected promise, assume caller wants to point out the error to this promise and not
           // a previous promise. Reason: the prevous promise may lack onuncatched handler.
           if (this._state === false && unhandledErrors.indexOf(this) === -1) {
               // Replace unhandled error's destinaion promise with this one!
               unhandledErrors.some(function (p, i, l) {
                   return p._value === _this2._value && (l[i] = _this2);
               });
               // Actually we do this shit because we need to support db.on.error() correctly during db.open(). If we deprecate db.on.error, we could
               // take away this piece of code as well as the onuncatched and uncaught() method.
           }
           return this;
       },

       stack: {
           get: function () {
               if (this._stack) return this._stack;
               try {
                   stack_being_generated = true;
                   var stacks = getStack(this, [], MAX_LONG_STACKS);
                   var stack = stacks.join("\nFrom previous: ");
                   if (this._state !== null) this._stack = stack; // Stack may be updated on reject.
                   return stack;
               } finally {
                   stack_being_generated = false;
               }
           }
       }
   });

   function Listener(onFulfilled, onRejected, resolve, reject) {
       this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
       this.onRejected = typeof onRejected === 'function' ? onRejected : null;
       this.resolve = resolve;
       this.reject = reject;
       this.psd = PSD;
   }

   // Promise Static Properties
   props(Promise, {
       all: function () {
           var values = getArrayOf.apply(null, arguments); // Supports iterables, implicit arguments and array-like.
           return new Promise(function (resolve, reject) {
               if (values.length === 0) resolve([]);
               var remaining = values.length;
               values.forEach(function (a, i) {
                   return Promise.resolve(a).then(function (x) {
                       values[i] = x;
                       if (! --remaining) resolve(values);
                   }, reject);
               });
           });
       },

       resolve: function (value) {
           if (value && typeof value.then === 'function') return value;
           return new Promise(INTERNAL, true, value);
       },

       reject: PromiseReject,

       race: function () {
           var values = getArrayOf.apply(null, arguments);
           return new Promise(function (resolve, reject) {
               values.map(function (value) {
                   return Promise.resolve(value).then(resolve, reject);
               });
           });
       },

       PSD: {
           get: function () {
               return PSD;
           },
           set: function (value) {
               return PSD = value;
           }
       },

       newPSD: newScope,

       usePSD: usePSD,

       scheduler: {
           get: function () {
               return asap$1;
           },
           set: function (value) {
               asap$1 = value;
           }
       },

       rejectionMapper: {
           get: function () {
               return rejectionMapper;
           },
           set: function (value) {
               rejectionMapper = value;
           } // Map reject failures
       },

       follow: function (fn) {
           return new Promise(function (resolve, reject) {
               return newScope(function (resolve, reject) {
                   var psd = PSD;
                   psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                   psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                   psd.finalize = callBoth(function () {
                       var _this3 = this;

                       // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                       // examined upon scope completion while unhandled rejections in this Promise
                       // will trigger directly through psd.onunhandled
                       run_at_end_of_this_or_next_physical_tick(function () {
                           _this3.unhandleds.length === 0 ? resolve() : reject(_this3.unhandleds[0]);
                       });
                   }, psd.finalize);
                   fn();
               }, resolve, reject);
           });
       },

       on: Events(null, { "error": [reverseStoppableEventChain, defaultErrorHandler] // Default to defaultErrorHandler
       })

   });

   /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
   function executePromiseTask(promise, fn) {
       // Promise Resolution Procedure:
       // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
       try {
           fn(function (value) {
               if (promise._state !== null) return;
               if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
               var shouldExecuteTick = promise._lib && beginMicroTickScope();
               if (value && typeof value.then === 'function') {
                   executePromiseTask(promise, function (resolve, reject) {
                       value instanceof Promise ? value._then(resolve, reject) : value.then(resolve, reject);
                   });
               } else {
                   promise._state = true;
                   promise._value = value;
                   propagateAllListeners(promise);
               }
               if (shouldExecuteTick) endMicroTickScope();
           }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
       } catch (ex) {
           handleRejection(promise, ex);
       }
   }

   function handleRejection(promise, reason) {
       rejectingErrors.push(reason);
       if (promise._state !== null) return;
       var shouldExecuteTick = promise._lib && beginMicroTickScope();
       reason = rejectionMapper(reason);
       promise._state = false;
       promise._value = reason;
       debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
           var origProp = getPropertyDescriptor(reason, "stack");
           reason._promise = promise;
           setProp(reason, "stack", {
               get: function () {
                   return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
               }
           });
       });
       // Add the failure to a list of possibly uncaught errors
       addPossiblyUnhandledError(promise);
       propagateAllListeners(promise);
       if (shouldExecuteTick) endMicroTickScope();
   }

   function propagateAllListeners(promise) {
       //debug && linkToPreviousPromise(promise);
       var listeners = promise._listeners;
       promise._listeners = [];
       for (var i = 0, len = listeners.length; i < len; ++i) {
           propagateToListener(promise, listeners[i]);
       }
       var psd = promise._PSD;
       --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
       if (numScheduledCalls === 0) {
           // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
           // and that no deferreds where listening to this rejection or success.
           // Since there is a risk that our stack can contain application code that may
           // do stuff after this code is finished that may generate new calls, we cannot
           // call finalizers here.
           ++numScheduledCalls;
           asap$1(function () {
               if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
           }, []);
       }
   }

   function propagateToListener(promise, listener) {
       if (promise._state === null) {
           promise._listeners.push(listener);
           return;
       }

       var cb = promise._state ? listener.onFulfilled : listener.onRejected;
       if (cb === null) {
           // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
           return (promise._state ? listener.resolve : listener.reject)(promise._value);
       }
       var psd = listener.psd;
       ++psd.ref;
       ++numScheduledCalls;
       asap$1(callListener, [cb, promise, listener]);
   }

   function callListener(cb, promise, listener) {
       var outerScope = PSD;
       var psd = listener.psd;
       try {
           if (psd !== outerScope) {
               // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment.
               PSD = psd;
               // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
           }

           // Set static variable currentFulfiller to the promise that is being fullfilled,
           // so that we connect the chain of promises (for long stacks support)
           currentFulfiller = promise;

           // Call callback and resolve our listener with it's return value.
           var value = promise._value,
               ret;
           if (promise._state) {
               ret = cb(value);
           } else {
               if (rejectingErrors.length) rejectingErrors = [];
               ret = cb(value);
               if (rejectingErrors.indexOf(value) === -1) markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
           }
           listener.resolve(ret);
       } catch (e) {
           // Exception thrown in callback. Reject our listener.
           listener.reject(e);
       } finally {
           // Restore PSD, env and currentFulfiller.
           if (psd !== outerScope) {
               PSD = outerScope;
               // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
           }
           currentFulfiller = null;
           if (--numScheduledCalls === 0) finalizePhysicalTick();
           --psd.ref || psd.finalize();
       }
   }

   function getStack(promise, stacks, limit) {
       if (stacks.length === limit) return stacks;
       var stack = "";
       if (promise._state === false) {
           var failure = promise._value,
               errorName,
               message;

           if (failure != null) {
               errorName = failure.name || "Error";
               message = failure.message || failure;
               stack = prettyStack(failure, 0);
           } else {
               errorName = failure; // If error is undefined or null, show that.
               message = "";
           }
           stacks.push(errorName + (message ? ": " + message : "") + stack);
       }
       if (debug) {
           stack = prettyStack(promise._stackHolder, 2);
           if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
           if (promise._prev) getStack(promise._prev, stacks, limit);
       }
       return stacks;
   }

   function linkToPreviousPromise(promise, prev) {
       // Support long stacks by linking to previous completed promise.
       var numPrev = prev ? prev._numPrev + 1 : 0;
       if (numPrev < LONG_STACKS_CLIP_LIMIT) {
           // Prohibit infinite Promise loops to get an infinite long memory consuming "tail".
           promise._prev = prev;
           promise._numPrev = numPrev;
       }
   }

   /* The callback to schedule with setImmediate() or setTimeout().
      It runs a virtual microtick and executes any callback registered in microtickQueue.
    */
   function physicalTick() {
       beginMicroTickScope() && endMicroTickScope();
   }

   function beginMicroTickScope() {
       var wasRootExec = isOutsideMicroTick;
       isOutsideMicroTick = false;
       needsNewPhysicalTick = false;
       return wasRootExec;
   }

   /* Executes micro-ticks without doing try..catch.
      This can be possible because we only use this internally and
      the registered functions are exception-safe (they do try..catch
      internally before calling any external method). If registering
      functions in the microtickQueue that are not exception-safe, this
      would destroy the framework and make it instable. So we don't export
      our asap method.
   */
   function endMicroTickScope() {
       var callbacks, i, l;
       do {
           while (microtickQueue.length > 0) {
               callbacks = microtickQueue;
               microtickQueue = [];
               l = callbacks.length;
               for (i = 0; i < l; ++i) {
                   var item = callbacks[i];
                   item[0].apply(null, item[1]);
               }
           }
       } while (microtickQueue.length > 0);
       isOutsideMicroTick = true;
       needsNewPhysicalTick = true;
   }

   function finalizePhysicalTick() {
       var unhandledErrs = unhandledErrors;
       unhandledErrors = [];
       unhandledErrs.forEach(function (p) {
           p._PSD.onunhandled.call(null, p._value, p);
       });
       var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
       var i = finalizers.length;
       while (i) {
           finalizers[--i]();
       }
   }

   function run_at_end_of_this_or_next_physical_tick(fn) {
       function finalizer() {
           fn();
           tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
       }
       tickFinalizers.push(finalizer);
       ++numScheduledCalls;
       asap$1(function () {
           if (--numScheduledCalls === 0) finalizePhysicalTick();
       }, []);
   }

   function addPossiblyUnhandledError(promise) {
       // Only add to unhandledErrors if not already there. The first one to add to this list
       // will be upon the first rejection so that the root cause (first promise in the
       // rejection chain) is the one listed.
       if (!unhandledErrors.some(function (p) {
           return p._value === promise._value;
       })) unhandledErrors.push(promise);
   }

   function markErrorAsHandled(promise) {
       // Called when a reject handled is actually being called.
       // Search in unhandledErrors for any promise whos _value is this promise_value (list
       // contains only rejected promises, and only one item per error)
       var i = unhandledErrors.length;
       while (i) {
           if (unhandledErrors[--i]._value === promise._value) {
               // Found a promise that failed with this same error object pointer,
               // Remove that since there is a listener that actually takes care of it.
               unhandledErrors.splice(i, 1);
               return;
           }
       }
   }

   // By default, log uncaught errors to the console
   function defaultErrorHandler(e) {
       console.warn('Unhandled rejection: ' + (e.stack || e));
   }

   function PromiseReject(reason) {
       return new Promise(INTERNAL, false, reason);
   }

   function wrap(fn, errorCatcher) {
       var psd = PSD;
       return function () {
           var wasRootExec = beginMicroTickScope(),
               outerScope = PSD;

           try {
               if (outerScope !== psd) {
                   // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment
                   PSD = psd;
                   // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
               }
               return fn.apply(this, arguments);
           } catch (e) {
               errorCatcher && errorCatcher(e);
           } finally {
               if (outerScope !== psd) {
                   PSD = outerScope;
                   // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
               }
               if (wasRootExec) endMicroTickScope();
           }
       };
   }

   function newScope(fn, a1, a2, a3) {
       var parent = PSD,
           psd = Object.create(parent);
       psd.parent = parent;
       psd.ref = 0;
       psd.global = false;
       // **KEEP** psd.env = wrappers.wrap(psd);

       // unhandleds and onunhandled should not be specifically set here.
       // Leave them on parent prototype.
       // unhandleds.push(err) will push to parent's prototype
       // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
       ++parent.ref;
       psd.finalize = function () {
           --this.parent.ref || this.parent.finalize();
       };
       var rv = usePSD(psd, fn, a1, a2, a3);
       if (psd.ref === 0) psd.finalize();
       return rv;
   }

   function usePSD(psd, fn, a1, a2, a3) {
       var outerScope = PSD;
       try {
           if (psd !== outerScope) {
               // **KEEP** outerScope.env = wrappers.snapshot(); // snapshot outerScope's environment.
               PSD = psd;
               // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
           }
           return fn(a1, a2, a3);
       } finally {
           if (psd !== outerScope) {
               PSD = outerScope;
               // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment.
           }
       }
   }

   function globalError(err, promise) {
       var rv;
       try {
           rv = promise.onuncatched(err);
       } catch (e) {}
       if (rv !== false) try {
           Promise.on.error.fire(err, promise); // TODO: Deprecated and use same global handler as bluebird.
       } catch (e) {}
   }

   /* **KEEP** 

   export function wrapPromise(PromiseClass) {
       var proto = PromiseClass.prototype;
       var origThen = proto.then;
       
       wrappers.add({
           snapshot: () => proto.then,
           restore: value => {proto.then = value;},
           wrap: () => patchedThen
       });

       function patchedThen (onFulfilled, onRejected) {
           var promise = this;
           var onFulfilledProxy = wrap(function(value){
               var rv = value;
               if (onFulfilled) {
                   rv = onFulfilled(rv);
                   if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
               }
               --PSD.ref || PSD.finalize();
               return rv;
           });
           var onRejectedProxy = wrap(function(err){
               promise._$err = err;
               var unhandleds = PSD.unhandleds;
               var idx = unhandleds.length,
                   rv;
               while (idx--) if (unhandleds[idx]._$err === err) break;
               if (onRejected) {
                   if (idx !== -1) unhandleds.splice(idx, 1); // Mark as handled.
                   rv = onRejected(err);
                   if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
               } else {
                   if (idx === -1) unhandleds.push(promise);
                   rv = PromiseClass.reject(err);
                   rv._$nointercept = true; // Prohibit eternal loop.
               }
               --PSD.ref || PSD.finalize();
               return rv;
           });
           
           if (this._$nointercept) return origThen.apply(this, arguments);
           ++PSD.ref;
           return origThen.call(this, onFulfilledProxy, onRejectedProxy);
       }
   }

   // Global Promise wrapper
   if (_global.Promise) wrapPromise(_global.Promise);

   */

   doFakeAutoComplete(function () {
       // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
       asap$1 = function (fn, args) {
           setTimeout(function () {
               fn.apply(null, args);
           }, 0);
       };
   });

   var DEXIE_VERSION = '1.4.1';
   var maxString = String.fromCharCode(65535);
   var maxKey = function () {
       try {
           IDBKeyRange.only([[]]);return [[]];
       } catch (e) {
           return maxString;
       }
   }();
   var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
   var STRING_EXPECTED = "String expected.";
   var connections = [];
   var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
   var hasIEDeleteObjectStoreBug = isIEOrEdge;
   var hangsOnDeleteLargeKeyRange = isIEOrEdge;
   var dexieStackFrameFilter = function (frame) {
       return !/(dexie\.js|dexie\.min\.js)/.test(frame);
   };
   setDebug(debug, dexieStackFrameFilter);

   function Dexie(dbName, options) {
       /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
       var deps = Dexie.dependencies;
       var opts = extend({
           // Default Options
           addons: Dexie.addons, // Pick statically registered addons by default
           autoOpen: true, // Don't require db.open() explicitely.
           indexedDB: deps.indexedDB, // Backend IndexedDB api. Default to IDBShim or browser env.
           IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to IDBShim or browser env.
       }, options);
       var addons = opts.addons,
           autoOpen = opts.autoOpen,
           indexedDB = opts.indexedDB,
           IDBKeyRange = opts.IDBKeyRange;

       var globalSchema = this._dbSchema = {};
       var versions = [];
       var dbStoreNames = [];
       var allTables = {};
       ///<var type="IDBDatabase" />
       var idbdb = null; // Instance of IDBDatabase
       var dbOpenError = null;
       var isBeingOpened = false;
       var openComplete = false;
       var READONLY = "readonly",
           READWRITE = "readwrite";
       var db = this;
       var dbReadyResolve,
           dbReadyPromise = new Promise(function (resolve) {
           dbReadyResolve = resolve;
       }),
           cancelOpen,
           openCanceller = new Promise(function (_, reject) {
           cancelOpen = reject;
       });
       var autoSchema = true;
       var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB),
           hasGetAll;

       function init() {
           // Default subscribers to "versionchange" and "blocked".
           // Can be overridden by custom handlers. If custom handlers return false, these default
           // behaviours will be prevented.
           db.on("versionchange", function (ev) {
               // Default behavior for versionchange event is to close database connection.
               // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
               // Let's not block the other window from making it's delete() or open() call.
               // NOTE! This event is never fired in IE,Edge or Safari.
               if (ev.newVersion > 0) console.warn('Another connection wants to upgrade database \'' + db.name + '\'. Closing db now to resume the upgrade.');else console.warn('Another connection wants to delete database \'' + db.name + '\'. Closing db now to resume the delete request.');
               db.close();
               // In many web applications, it would be recommended to force window.reload()
               // when this event occurs. To do that, subscribe to the versionchange event
               // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
               // The reason for this is that your current web app obviously has old schema code that needs
               // to be updated. Another window got a newer version of the app and needs to upgrade DB but
               // your window is blocking it unless we close it here.
           });
           db.on("blocked", function (ev) {
               if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn('Dexie.delete(\'' + db.name + '\') was blocked');else console.warn('Upgrade \'' + db.name + '\' blocked by other connection holding version ' + ev.oldVersion / 10);
           });
       }

       //
       //
       //
       // ------------------------- Versioning Framework---------------------------
       //
       //
       //

       this.version = function (versionNumber) {
           /// <param name="versionNumber" type="Number"></param>
           /// <returns type="Version"></returns>
           if (idbdb || isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
           this.verno = Math.max(this.verno, versionNumber);
           var versionInstance = versions.filter(function (v) {
               return v._cfg.version === versionNumber;
           })[0];
           if (versionInstance) return versionInstance;
           versionInstance = new Version(versionNumber);
           versions.push(versionInstance);
           versions.sort(lowerVersionFirst);
           return versionInstance;
       };

       function Version(versionNumber) {
           this._cfg = {
               version: versionNumber,
               storesSource: null,
               dbschema: {},
               tables: {},
               contentUpgrade: null
           };
           this.stores({}); // Derive earlier schemas by default.
       }

       extend(Version.prototype, {
           stores: function (stores) {
               /// <summary>
               ///   Defines the schema for a particular version
               /// </summary>
               /// <param name="stores" type="Object">
               /// Example: <br/>
               ///   {users: "id++,first,last,&amp;username,*email", <br/>
               ///   passwords: "id++,&amp;username"}<br/>
               /// <br/>
               /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
               /// Special characters:<br/>
               ///  "&amp;"  means unique key, <br/>
               ///  "*"  means value is multiEntry, <br/>
               ///  "++" means auto-increment and only applicable for primary key <br/>
               /// </param>
               this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;

               // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
               var storesSpec = {};
               versions.forEach(function (version) {
                   // 'versions' is always sorted by lowest version first.
                   extend(storesSpec, version._cfg.storesSource);
               });

               var dbschema = this._cfg.dbschema = {};
               this._parseStoresSpec(storesSpec, dbschema);
               // Update the latest schema to this version
               // Update API
               globalSchema = db._dbSchema = dbschema;
               removeTablesApi([allTables, db, Transaction.prototype]);
               setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), READWRITE, dbschema);
               dbStoreNames = keys(dbschema);
               return this;
           },
           upgrade: function (upgradeFunction) {
               /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
               var self = this;
               fakeAutoComplete(function () {
                   upgradeFunction(db._createTransaction(READWRITE, keys(self._cfg.dbschema), self._cfg.dbschema)); // BUGBUG: No code completion for prev version's tables wont appear.
               });
               this._cfg.contentUpgrade = upgradeFunction;
               return this;
           },
           _parseStoresSpec: function (stores, outSchema) {
               keys(stores).forEach(function (tableName) {
                   if (stores[tableName] !== null) {
                       var instanceTemplate = {};
                       var indexes = parseIndexSyntax(stores[tableName]);
                       var primKey = indexes.shift();
                       if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
                       if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
                       indexes.forEach(function (idx) {
                           if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                           if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                           setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
                               return "";
                           }) : "");
                       });
                       outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                   }
               });
           }
       });

       function runUpgraders(oldVersion, idbtrans, reject) {
           var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
           trans.create(idbtrans);
           trans._completion.catch(reject);
           var rejectTransaction = trans._reject.bind(trans);
           newScope(function () {
               PSD.trans = trans;
               if (oldVersion === 0) {
                   // Create tables:
                   keys(globalSchema).forEach(function (tableName) {
                       createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                   });
                   Promise.follow(function () {
                       return db.on.populate.fire(trans);
                   }).catch(rejectTransaction);
               } else updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
           });
       }

       function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
           // Upgrade version to version, step-by-step from oldest to newest version.
           // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
           var queue = [];
           var oldVersionStruct = versions.filter(function (version) {
               return version._cfg.version === oldVersion;
           })[0];
           if (!oldVersionStruct) throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
           globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
           var anyContentUpgraderHasRun = false;

           var versToRun = versions.filter(function (v) {
               return v._cfg.version > oldVersion;
           });
           versToRun.forEach(function (version) {
               /// <param name="version" type="Version"></param>
               queue.push(function () {
                   var oldSchema = globalSchema;
                   var newSchema = version._cfg.dbschema;
                   adjustToExistingIndexNames(oldSchema, idbtrans);
                   adjustToExistingIndexNames(newSchema, idbtrans);
                   globalSchema = db._dbSchema = newSchema;
                   var diff = getSchemaDiff(oldSchema, newSchema);
                   // Add tables          
                   diff.add.forEach(function (tuple) {
                       createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                   });
                   // Change tables
                   diff.change.forEach(function (change) {
                       if (change.recreate) {
                           throw new exceptions.Upgrade("Not yet support for changing primary key");
                       } else {
                           var store = idbtrans.objectStore(change.name);
                           // Add indexes
                           change.add.forEach(function (idx) {
                               addIndex(store, idx);
                           });
                           // Update indexes
                           change.change.forEach(function (idx) {
                               store.deleteIndex(idx.name);
                               addIndex(store, idx);
                           });
                           // Delete indexes
                           change.del.forEach(function (idxName) {
                               store.deleteIndex(idxName);
                           });
                       }
                   });
                   if (version._cfg.contentUpgrade) {
                       anyContentUpgraderHasRun = true;
                       return Promise.follow(function () {
                           version._cfg.contentUpgrade(trans);
                       });
                   }
               });
               queue.push(function (idbtrans) {
                   if (anyContentUpgraderHasRun && !hasIEDeleteObjectStoreBug) {
                       // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
                       var newSchema = version._cfg.dbschema;
                       // Delete old tables
                       deleteRemovedTables(newSchema, idbtrans);
                   }
               });
           });

           // Now, create a queue execution engine
           function runQueue() {
               return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : Promise.resolve();
           }

           return runQueue().then(function () {
               createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
           });
       }

       function getSchemaDiff(oldSchema, newSchema) {
           var diff = {
               del: [], // Array of table names
               add: [], // Array of [tableName, newDefinition]
               change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
           };
           for (var table in oldSchema) {
               if (!newSchema[table]) diff.del.push(table);
           }
           for (table in newSchema) {
               var oldDef = oldSchema[table],
                   newDef = newSchema[table];
               if (!oldDef) {
                   diff.add.push([table, newDef]);
               } else {
                   var change = {
                       name: table,
                       def: newDef,
                       recreate: false,
                       del: [],
                       add: [],
                       change: []
                   };
                   if (oldDef.primKey.src !== newDef.primKey.src) {
                       // Primary key has changed. Remove and re-add table.
                       change.recreate = true;
                       diff.change.push(change);
                   } else {
                       // Same primary key. Just find out what differs:
                       var oldIndexes = oldDef.idxByName;
                       var newIndexes = newDef.idxByName;
                       for (var idxName in oldIndexes) {
                           if (!newIndexes[idxName]) change.del.push(idxName);
                       }
                       for (idxName in newIndexes) {
                           var oldIdx = oldIndexes[idxName],
                               newIdx = newIndexes[idxName];
                           if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
                       }
                       if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                           diff.change.push(change);
                       }
                   }
               }
           }
           return diff;
       }

       function createTable(idbtrans, tableName, primKey, indexes) {
           /// <param name="idbtrans" type="IDBTransaction"></param>
           var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
           indexes.forEach(function (idx) {
               addIndex(store, idx);
           });
           return store;
       }

       function createMissingTables(newSchema, idbtrans) {
           keys(newSchema).forEach(function (tableName) {
               if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                   createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
               }
           });
       }

       function deleteRemovedTables(newSchema, idbtrans) {
           for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
               var storeName = idbtrans.db.objectStoreNames[i];
               if (newSchema[storeName] == null) {
                   idbtrans.db.deleteObjectStore(storeName);
               }
           }
       }

       function addIndex(store, idx) {
           store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
       }

       function dbUncaught(err) {
           return db.on.error.fire(err);
       }

       //
       //
       //      Dexie Protected API
       //
       //

       this._allTables = allTables;

       this._tableFactory = function createTable(mode, tableSchema) {
           /// <param name="tableSchema" type="TableSchema"></param>
           if (mode === READONLY) return new Table(tableSchema.name, tableSchema, Collection);else return new WriteableTable(tableSchema.name, tableSchema);
       };

       this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
           return new Transaction(mode, storeNames, dbschema, parentTransaction);
       };

       /* Generate a temporary transaction when db operations are done outside a transactino scope.
       */
       function tempTransaction(mode, storeNames, fn) {
           // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
           if (!openComplete && !PSD.letThrough) {
               if (!isBeingOpened) {
                   if (!autoOpen) return rejection(new exceptions.DatabaseClosed(), dbUncaught);
                   db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
               }
               return dbReadyPromise.then(function () {
                   return tempTransaction(mode, storeNames, fn);
               });
           } else {
               var trans = db._createTransaction(mode, storeNames, globalSchema);
               return trans._promise(mode, function (resolve, reject) {
                   newScope(function () {
                       // OPTIMIZATION POSSIBLE? newScope() not needed because it's already done in _promise.
                       PSD.trans = trans;
                       fn(resolve, reject, trans);
                   });
               }).then(function (result) {
                   // Instead of resolving value directly, wait with resolving it until transaction has completed.
                   // Otherwise the data would not be in the DB if requesting it in the then() operation.
                   // Specifically, to ensure that the following expression will work:
                   //
                   //   db.friends.put({name: "Arne"}).then(function () {
                   //       db.friends.where("name").equals("Arne").count(function(count) {
                   //           assert (count === 1);
                   //       });
                   //   });
                   //
                   return trans._completion.then(function () {
                       return result;
                   });
               }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
                    trans._reject(err);
                    return rejection(err);
                   });*/
           }
       }

       this._whenReady = function (fn) {
           return new Promise(fake || openComplete || PSD.letThrough ? fn : function (resolve, reject) {
               if (!isBeingOpened) {
                   if (!autoOpen) {
                       reject(new exceptions.DatabaseClosed());
                       return;
                   }
                   db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
               }
               dbReadyPromise.then(function () {
                   fn(resolve, reject);
               });
           }).uncaught(dbUncaught);
       };

       //
       //
       //
       //
       //      Dexie API
       //
       //
       //

       this.verno = 0;

       this.open = function () {
           if (isBeingOpened || idbdb) return dbReadyPromise.then(function () {
               return dbOpenError ? rejection(dbOpenError, dbUncaught) : db;
           });
           debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
           isBeingOpened = true;
           dbOpenError = null;
           openComplete = false;

           // Function pointers to call when the core opening process completes.
           var resolveDbReady = dbReadyResolve,

           // upgradeTransaction to abort on failure.
           upgradeTransaction = null;

           return Promise.race([openCanceller, new Promise(function (resolve, reject) {
               doFakeAutoComplete(function () {
                   return resolve();
               });

               // Make sure caller has specified at least one version
               if (versions.length > 0) autoSchema = false;

               // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
               // IE fails when deleting objectStore after reading from it.
               // A future version of Dexie.js will stopover an intermediate version to workaround this.
               // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.

               // If no API, throw!
               if (!indexedDB) throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " + "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");

               var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
               if (!req) throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
               req.onerror = wrap(eventRejectHandler(reject));
               req.onblocked = wrap(fireOnBlocked);
               req.onupgradeneeded = wrap(function (e) {
                   upgradeTransaction = req.transaction;
                   if (autoSchema && !db._allowEmptyDB) {
                       // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
                       // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                       // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
                       // do not create a new database by accident here.
                       req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
                       upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                       // Close database and delete it.
                       req.result.close();
                       var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                       delreq.onsuccess = delreq.onerror = wrap(function () {
                           reject(new exceptions.NoSuchDatabase('Database ' + dbName + ' doesnt exist'));
                       });
                   } else {
                       upgradeTransaction.onerror = wrap(eventRejectHandler(reject));
                       var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                       runUpgraders(oldVer / 10, upgradeTransaction, reject, req);
                   }
               }, reject);

               req.onsuccess = wrap(function () {
                   // Core opening procedure complete. Now let's just record some stuff.
                   upgradeTransaction = null;
                   idbdb = req.result;
                   connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.

                   if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) {
                       try {
                           adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                       } catch (e) {
                           // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
                       }
                   }

                   idbdb.onversionchange = wrap(function (ev) {
                       db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
                       db.on("versionchange").fire(ev);
                   });

                   if (!hasNativeGetDatabaseNames) {
                       // Update localStorage with list of database names
                       globalDatabaseList(function (databaseNames) {
                           if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
                       });
                   }

                   resolve();
               }, reject);
           })]).then(function () {
               // Before finally resolving the dbReadyPromise and this promise,
               // call and await all on('ready') subscribers:
               // Dexie.vip() makes subscribers able to use the database while being opened.
               // This is a must since these subscribers take part of the opening procedure.
               return Dexie.vip(db.on.ready.fire);
           }).then(function () {
               // Resolve the db.open() with the db instance.
               isBeingOpened = false;
               return db;
           }).catch(function (err) {
               try {
                   // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
                   upgradeTransaction && upgradeTransaction.abort();
               } catch (e) {}
               isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
               db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
               // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
               dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
               return rejection(dbOpenError, dbUncaught); // dbUncaught will make sure any error that happened in any operation before will now bubble to db.on.error() thanks to the special handling in Promise.uncaught().
           }).finally(function () {
               openComplete = true;
               resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
           });
       };

       this.close = function () {
           var idx = connections.indexOf(db);
           if (idx >= 0) connections.splice(idx, 1);
           if (idbdb) {
               try {
                   idbdb.close();
               } catch (e) {}
               idbdb = null;
           }
           autoOpen = false;
           dbOpenError = new exceptions.DatabaseClosed();
           if (isBeingOpened) cancelOpen(dbOpenError);
           // Reset dbReadyPromise promise:
           dbReadyPromise = new Promise(function (resolve) {
               dbReadyResolve = resolve;
           });
           openCanceller = new Promise(function (_, reject) {
               cancelOpen = reject;
           });
       };

       this.delete = function () {
           var hasArguments = arguments.length > 0;
           return new Promise(function (resolve, reject) {
               if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
               if (isBeingOpened) {
                   dbReadyPromise.then(doDelete);
               } else {
                   doDelete();
               }
               function doDelete() {
                   db.close();
                   var req = indexedDB.deleteDatabase(dbName);
                   req.onsuccess = wrap(function () {
                       if (!hasNativeGetDatabaseNames) {
                           globalDatabaseList(function (databaseNames) {
                               var pos = databaseNames.indexOf(dbName);
                               if (pos >= 0) return databaseNames.splice(pos, 1);
                           });
                       }
                       resolve();
                   });
                   req.onerror = wrap(eventRejectHandler(reject));
                   req.onblocked = fireOnBlocked;
               }
           }).uncaught(dbUncaught);
       };

       this.backendDB = function () {
           return idbdb;
       };

       this.isOpen = function () {
           return idbdb !== null;
       };
       this.hasFailed = function () {
           return dbOpenError !== null;
       };
       this.dynamicallyOpened = function () {
           return autoSchema;
       };

       //
       // Properties
       //
       this.name = dbName;

       // db.tables - an array of all Table instances.
       setProp(this, "tables", {
           get: function () {
               /// <returns type="Array" elementType="WriteableTable" />
               return keys(allTables).map(function (name) {
                   return allTables[name];
               });
           }
       });

       //
       // Events
       //
       this.on = Events(this, "error", "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });

       this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
           return function (subscriber, bSticky) {
               Dexie.vip(function () {
                   subscribe(subscriber);
                   if (!bSticky) subscribe(function unsubscribe() {
                       db.on.ready.unsubscribe(subscriber);
                       db.on.ready.unsubscribe(unsubscribe);
                   });
               });
           };
       });

       fakeAutoComplete(function () {
           db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
           db.on("error").fire(new Error());
       });

       this.transaction = function (mode, tableInstances, scopeFunc) {
           /// <summary>
           ///
           /// </summary>
           /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
           /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
           /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

           // Let table arguments be all arguments between mode and last argument.
           var i = arguments.length;
           if (i < 2) throw new exceptions.InvalidArgument("Too few arguments");
           // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
           // and clone arguments except the first one into local var 'args'.
           var args = new Array(i - 1);
           while (--i) {
               args[i - 1] = arguments[i];
           } // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
           scopeFunc = args.pop();
           var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
           var parentTransaction = PSD.trans;
           // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
           if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
           var onlyIfCompatible = mode.indexOf('?') !== -1;
           mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.

           try {
               //
               // Get storeNames from arguments. Either through given table instances, or through given table names.
               //
               var storeNames = tables.map(function (table) {
                   var storeName = table instanceof Table ? table.name : table;
                   if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                   return storeName;
               });

               //
               // Resolve mode. Allow shortcuts "r" and "rw".
               //
               if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);

               if (parentTransaction) {
                   // Basic checks
                   if (parentTransaction.mode === READONLY && mode === READWRITE) {
                       if (onlyIfCompatible) {
                           // Spawn new transaction instead.
                           parentTransaction = null;
                       } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                   }
                   if (parentTransaction) {
                       storeNames.forEach(function (storeName) {
                           if (!hasOwn(parentTransaction.tables, storeName)) {
                               if (onlyIfCompatible) {
                                   // Spawn new transaction instead.
                                   parentTransaction = null;
                               } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                           }
                       });
                   }
               }
           } catch (e) {
               return parentTransaction ? parentTransaction._promise(null, function (_, reject) {
                   reject(e);
               }) : rejection(e, dbUncaught);
           }
           // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
           return parentTransaction ? parentTransaction._promise(mode, enterTransactionScope, "lock") : db._whenReady(enterTransactionScope);

           function enterTransactionScope(resolve) {
               var parentPSD = PSD;
               resolve(Promise.resolve().then(function () {
                   return newScope(function () {
                       // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
                       PSD.transless = PSD.transless || parentPSD;
                       // Our transaction.
                       //return new Promise((resolve, reject) => {
                       var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
                       // Let the transaction instance be part of a Promise-specific data (PSD) value.
                       PSD.trans = trans;

                       if (parentTransaction) {
                           // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                           trans.idbtrans = parentTransaction.idbtrans;
                       } else {
                           trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
                       }

                       // Provide arguments to the scope function (for backward compatibility)
                       var tableArgs = storeNames.map(function (name) {
                           return trans.tables[name];
                       });
                       tableArgs.push(trans);

                       var returnValue;
                       return Promise.follow(function () {
                           // Finally, call the scope function with our table and transaction arguments.
                           returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
                           if (returnValue) {
                               if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                                   // scopeFunc returned an iterator with throw-support. Handle yield as await.
                                   returnValue = awaitIterator(returnValue);
                               } else if (typeof returnValue.then === 'function' && !hasOwn(returnValue, '_PSD')) {
                                   throw new exceptions.IncompatiblePromise("Incompatible Promise returned from transaction scope (read more at http://tinyurl.com/znyqjqc). Transaction scope: " + scopeFunc.toString());
                               }
                           }
                       }).uncaught(dbUncaught).then(function () {
                           if (parentTransaction) trans._resolve(); // sub transactions don't react to idbtrans.oncomplete. We must trigger a acompletion.
                           return trans._completion; // Even if WE believe everything is fine. Await IDBTransaction's oncomplete or onerror as well.
                       }).then(function () {
                           return returnValue;
                       }).catch(function (e) {
                           //reject(e);
                           trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
                           return rejection(e);
                       });
                       //});
                   });
               }));
           }
       };

       this.table = function (tableName) {
           /// <returns type="WriteableTable"></returns>
           if (fake && autoSchema) return new WriteableTable(tableName);
           if (!hasOwn(allTables, tableName)) {
               throw new exceptions.InvalidTable('Table ' + tableName + ' does not exist');
           }
           return allTables[tableName];
       };

       //
       //
       //
       // Table Class
       //
       //
       //
       function Table(name, tableSchema, collClass) {
           /// <param name="name" type="String"></param>
           this.name = name;
           this.schema = tableSchema;
           this.hook = allTables[name] ? allTables[name].hook : Events(null, {
               "creating": [hookCreatingChain, nop],
               "reading": [pureFunctionChain, mirror],
               "updating": [hookUpdatingChain, nop],
               "deleting": [hookDeletingChain, nop]
           });
           this._collClass = collClass || Collection;
       }

       props(Table.prototype, {

           //
           // Table Protected Methods
           //

           _trans: function getTransaction(mode, fn, writeLocked) {
               var trans = PSD.trans;
               return trans && trans.db === db ? trans._promise(mode, fn, writeLocked) : tempTransaction(mode, [this.name], fn);
           },
           _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
               if (fake) return new Promise(fn); // Simplify the work for Intellisense/Code completion.
               var trans = PSD.trans,
                   tableName = this.name;
               function supplyIdbStore(resolve, reject, trans) {
                   fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
               }
               return trans && trans.db === db ? trans._promise(mode, supplyIdbStore, writeLocked) : tempTransaction(mode, [this.name], supplyIdbStore);
           },

           //
           // Table Public Methods
           //
           get: function (key, cb) {
               var self = this;
               return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                   fake && resolve(self.schema.instanceTemplate);
                   var req = idbstore.get(key);
                   req.onerror = eventRejectHandler(reject);
                   req.onsuccess = function () {
                       resolve(self.hook.reading.fire(req.result));
                   };
               }).then(cb);
           },
           where: function (indexName) {
               return new WhereClause(this, indexName);
           },
           count: function (cb) {
               return this.toCollection().count(cb);
           },
           offset: function (offset) {
               return this.toCollection().offset(offset);
           },
           limit: function (numRows) {
               return this.toCollection().limit(numRows);
           },
           reverse: function () {
               return this.toCollection().reverse();
           },
           filter: function (filterFunction) {
               return this.toCollection().and(filterFunction);
           },
           each: function (fn) {
               return this.toCollection().each(fn);
           },
           toArray: function (cb) {
               return this.toCollection().toArray(cb);
           },
           orderBy: function (index) {
               return new this._collClass(new WhereClause(this, index));
           },

           toCollection: function () {
               return new this._collClass(new WhereClause(this));
           },

           mapToClass: function (constructor, structure) {
               /// <summary>
               ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
               ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
               /// </summary>
               /// <param name="constructor">Constructor function representing the class.</param>
               /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
               /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
               this.schema.mappedClass = constructor;
               var instanceTemplate = Object.create(constructor.prototype);
               if (structure) {
                   // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                   applyStructure(instanceTemplate, structure);
               }
               this.schema.instanceTemplate = instanceTemplate;

               // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
               // no matter which method to use for reading (Table.get() or Table.where(...)... )
               var readHook = function (obj) {
                   if (!obj) return obj; // No valid object. (Value is null). Return as is.
                   // Create a new object that derives from constructor:
                   var res = Object.create(constructor.prototype);
                   // Clone members:
                   for (var m in obj) {
                       if (hasOwn(obj, m)) res[m] = obj[m];
                   }return res;
               };

               if (this.schema.readHook) {
                   this.hook.reading.unsubscribe(this.schema.readHook);
               }
               this.schema.readHook = readHook;
               this.hook("reading", readHook);
               return constructor;
           },
           defineClass: function (structure) {
               /// <summary>
               ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
               ///     as well as making it possible to extend the prototype of the returned constructor function.
               /// </summary>
               /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
               /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
               return this.mapToClass(Dexie.defineClass(structure), structure);
           }
       });

       //
       //
       //
       // WriteableTable Class (extends Table)
       //
       //
       //
       function WriteableTable(name, tableSchema, collClass) {
           Table.call(this, name, tableSchema, collClass || WriteableCollection);
       }

       function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
           return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
               errorList.push(e);
               done && done();
           });
       }

       function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
           // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
           // else keysOrTuples must be just an array of keys: [key1, key2, ...].
           return new Promise(function (resolve, reject) {
               var len = keysOrTuples.length,
                   lastItem = len - 1;
               if (len === 0) return resolve();
               if (!hasDeleteHook) {
                   for (var i = 0; i < len; ++i) {
                       var req = idbstore.delete(keysOrTuples[i]);
                       req.onerror = wrap(eventRejectHandler(reject));
                       if (i === lastItem) req.onsuccess = wrap(function () {
                           return resolve();
                       });
                   }
               } else {
                   var hookCtx,
                       errorHandler = hookedEventRejectHandler(reject),
                       successHandler = hookedEventSuccessHandler(null);
                   tryCatch(function () {
                       for (var i = 0; i < len; ++i) {
                           hookCtx = { onsuccess: null, onerror: null };
                           var tuple = keysOrTuples[i];
                           deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
                           var req = idbstore.delete(tuple[0]);
                           req._hookCtx = hookCtx;
                           req.onerror = errorHandler;
                           if (i === lastItem) req.onsuccess = hookedEventSuccessHandler(resolve);else req.onsuccess = successHandler;
                       }
                   }, function (err) {
                       hookCtx.onerror && hookCtx.onerror(err);
                       throw err;
                   });
               }
           }).uncaught(dbUncaught);
       }

       derive(WriteableTable).from(Table).extend({
           bulkDelete: function (keys) {
               if (this.hook.deleting.fire === nop) {
                   return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                       resolve(bulkDelete(idbstore, trans, keys, false, nop));
                   });
               } else {
                   return this.where(':id').anyOf(keys).delete().then(function () {}); // Resolve with undefined.
               }
           },
           bulkPut: function (objects, keys) {
               var _this = this;

               return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                   if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys) throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
                   if (idbstore.keyPath && keys) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                   if (keys && keys.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                   if (objects.length === 0) return resolve(); // Caller provided empty list.
                   var done = function (result) {
                       if (errorList.length === 0) resolve(result);else reject(new BulkError(_this.name + '.bulkPut(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
                   };
                   var req,
                       errorList = [],
                       errorHandler,
                       numObjs = objects.length,
                       table = _this;
                   if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
                       //
                       // Standard Bulk (no 'creating' or 'updating' hooks to care about)
                       //
                       errorHandler = BulkErrorHandlerCatchAll(errorList);
                       for (var i = 0, l = objects.length; i < l; ++i) {
                           req = keys ? idbstore.put(objects[i], keys[i]) : idbstore.put(objects[i]);
                           req.onerror = errorHandler;
                       }
                       // Only need to catch success or error on the last operation
                       // according to the IDB spec.
                       req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                       req.onsuccess = eventSuccessHandler(done);
                   } else {
                       var effectiveKeys = keys || idbstore.keyPath && objects.map(function (o) {
                           return getByKeyPath(o, idbstore.keyPath);
                       });
                       // Generate map of {[key]: object}
                       var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) {
                           return key != null && [key, objects[i]];
                       });
                       var promise = !effectiveKeys ?

                       // Auto-incremented key-less objects only without any keys argument.
                       table.bulkAdd(objects) :

                       // Keys provided. Either as inbound in provided objects, or as a keys argument.
                       // Begin with updating those that exists in DB:
                       table.where(':id').anyOf(effectiveKeys.filter(function (key) {
                           return key != null;
                       })).modify(function () {
                           this.value = objectLookup[this.primKey];
                           objectLookup[this.primKey] = null; // Mark as "don't add this"
                       }).catch(ModifyError, function (e) {
                           errorList = e.failures; // No need to concat here. These are the first errors added.
                       }).then(function () {
                           // Now, let's examine which items didnt exist so we can add them:
                           var objsToAdd = [],
                               keysToAdd = keys && [];
                           // Iterate backwards. Why? Because if same key was used twice, just add the last one.
                           for (var i = effectiveKeys.length - 1; i >= 0; --i) {
                               var key = effectiveKeys[i];
                               if (key == null || objectLookup[key]) {
                                   objsToAdd.push(objects[i]);
                                   keys && keysToAdd.push(key);
                                   if (key != null) objectLookup[key] = null; // Mark as "dont add again"
                               }
                           }
                           // The items are in reverse order so reverse them before adding.
                           // Could be important in order to get auto-incremented keys the way the caller
                           // would expect. Could have used unshift instead of push()/reverse(),
                           // but: http://jsperf.com/unshift-vs-reverse
                           objsToAdd.reverse();
                           keys && keysToAdd.reverse();
                           return table.bulkAdd(objsToAdd, keysToAdd);
                       }).then(function (lastAddedKey) {
                           // Resolve with key of the last object in given arguments to bulkPut():
                           var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
                           return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
                       });

                       promise.then(done).catch(BulkError, function (e) {
                           // Concat failure from ModifyError and reject using our 'done' method.
                           errorList = errorList.concat(e.failures);
                           done();
                       }).catch(reject);
                   }
               }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
           },
           bulkAdd: function (objects, keys) {
               var self = this,
                   creatingHook = this.hook.creating.fire;
               return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                   if (!idbstore.keyPath && !self.schema.primKey.auto && !keys) throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
                   if (idbstore.keyPath && keys) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                   if (keys && keys.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                   if (objects.length === 0) return resolve(); // Caller provided empty list.
                   function done(result) {
                       if (errorList.length === 0) resolve(result);else reject(new BulkError(self.name + '.bulkAdd(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
                   }
                   var req,
                       errorList = [],
                       errorHandler,
                       successHandler,
                       numObjs = objects.length;
                   if (creatingHook !== nop) {
                       //
                       // There are subscribers to hook('creating')
                       // Must behave as documented.
                       //
                       var keyPath = idbstore.keyPath,
                           hookCtx;
                       errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
                       successHandler = hookedEventSuccessHandler(null);

                       tryCatch(function () {
                           for (var i = 0, l = objects.length; i < l; ++i) {
                               hookCtx = { onerror: null, onsuccess: null };
                               var key = keys && keys[i];
                               var obj = objects[i],
                                   effectiveKey = keys ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined,
                                   keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
                               if (effectiveKey == null && keyToUse != null) {
                                   if (keyPath) {
                                       obj = deepClone(obj);
                                       setByKeyPath(obj, keyPath, keyToUse);
                                   } else {
                                       key = keyToUse;
                                   }
                               }
                               req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                               req._hookCtx = hookCtx;
                               if (i < l - 1) {
                                   req.onerror = errorHandler;
                                   if (hookCtx.onsuccess) req.onsuccess = successHandler;
                               }
                           }
                       }, function (err) {
                           hookCtx.onerror && hookCtx.onerror(err);
                           throw err;
                       });

                       req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
                       req.onsuccess = hookedEventSuccessHandler(done);
                   } else {
                       //
                       // Standard Bulk (no 'creating' hook to care about)
                       //
                       errorHandler = BulkErrorHandlerCatchAll(errorList);
                       for (var i = 0, l = objects.length; i < l; ++i) {
                           req = keys ? idbstore.add(objects[i], keys[i]) : idbstore.add(objects[i]);
                           req.onerror = errorHandler;
                       }
                       // Only need to catch success or error on the last operation
                       // according to the IDB spec.
                       req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                       req.onsuccess = eventSuccessHandler(done);
                   }
               });
           },
           add: function (obj, key) {
               /// <summary>
               ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
               /// </summary>
               /// <param name="obj" type="Object">A javascript object to insert</param>
               /// <param name="key" optional="true">Primary key</param>
               var creatingHook = this.hook.creating.fire;
               return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                   var hookCtx = { onsuccess: null, onerror: null };
                   if (creatingHook !== nop) {
                       var effectiveKey = key != null ? key : idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined;
                       var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                       if (effectiveKey == null && keyToUse != null) {
                           // Using "==" and "!=" to check for either null or undefined!
                           if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
                       }
                   }
                   try {
                       var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                       req._hookCtx = hookCtx;
                       req.onerror = hookedEventRejectHandler(reject);
                       req.onsuccess = hookedEventSuccessHandler(function (result) {
                           // TODO: Remove these two lines in next major release (2.0?)
                           // It's no good practice to have side effects on provided parameters
                           var keyPath = idbstore.keyPath;
                           if (keyPath) setByKeyPath(obj, keyPath, result);
                           resolve(result);
                       });
                   } catch (e) {
                       if (hookCtx.onerror) hookCtx.onerror(e);
                       throw e;
                   }
               });
           },

           put: function (obj, key) {
               /// <summary>
               ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
               /// </summary>
               /// <param name="obj" type="Object">A javascript object to insert or update</param>
               /// <param name="key" optional="true">Primary key</param>
               var self = this,
                   creatingHook = this.hook.creating.fire,
                   updatingHook = this.hook.updating.fire;
               if (creatingHook !== nop || updatingHook !== nop) {
                   //
                   // People listens to when("creating") or when("updating") events!
                   // We must know whether the put operation results in an CREATE or UPDATE.
                   //
                   return this._trans(READWRITE, function (resolve, reject, trans) {
                       // Since key is optional, make sure we get it from obj if not provided
                       var effectiveKey = key !== undefined ? key : self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath);
                       if (effectiveKey == null) {
                           // "== null" means checking for either null or undefined.
                           // No primary key. Must use add().
                           trans.tables[self.name].add(obj).then(resolve, reject);
                       } else {
                           // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                           trans._lock(); // Needed because operation is splitted into modify() and add().
                           // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                           obj = deepClone(obj);
                           trans.tables[self.name].where(":id").equals(effectiveKey).modify(function () {
                               // Replace extisting value with our object
                               // CRUD event firing handled in WriteableCollection.modify()
                               this.value = obj;
                           }).then(function (count) {
                               if (count === 0) {
                                   // Object's key was not found. Add the object instead.
                                   // CRUD event firing will be done in add()
                                   return trans.tables[self.name].add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
                               } else {
                                       return effectiveKey; // Resolve with the provided key.
                                   }
                           }).finally(function () {
                               trans._unlock();
                           }).then(resolve, reject);
                       }
                   });
               } else {
                   // Use the standard IDB put() method.
                   return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                       var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
                       req.onerror = eventRejectHandler(reject);
                       req.onsuccess = function (ev) {
                           var keyPath = idbstore.keyPath;
                           if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                           resolve(req.result);
                       };
                   });
               }
           },

           'delete': function (key) {
               /// <param name="key">Primary key of the object to delete</param>
               if (this.hook.deleting.subscribers.length) {
                   // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                   // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
                   return this.where(":id").equals(key).delete();
               } else {
                   // No one listens. Use standard IDB delete() method.
                   return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                       var req = idbstore.delete(key);
                       req.onerror = eventRejectHandler(reject);
                       req.onsuccess = function () {
                           resolve(req.result);
                       };
                   });
               }
           },

           clear: function () {
               if (this.hook.deleting.subscribers.length) {
                   // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                   // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
                   return this.toCollection().delete();
               } else {
                   return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                       var req = idbstore.clear();
                       req.onerror = eventRejectHandler(reject);
                       req.onsuccess = function () {
                           resolve(req.result);
                       };
                   });
               }
           },

           update: function (keyOrObject, modifications) {
               if (typeof modifications !== 'object' || isArray(modifications)) throw new exceptions.InvalidArgument("Modifications must be an object.");
               if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
                   // object to modify. Also modify given object with the modifications:
                   keys(modifications).forEach(function (keyPath) {
                       setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                   });
                   var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                   if (key === undefined) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"), dbUncaught);
                   return this.where(":id").equals(key).modify(modifications);
               } else {
                   // key to modify
                   return this.where(":id").equals(keyOrObject).modify(modifications);
               }
           }
       });

       //
       //
       //
       // Transaction Class
       //
       //
       //
       function Transaction(mode, storeNames, dbschema, parent) {
           var _this2 = this;

           /// <summary>
           ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
           /// </summary>
           /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
           /// <param name="storeNames" type="Array">Array of table names to operate on</param>
           this.db = db;
           this.mode = mode;
           this.storeNames = storeNames;
           this.idbtrans = null;
           this.on = Events(this, "complete", "error", "abort");
           this.parent = parent || null;
           this.active = true;
           this._tables = null;
           this._reculock = 0;
           this._blockedFuncs = [];
           this._psd = null;
           this._dbschema = dbschema;
           this._resolve = null;
           this._reject = null;
           this._completion = new Promise(function (resolve, reject) {
               _this2._resolve = resolve;
               _this2._reject = reject;
           }).uncaught(dbUncaught);

           this._completion.then(function () {
               _this2.on.complete.fire();
           }, function (e) {
               _this2.on.error.fire(e);
               _this2.parent ? _this2.parent._reject(e) : _this2.active && _this2.idbtrans && _this2.idbtrans.abort();
               _this2.active = false;
               return rejection(e); // Indicate we actually DO NOT catch this error.
           });
       }

       props(Transaction.prototype, {
           //
           // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
           //
           _lock: function () {
               assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
               // Temporary set all requests into a pending queue if they are called before database is ready.
               ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
               if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
               return this;
           },
           _unlock: function () {
               assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
               if (--this._reculock === 0) {
                   if (!PSD.global) PSD.lockOwnerFor = null;
                   while (this._blockedFuncs.length > 0 && !this._locked()) {
                       var fn = this._blockedFuncs.shift();
                       try {
                           fn();
                       } catch (e) {}
                   }
               }
               return this;
           },
           _locked: function () {
               // Checks if any write-lock is applied on this transaction.
               // To simplify the Dexie API for extension implementations, we support recursive locks.
               // This is accomplished by using "Promise Specific Data" (PSD).
               // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
               // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
               //         * callback given to the Promise() constructor  (function (resolve, reject){...})
               //         * callbacks given to then()/catch()/finally() methods (function (value){...})
               // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
               // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
               // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
               return this._reculock && PSD.lockOwnerFor !== this;
           },
           create: function (idbtrans) {
               var _this3 = this;

               assert(!this.idbtrans);
               if (!idbtrans && !idbdb) {
                   switch (dbOpenError && dbOpenError.name) {
                       case "DatabaseClosedError":
                           // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                           throw new exceptions.DatabaseClosed(dbOpenError);
                       case "MissingAPIError":
                           // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                           throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                       default:
                           // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
                           throw new exceptions.OpenFailed(dbOpenError);
                   }
               }
               if (!this.active) throw new exceptions.TransactionInactive();
               assert(this._completion._state === null);

               idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
               idbtrans.onerror = wrap(function (ev) {
                   preventDefault(ev); // Prohibit default bubbling to window.error
                   _this3._reject(idbtrans.error);
               });
               idbtrans.onabort = wrap(function (ev) {
                   preventDefault(ev);
                   _this3.active && _this3._reject(new exceptions.Abort());
                   _this3.active = false;
                   _this3.on("abort").fire(ev);
               });
               idbtrans.oncomplete = wrap(function () {
                   _this3.active = false;
                   _this3._resolve();
               });
               return this;
           },
           _promise: function (mode, fn, bWriteLock) {
               var self = this;
               return newScope(function () {
                   var p;
                   // Read lock always
                   if (!self._locked()) {
                       p = self.active ? new Promise(function (resolve, reject) {
                           if (mode === READWRITE && self.mode !== READWRITE) throw new exceptions.ReadOnly("Transaction is readonly");
                           if (!self.idbtrans && mode) self.create();
                           if (bWriteLock) self._lock(); // Write lock if write operation is requested
                           fn(resolve, reject, self);
                       }) : rejection(new exceptions.TransactionInactive());
                       if (self.active && bWriteLock) p.finally(function () {
                           self._unlock();
                       });
                   } else {
                       // Transaction is write-locked. Wait for mutex.
                       p = new Promise(function (resolve, reject) {
                           self._blockedFuncs.push(function () {
                               self._promise(mode, fn, bWriteLock).then(resolve, reject);
                           });
                       });
                   }
                   p._lib = true;
                   return p.uncaught(dbUncaught);
               });
           },

           //
           // Transaction Public Properties and Methods
           //
           abort: function () {
               this.active && this._reject(new exceptions.Abort());
               this.active = false;
           },

           // Deprecate:
           tables: {
               get: function () {
                   if (this._tables) return this._tables;
                   return this._tables = arrayToObject(this.storeNames, function (name) {
                       return [name, allTables[name]];
                   });
               }
           },

           // Deprecate:
           complete: function (cb) {
               return this.on("complete", cb);
           },

           // Deprecate:
           error: function (cb) {
               return this.on("error", cb);
           },

           // Deprecate
           table: function (name) {
               if (this.storeNames.indexOf(name) === -1) throw new exceptions.InvalidTable("Table " + name + " not in transaction");
               return allTables[name];
           }
       });

       //
       //
       //
       // WhereClause
       //
       //
       //
       function WhereClause(table, index, orCollection) {
           /// <param name="table" type="Table"></param>
           /// <param name="index" type="String" optional="true"></param>
           /// <param name="orCollection" type="Collection" optional="true"></param>
           this._ctx = {
               table: table,
               index: index === ":id" ? null : index,
               collClass: table._collClass,
               or: orCollection
           };
       }

       props(WhereClause.prototype, function () {

           // WhereClause private methods

           function fail(collectionOrWhereClause, err, T) {
               var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause._ctx.collClass(collectionOrWhereClause) : collectionOrWhereClause;

               collection._ctx.error = T ? new T(err) : new TypeError(err);
               return collection;
           }

           function emptyCollection(whereClause) {
               return new whereClause._ctx.collClass(whereClause, function () {
                   return IDBKeyRange.only("");
               }).limit(0);
           }

           function upperFactory(dir) {
               return dir === "next" ? function (s) {
                   return s.toUpperCase();
               } : function (s) {
                   return s.toLowerCase();
               };
           }
           function lowerFactory(dir) {
               return dir === "next" ? function (s) {
                   return s.toLowerCase();
               } : function (s) {
                   return s.toUpperCase();
               };
           }
           function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
               var length = Math.min(key.length, lowerNeedle.length);
               var llp = -1;
               for (var i = 0; i < length; ++i) {
                   var lwrKeyChar = lowerKey[i];
                   if (lwrKeyChar !== lowerNeedle[i]) {
                       if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                       if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                       if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                       return null;
                   }
                   if (cmp(key[i], lwrKeyChar) < 0) llp = i;
               }
               if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
               if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
               return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
           }

           function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
               /// <param name="needles" type="Array" elementType="String"></param>
               var upper,
                   lower,
                   compare,
                   upperNeedles,
                   lowerNeedles,
                   direction,
                   nextKeySuffix,
                   needlesLen = needles.length;
               if (!needles.every(function (s) {
                   return typeof s === 'string';
               })) {
                   return fail(whereClause, STRING_EXPECTED);
               }
               function initDirection(dir) {
                   upper = upperFactory(dir);
                   lower = lowerFactory(dir);
                   compare = dir === "next" ? simpleCompare : simpleCompareReverse;
                   var needleBounds = needles.map(function (needle) {
                       return { lower: lower(needle), upper: upper(needle) };
                   }).sort(function (a, b) {
                       return compare(a.lower, b.lower);
                   });
                   upperNeedles = needleBounds.map(function (nb) {
                       return nb.upper;
                   });
                   lowerNeedles = needleBounds.map(function (nb) {
                       return nb.lower;
                   });
                   direction = dir;
                   nextKeySuffix = dir === "next" ? "" : suffix;
               }
               initDirection("next");

               var c = new whereClause._ctx.collClass(whereClause, function () {
                   return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
               });

               c._ondirectionchange = function (direction) {
                   // This event onlys occur before filter is called the first time.
                   initDirection(direction);
               };

               var firstPossibleNeedle = 0;

               c._addAlgorithm(function (cursor, advance, resolve) {
                   /// <param name="cursor" type="IDBCursor"></param>
                   /// <param name="advance" type="Function"></param>
                   /// <param name="resolve" type="Function"></param>
                   var key = cursor.key;
                   if (typeof key !== 'string') return false;
                   var lowerKey = lower(key);
                   if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                       return true;
                   } else {
                       var lowestPossibleCasing = null;
                       for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                           var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                           if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i + 1;else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                               lowestPossibleCasing = casing;
                           }
                       }
                       if (lowestPossibleCasing !== null) {
                           advance(function () {
                               cursor.continue(lowestPossibleCasing + nextKeySuffix);
                           });
                       } else {
                           advance(resolve);
                       }
                       return false;
                   }
               });
               return c;
           }

           //
           // WhereClause public methods
           //
           return {
               between: function (lower, upper, includeLower, includeUpper) {
                   /// <summary>
                   ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                   /// </summary>
                   /// <param name="lower"></param>
                   /// <param name="upper"></param>
                   /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                   /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                   /// <returns type="Collection"></returns>
                   includeLower = includeLower !== false; // Default to true
                   includeUpper = includeUpper === true; // Default to false
                   try {
                       if (cmp(lower, upper) > 0 || cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                       return new this._ctx.collClass(this, function () {
                           return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
                       });
                   } catch (e) {
                       return fail(this, INVALID_KEY_ARGUMENT);
                   }
               },
               equals: function (value) {
                   return new this._ctx.collClass(this, function () {
                       return IDBKeyRange.only(value);
                   });
               },
               above: function (value) {
                   return new this._ctx.collClass(this, function () {
                       return IDBKeyRange.lowerBound(value, true);
                   });
               },
               aboveOrEqual: function (value) {
                   return new this._ctx.collClass(this, function () {
                       return IDBKeyRange.lowerBound(value);
                   });
               },
               below: function (value) {
                   return new this._ctx.collClass(this, function () {
                       return IDBKeyRange.upperBound(value, true);
                   });
               },
               belowOrEqual: function (value) {
                   return new this._ctx.collClass(this, function () {
                       return IDBKeyRange.upperBound(value);
                   });
               },
               startsWith: function (str) {
                   /// <param name="str" type="String"></param>
                   if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
                   return this.between(str, str + maxString, true, true);
               },
               startsWithIgnoreCase: function (str) {
                   /// <param name="str" type="String"></param>
                   if (str === "") return this.startsWith(str);
                   return addIgnoreCaseAlgorithm(this, function (x, a) {
                       return x.indexOf(a[0]) === 0;
                   }, [str], maxString);
               },
               equalsIgnoreCase: function (str) {
                   /// <param name="str" type="String"></param>
                   return addIgnoreCaseAlgorithm(this, function (x, a) {
                       return x === a[0];
                   }, [str], "");
               },
               anyOfIgnoreCase: function () {
                   var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                   if (set.length === 0) return emptyCollection(this);
                   return addIgnoreCaseAlgorithm(this, function (x, a) {
                       return a.indexOf(x) !== -1;
                   }, set, "");
               },
               startsWithAnyOfIgnoreCase: function () {
                   var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                   if (set.length === 0) return emptyCollection(this);
                   return addIgnoreCaseAlgorithm(this, function (x, a) {
                       return a.some(function (n) {
                           return x.indexOf(n) === 0;
                       });
                   }, set, maxString);
               },
               anyOf: function () {
                   var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                   var compare = ascending;
                   try {
                       set.sort(compare);
                   } catch (e) {
                       return fail(this, INVALID_KEY_ARGUMENT);
                   }
                   if (set.length === 0) return emptyCollection(this);
                   var c = new this._ctx.collClass(this, function () {
                       return IDBKeyRange.bound(set[0], set[set.length - 1]);
                   });

                   c._ondirectionchange = function (direction) {
                       compare = direction === "next" ? ascending : descending;
                       set.sort(compare);
                   };
                   var i = 0;
                   c._addAlgorithm(function (cursor, advance, resolve) {
                       var key = cursor.key;
                       while (compare(key, set[i]) > 0) {
                           // The cursor has passed beyond this key. Check next.
                           ++i;
                           if (i === set.length) {
                               // There is no next. Stop searching.
                               advance(resolve);
                               return false;
                           }
                       }
                       if (compare(key, set[i]) === 0) {
                           // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                           return true;
                       } else {
                           // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                           advance(function () {
                               cursor.continue(set[i]);
                           });
                           return false;
                       }
                   });
                   return c;
               },

               notEqual: function (value) {
                   return this.inAnyRange([[-Infinity, value], [value, maxKey]], { includeLowers: false, includeUppers: false });
               },

               noneOf: function () {
                   var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                   if (set.length === 0) return new this._ctx.collClass(this); // Return entire collection.
                   try {
                       set.sort(ascending);
                   } catch (e) {
                       return fail(this, INVALID_KEY_ARGUMENT);
                   }
                   // Transform ["a","b","c"] to a set of ranges for between/above/below: [[-Infinity,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
                   var ranges = set.reduce(function (res, val) {
                       return res ? res.concat([[res[res.length - 1][1], val]]) : [[-Infinity, val]];
                   }, null);
                   ranges.push([set[set.length - 1], maxKey]);
                   return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
               },

               /** Filter out values withing given set of ranges.
               * Example, give children and elders a rebate of 50%:
               *
               *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
               *
               * @param {(string|number|Date|Array)[][]} ranges
               * @param {{includeLowers: boolean, includeUppers: boolean}} options
               */
               inAnyRange: function (ranges, options) {
                   var ctx = this._ctx;
                   if (ranges.length === 0) return emptyCollection(this);
                   if (!ranges.every(function (range) {
                       return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
                   })) {
                       return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
                   }
                   var includeLowers = !options || options.includeLowers !== false; // Default to true
                   var includeUppers = options && options.includeUppers === true; // Default to false

                   function addRange(ranges, newRange) {
                       for (var i = 0, l = ranges.length; i < l; ++i) {
                           var range = ranges[i];
                           if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                               range[0] = min(range[0], newRange[0]);
                               range[1] = max(range[1], newRange[1]);
                               break;
                           }
                       }
                       if (i === l) ranges.push(newRange);
                       return ranges;
                   }

                   var sortDirection = ascending;
                   function rangeSorter(a, b) {
                       return sortDirection(a[0], b[0]);
                   }

                   // Join overlapping ranges
                   var set;
                   try {
                       set = ranges.reduce(addRange, []);
                       set.sort(rangeSorter);
                   } catch (ex) {
                       return fail(this, INVALID_KEY_ARGUMENT);
                   }

                   var i = 0;
                   var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
                       return ascending(key, set[i][1]) > 0;
                   } : function (key) {
                       return ascending(key, set[i][1]) >= 0;
                   };

                   var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
                       return descending(key, set[i][0]) > 0;
                   } : function (key) {
                       return descending(key, set[i][0]) >= 0;
                   };

                   function keyWithinCurrentRange(key) {
                       return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
                   }

                   var checkKey = keyIsBeyondCurrentEntry;

                   var c = new ctx.collClass(this, function () {
                       return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
                   });

                   c._ondirectionchange = function (direction) {
                       if (direction === "next") {
                           checkKey = keyIsBeyondCurrentEntry;
                           sortDirection = ascending;
                       } else {
                           checkKey = keyIsBeforeCurrentEntry;
                           sortDirection = descending;
                       }
                       set.sort(rangeSorter);
                   };

                   c._addAlgorithm(function (cursor, advance, resolve) {
                       var key = cursor.key;
                       while (checkKey(key)) {
                           // The cursor has passed beyond this key. Check next.
                           ++i;
                           if (i === set.length) {
                               // There is no next. Stop searching.
                               advance(resolve);
                               return false;
                           }
                       }
                       if (keyWithinCurrentRange(key)) {
                           // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                           return true;
                       } else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
                           // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
                           // Continue to next key but don't include this one.
                           return false;
                       } else {
                           // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                           advance(function () {
                               if (sortDirection === ascending) cursor.continue(set[i][0]);else cursor.continue(set[i][1]);
                           });
                           return false;
                       }
                   });
                   return c;
               },
               startsWithAnyOf: function () {
                   var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);

                   if (!set.every(function (s) {
                       return typeof s === 'string';
                   })) {
                       return fail(this, "startsWithAnyOf() only works with strings");
                   }
                   if (set.length === 0) return emptyCollection(this);

                   return this.inAnyRange(set.map(function (str) {
                       return [str, str + maxString];
                   }));
               }
           };
       });

       //
       //
       //
       // Collection Class
       //
       //
       //
       function Collection(whereClause, keyRangeGenerator) {
           /// <summary>
           ///
           /// </summary>
           /// <param name="whereClause" type="WhereClause">Where clause instance</param>
           /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
           var keyRange = null,
               error = null;
           if (keyRangeGenerator) try {
               keyRange = keyRangeGenerator();
           } catch (ex) {
               error = ex;
           }

           var whereCtx = whereClause._ctx,
               table = whereCtx.table;
           this._ctx = {
               table: table,
               index: whereCtx.index,
               isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
               range: keyRange,
               keysOnly: false,
               dir: "next",
               unique: "",
               algorithm: null,
               filter: null,
               replayFilter: null,
               justLimit: true, // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
               isMatch: null,
               offset: 0,
               limit: Infinity,
               error: error, // If set, any promise must be rejected with this error
               or: whereCtx.or,
               valueMapper: table.hook.reading.fire
           };
       }

       function isPlainKeyRange(ctx, ignoreLimitFilter) {
           return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
       }

       props(Collection.prototype, function () {

           //
           // Collection Private Functions
           //

           function addFilter(ctx, fn) {
               ctx.filter = combine(ctx.filter, fn);
           }

           function addReplayFilter(ctx, factory, isLimitFilter) {
               var curr = ctx.replayFilter;
               ctx.replayFilter = curr ? function () {
                   return combine(curr(), factory());
               } : factory;
               ctx.justLimit = isLimitFilter && !curr;
           }

           function addMatchFilter(ctx, fn) {
               ctx.isMatch = combine(ctx.isMatch, fn);
           }

           /** @param ctx {
            *      isPrimKey: boolean,
            *      table: Table,
            *      index: string
            * }
            * @param store IDBObjectStore
            **/
           function getIndexOrStore(ctx, store) {
               if (ctx.isPrimKey) return store;
               var indexSpec = ctx.table.schema.idxByName[ctx.index];
               if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
               return store.index(indexSpec.name);
           }

           /** @param ctx {
            *      isPrimKey: boolean,
            *      table: Table,
            *      index: string,
            *      keysOnly: boolean,
            *      range?: IDBKeyRange,
            *      dir: "next" | "prev"
            * }
            */
           function openCursor(ctx, store) {
               var idxOrStore = getIndexOrStore(ctx, store);
               return ctx.keysOnly && 'openKeyCursor' in idxOrStore ? idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) : idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
           }

           function iter(ctx, fn, resolve, reject, idbstore) {
               var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
               if (!ctx.or) {
                   iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
               } else (function () {
                   var set = {};
                   var resolved = 0;

                   function resolveboth() {
                       if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                   }

                   function union(item, cursor, advance) {
                       if (!filter || filter(cursor, advance, resolveboth, reject)) {
                           var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                           if (!hasOwn(set, key)) {
                               set[key] = true;
                               fn(item, cursor, advance);
                           }
                       }
                   }

                   ctx.or._iterate(union, resolveboth, reject, idbstore);
                   iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
               })();
           }
           function getInstanceTemplate(ctx) {
               return ctx.table.schema.instanceTemplate;
           }

           return {

               //
               // Collection Protected Functions
               //

               _read: function (fn, cb) {
                   var ctx = this._ctx;
                   if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                       reject(ctx.error);
                   });else return ctx.table._idbstore(READONLY, fn).then(cb);
               },
               _write: function (fn) {
                   var ctx = this._ctx;
                   if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                       reject(ctx.error);
                   });else return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
               },
               _addAlgorithm: function (fn) {
                   var ctx = this._ctx;
                   ctx.algorithm = combine(ctx.algorithm, fn);
               },

               _iterate: function (fn, resolve, reject, idbstore) {
                   return iter(this._ctx, fn, resolve, reject, idbstore);
               },

               clone: function (props) {
                   var rv = Object.create(this.constructor.prototype),
                       ctx = Object.create(this._ctx);
                   if (props) extend(ctx, props);
                   rv._ctx = ctx;
                   return rv;
               },

               raw: function () {
                   this._ctx.valueMapper = null;
                   return this;
               },

               //
               // Collection Public methods
               //

               each: function (fn) {
                   var ctx = this._ctx;

                   if (fake) {
                       var item = getInstanceTemplate(ctx),
                           primKeyPath = ctx.table.schema.primKey.keyPath,
                           key = getByKeyPath(item, ctx.index ? ctx.table.schema.idxByName[ctx.index].keyPath : primKeyPath),
                           primaryKey = getByKeyPath(item, primKeyPath);
                       fn(item, { key: key, primaryKey: primaryKey });
                   }

                   return this._read(function (resolve, reject, idbstore) {
                       iter(ctx, fn, resolve, reject, idbstore);
                   });
               },

               count: function (cb) {
                   if (fake) return Promise.resolve(0).then(cb);
                   var ctx = this._ctx;

                   if (isPlainKeyRange(ctx, true)) {
                       // This is a plain key range. We can use the count() method if the index.
                       return this._read(function (resolve, reject, idbstore) {
                           var idx = getIndexOrStore(ctx, idbstore);
                           var req = ctx.range ? idx.count(ctx.range) : idx.count();
                           req.onerror = eventRejectHandler(reject);
                           req.onsuccess = function (e) {
                               resolve(Math.min(e.target.result, ctx.limit));
                           };
                       }, cb);
                   } else {
                       // Algorithms, filters or expressions are applied. Need to count manually.
                       var count = 0;
                       return this._read(function (resolve, reject, idbstore) {
                           iter(ctx, function () {
                               ++count;return false;
                           }, function () {
                               resolve(count);
                           }, reject, idbstore);
                       }, cb);
                   }
               },

               sortBy: function (keyPath, cb) {
                   /// <param name="keyPath" type="String"></param>
                   var parts = keyPath.split('.').reverse(),
                       lastPart = parts[0],
                       lastIndex = parts.length - 1;
                   function getval(obj, i) {
                       if (i) return getval(obj[parts[i]], i - 1);
                       return obj[lastPart];
                   }
                   var order = this._ctx.dir === "next" ? 1 : -1;

                   function sorter(a, b) {
                       var aVal = getval(a, lastIndex),
                           bVal = getval(b, lastIndex);
                       return aVal < bVal ? -order : aVal > bVal ? order : 0;
                   }
                   return this.toArray(function (a) {
                       return a.sort(sorter);
                   }).then(cb);
               },

               toArray: function (cb) {
                   var ctx = this._ctx;
                   return this._read(function (resolve, reject, idbstore) {
                       fake && resolve([getInstanceTemplate(ctx)]);
                       if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                           // Special optimation if we could use IDBObjectStore.getAll() or
                           // IDBKeyRange.getAll():
                           var readingHook = ctx.table.hook.reading.fire;
                           var idxOrStore = getIndexOrStore(ctx, idbstore);
                           var req = ctx.limit < Infinity ? idxOrStore.getAll(ctx.range, ctx.limit) : idxOrStore.getAll(ctx.range);
                           req.onerror = eventRejectHandler(reject);
                           req.onsuccess = readingHook === mirror ? eventSuccessHandler(resolve) : wrap(eventSuccessHandler(function (res) {
                               resolve(res.map(readingHook));
                           }));
                       } else {
                           // Getting array through a cursor.
                           var a = [];
                           iter(ctx, function (item) {
                               a.push(item);
                           }, function arrayComplete() {
                               resolve(a);
                           }, reject, idbstore);
                       }
                   }, cb);
               },

               offset: function (offset) {
                   var ctx = this._ctx;
                   if (offset <= 0) return this;
                   ctx.offset += offset; // For count()
                   if (isPlainKeyRange(ctx)) {
                       addReplayFilter(ctx, function () {
                           var offsetLeft = offset;
                           return function (cursor, advance) {
                               if (offsetLeft === 0) return true;
                               if (offsetLeft === 1) {
                                   --offsetLeft;return false;
                               }
                               advance(function () {
                                   cursor.advance(offsetLeft);
                                   offsetLeft = 0;
                               });
                               return false;
                           };
                       });
                   } else {
                       addReplayFilter(ctx, function () {
                           var offsetLeft = offset;
                           return function () {
                               return --offsetLeft < 0;
                           };
                       });
                   }
                   return this;
               },

               limit: function (numRows) {
                   this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                   addReplayFilter(this._ctx, function () {
                       var rowsLeft = numRows;
                       return function (cursor, advance, resolve) {
                           if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included
                           return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                       };
                   }, true);
                   return this;
               },

               until: function (filterFunction, bIncludeStopEntry) {
                   var ctx = this._ctx;
                   fake && filterFunction(getInstanceTemplate(ctx));
                   addFilter(this._ctx, function (cursor, advance, resolve) {
                       if (filterFunction(cursor.value)) {
                           advance(resolve);
                           return bIncludeStopEntry;
                       } else {
                           return true;
                       }
                   });
                   return this;
               },

               first: function (cb) {
                   return this.limit(1).toArray(function (a) {
                       return a[0];
                   }).then(cb);
               },

               last: function (cb) {
                   return this.reverse().first(cb);
               },

               filter: function (filterFunction) {
                   /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                   fake && filterFunction(getInstanceTemplate(this._ctx));
                   addFilter(this._ctx, function (cursor) {
                       return filterFunction(cursor.value);
                   });
                   // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
                   // collection for a match without querying DB. Used by Dexie.Observable.
                   addMatchFilter(this._ctx, filterFunction);
                   return this;
               },

               and: function (filterFunction) {
                   return this.filter(filterFunction);
               },

               or: function (indexName) {
                   return new WhereClause(this._ctx.table, indexName, this);
               },

               reverse: function () {
                   this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
                   if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
                   return this;
               },

               desc: function () {
                   return this.reverse();
               },

               eachKey: function (cb) {
                   var ctx = this._ctx;
                   ctx.keysOnly = !ctx.isMatch;
                   return this.each(function (val, cursor) {
                       cb(cursor.key, cursor);
                   });
               },

               eachUniqueKey: function (cb) {
                   this._ctx.unique = "unique";
                   return this.eachKey(cb);
               },

               eachPrimaryKey: function (cb) {
                   var ctx = this._ctx;
                   ctx.keysOnly = !ctx.isMatch;
                   return this.each(function (val, cursor) {
                       cb(cursor.primaryKey, cursor);
                   });
               },

               keys: function (cb) {
                   var ctx = this._ctx;
                   ctx.keysOnly = !ctx.isMatch;
                   var a = [];
                   return this.each(function (item, cursor) {
                       a.push(cursor.key);
                   }).then(function () {
                       return a;
                   }).then(cb);
               },

               primaryKeys: function (cb) {
                   var ctx = this._ctx;
                   if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                       // Special optimation if we could use IDBObjectStore.getAllKeys() or
                       // IDBKeyRange.getAllKeys():
                       return this._read(function (resolve, reject, idbstore) {
                           var idxOrStore = getIndexOrStore(ctx, idbstore);
                           var req = ctx.limit < Infinity ? idxOrStore.getAllKeys(ctx.range, ctx.limit) : idxOrStore.getAllKeys(ctx.range);
                           req.onerror = eventRejectHandler(reject);
                           req.onsuccess = eventSuccessHandler(resolve);
                       }).then(cb);
                   }
                   ctx.keysOnly = !ctx.isMatch;
                   var a = [];
                   return this.each(function (item, cursor) {
                       a.push(cursor.primaryKey);
                   }).then(function () {
                       return a;
                   }).then(cb);
               },

               uniqueKeys: function (cb) {
                   this._ctx.unique = "unique";
                   return this.keys(cb);
               },

               firstKey: function (cb) {
                   return this.limit(1).keys(function (a) {
                       return a[0];
                   }).then(cb);
               },

               lastKey: function (cb) {
                   return this.reverse().firstKey(cb);
               },

               distinct: function () {
                   var ctx = this._ctx,
                       idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
                   if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.
                   var set = {};
                   addFilter(this._ctx, function (cursor) {
                       var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                       var found = hasOwn(set, strKey);
                       set[strKey] = true;
                       return !found;
                   });
                   return this;
               }
           };
       });

       //
       //
       // WriteableCollection Class
       //
       //
       function WriteableCollection() {
           Collection.apply(this, arguments);
       }

       derive(WriteableCollection).from(Collection).extend({

           //
           // WriteableCollection Public Methods
           //

           modify: function (changes) {
               var self = this,
                   ctx = this._ctx,
                   hook = ctx.table.hook,
                   updatingHook = hook.updating.fire,
                   deletingHook = hook.deleting.fire;

               fake && typeof changes === 'function' && changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);

               return this._write(function (resolve, reject, idbstore, trans) {
                   var modifyer;
                   if (typeof changes === 'function') {
                       // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                       if (updatingHook === nop && deletingHook === nop) {
                           // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                           modifyer = changes;
                       } else {
                           // People want to know exactly what is being modified or deleted.
                           // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                           // and call the hooks accordingly!
                           modifyer = function (item) {
                               var origItem = deepClone(item); // Clone the item first so we can compare laters.
                               if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                               if (!hasOwn(this, "value")) {
                                   // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                   deletingHook.call(this, this.primKey, item, trans);
                               } else {
                                   // No deletion. Check what was changed
                                   var objectDiff = getObjectDiff(origItem, this.value);
                                   var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                   if (additionalChanges) {
                                       // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                       item = this.value;
                                       keys(additionalChanges).forEach(function (keyPath) {
                                           setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                       });
                                   }
                               }
                           };
                       }
                   } else if (updatingHook === nop) {
                           // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                           var keyPaths = keys(changes);
                           var numKeys = keyPaths.length;
                           modifyer = function (item) {
                               var anythingModified = false;
                               for (var i = 0; i < numKeys; ++i) {
                                   var keyPath = keyPaths[i],
                                       val = changes[keyPath];
                                   if (getByKeyPath(item, keyPath) !== val) {
                                       setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                       anythingModified = true;
                                   }
                               }
                               return anythingModified;
                           };
                       } else {
                           // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                           // allow it to add additional modifications to make.
                           var origChanges = changes;
                           changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                           modifyer = function (item) {
                               var anythingModified = false;
                               var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                               if (additionalChanges) extend(changes, additionalChanges);
                               keys(changes).forEach(function (keyPath) {
                                   var val = changes[keyPath];
                                   if (getByKeyPath(item, keyPath) !== val) {
                                       setByKeyPath(item, keyPath, val);
                                       anythingModified = true;
                                   }
                               });
                               if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
                               return anythingModified;
                           };
                       }

                   var count = 0;
                   var successCount = 0;
                   var iterationComplete = false;
                   var failures = [];
                   var failKeys = [];
                   var currentKey = null;

                   function modifyItem(item, cursor) {
                       currentKey = cursor.primaryKey;
                       var thisContext = {
                           primKey: cursor.primaryKey,
                           value: item,
                           onsuccess: null,
                           onerror: null
                       };

                       function onerror(e) {
                           failures.push(e);
                           failKeys.push(thisContext.primKey);
                           checkFinished();
                           return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                       }

                       if (modifyer.call(thisContext, item, thisContext) !== false) {
                           // If a callback explicitely returns false, do not perform the update!
                           var bDelete = !hasOwn(thisContext, "value");
                           ++count;
                           tryCatch(function () {
                               var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
                               req._hookCtx = thisContext;
                               req.onerror = hookedEventRejectHandler(onerror);
                               req.onsuccess = hookedEventSuccessHandler(function () {
                                   ++successCount;
                                   checkFinished();
                               });
                           }, onerror);
                       } else if (thisContext.onsuccess) {
                           // Hook will expect either onerror or onsuccess to always be called!
                           thisContext.onsuccess(thisContext.value);
                       }
                   }

                   function doReject(e) {
                       if (e) {
                           failures.push(e);
                           failKeys.push(currentKey);
                       }
                       return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                   }

                   function checkFinished() {
                       if (iterationComplete && successCount + failures.length === count) {
                           if (failures.length > 0) doReject();else resolve(successCount);
                       }
                   }
                   self.clone().raw()._iterate(modifyItem, function () {
                       iterationComplete = true;
                       checkFinished();
                   }, doReject, idbstore);
               });
           },

           'delete': function () {
               var _this4 = this;

               var ctx = this._ctx,
                   range = ctx.range,
                   deletingHook = ctx.table.hook.deleting.fire,
                   hasDeleteHook = deletingHook !== nop;
               if (!hasDeleteHook && isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || !range)) // if no range, we'll use clear().
                   {
                       // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
                       // For chromium, this is the way most optimized version.
                       // For IE/Edge, this could hang the indexedDB engine and make operating system instable
                       // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
                       return this._write(function (resolve, reject, idbstore) {
                           // Our API contract is to return a count of deleted items, so we have to count() before delete().
                           var onerror = eventRejectHandler(reject),
                               countReq = range ? idbstore.count(range) : idbstore.count();
                           countReq.onerror = onerror;
                           countReq.onsuccess = function () {
                               var count = countReq.result;
                               tryCatch(function () {
                                   var delReq = range ? idbstore.delete(range) : idbstore.clear();
                                   delReq.onerror = onerror;
                                   delReq.onsuccess = function () {
                                       return resolve(count);
                                   };
                               }, function (err) {
                                   return reject(err);
                               });
                           };
                       });
                   }

               // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
               // Divide into chunks to not starve RAM.
               // If has delete hook, we will have to collect not just keys but also objects, so it will use
               // more memory and need lower chunk size.
               var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;

               return this._write(function (resolve, reject, idbstore, trans) {
                   var totalCount = 0;
                   // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
                   var collection = _this4.clone({
                       keysOnly: !ctx.isMatch && !hasDeleteHook }) // load just keys (unless filter() or and() or deleteHook has subscribers)
                   .distinct() // In case multiEntry is used, never delete same key twice because resulting count
                   // would become larger than actual delete count.
                   .limit(CHUNKSIZE).raw(); // Don't filter through reading-hooks (like mapped classes etc)

                   var keysOrTuples = [];

                   // We're gonna do things on as many chunks that are needed.
                   // Use recursion of nextChunk function:
                   var nextChunk = function () {
                       return collection.each(hasDeleteHook ? function (val, cursor) {
                           // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
                           // so that the hook can be called with its values in bulkDelete().
                           keysOrTuples.push([cursor.primaryKey, cursor.value]);
                       } : function (val, cursor) {
                           // No one subscribes to hook('deleting'). Collect only primary keys:
                           keysOrTuples.push(cursor.primaryKey);
                       }).then(function () {
                           // Chromium deletes faster when doing it in sort order.
                           hasDeleteHook ? keysOrTuples.sort(function (a, b) {
                               return ascending(a[0], b[0]);
                           }) : keysOrTuples.sort(ascending);
                           return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
                       }).then(function () {
                           var count = keysOrTuples.length;
                           totalCount += count;
                           keysOrTuples = [];
                           return count < CHUNKSIZE ? totalCount : nextChunk();
                       });
                   };

                   resolve(nextChunk());
               });
           }
       });

       //
       //
       //
       // ------------------------- Help functions ---------------------------
       //
       //
       //

       function lowerVersionFirst(a, b) {
           return a._cfg.version - b._cfg.version;
       }

       function setApiOnPlace(objs, tableNames, mode, dbschema) {
           tableNames.forEach(function (tableName) {
               var tableInstance = db._tableFactory(mode, dbschema[tableName]);
               objs.forEach(function (obj) {
                   tableName in obj || (obj[tableName] = tableInstance);
               });
           });
       }

       function removeTablesApi(objs) {
           objs.forEach(function (obj) {
               for (var key in obj) {
                   if (obj[key] instanceof Table) delete obj[key];
               }
           });
       }

       function iterate(req, filter, fn, resolve, reject, valueMapper) {

           // Apply valueMapper (hook('reading') or mappped class)
           var mappedFn = valueMapper ? function (x, c, a) {
               return fn(valueMapper(x), c, a);
           } : fn;
           // Wrap fn with PSD and microtick stuff from Promise.
           var wrappedFn = wrap(mappedFn, reject);

           if (!req.onerror) req.onerror = eventRejectHandler(reject);
           if (filter) {
               req.onsuccess = trycatcher(function filter_record() {
                   var cursor = req.result;
                   if (cursor) {
                       var c = function () {
                           cursor.continue();
                       };
                       if (filter(cursor, function (advancer) {
                           c = advancer;
                       }, resolve, reject)) wrappedFn(cursor.value, cursor, function (advancer) {
                           c = advancer;
                       });
                       c();
                   } else {
                       resolve();
                   }
               }, reject);
           } else {
               req.onsuccess = trycatcher(function filter_record() {
                   var cursor = req.result;
                   if (cursor) {
                       var c = function () {
                           cursor.continue();
                       };
                       wrappedFn(cursor.value, cursor, function (advancer) {
                           c = advancer;
                       });
                       c();
                   } else {
                       resolve();
                   }
               }, reject);
           }
       }

       function parseIndexSyntax(indexes) {
           /// <param name="indexes" type="String"></param>
           /// <returns type="Array" elementType="IndexSpec"></returns>
           var rv = [];
           indexes.split(',').forEach(function (index) {
               index = index.trim();
               var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
               // Let keyPath of "[a+b]" be ["a","b"]:
               var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;

               rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
           });
           return rv;
       }

       function cmp(key1, key2) {
           return indexedDB.cmp(key1, key2);
       }

       function min(a, b) {
           return cmp(a, b) < 0 ? a : b;
       }

       function max(a, b) {
           return cmp(a, b) > 0 ? a : b;
       }

       function ascending(a, b) {
           return indexedDB.cmp(a, b);
       }

       function descending(a, b) {
           return indexedDB.cmp(b, a);
       }

       function simpleCompare(a, b) {
           return a < b ? -1 : a === b ? 0 : 1;
       }

       function simpleCompareReverse(a, b) {
           return a > b ? -1 : a === b ? 0 : 1;
       }

       function combine(filter1, filter2) {
           return filter1 ? filter2 ? function () {
               return filter1.apply(this, arguments) && filter2.apply(this, arguments);
           } : filter1 : filter2;
       }

       function readGlobalSchema() {
           db.verno = idbdb.version / 10;
           db._dbSchema = globalSchema = {};
           dbStoreNames = slice(idbdb.objectStoreNames, 0);
           if (dbStoreNames.length === 0) return; // Database contains no stores.
           var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
           dbStoreNames.forEach(function (storeName) {
               var store = trans.objectStore(storeName),
                   keyPath = store.keyPath,
                   dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
               var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
               var indexes = [];
               for (var j = 0; j < store.indexNames.length; ++j) {
                   var idbindex = store.index(store.indexNames[j]);
                   keyPath = idbindex.keyPath;
                   dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                   var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                   indexes.push(index);
               }
               globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
           });
           setApiOnPlace([allTables, Transaction.prototype], keys(globalSchema), READWRITE, globalSchema);
       }

       function adjustToExistingIndexNames(schema, idbtrans) {
           /// <summary>
           /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
           /// </summary>
           /// <param name="schema" type="Object">Map between name and TableSchema</param>
           /// <param name="idbtrans" type="IDBTransaction"></param>
           var storeNames = idbtrans.db.objectStoreNames;
           for (var i = 0; i < storeNames.length; ++i) {
               var storeName = storeNames[i];
               var store = idbtrans.objectStore(storeName);
               hasGetAll = 'getAll' in store;
               for (var j = 0; j < store.indexNames.length; ++j) {
                   var indexName = store.indexNames[j];
                   var keyPath = store.index(indexName).keyPath;
                   var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                   if (schema[storeName]) {
                       var indexSpec = schema[storeName].idxByName[dexieName];
                       if (indexSpec) indexSpec.name = indexName;
                   }
               }
           }
       }

       function fireOnBlocked(ev) {
           db.on("blocked").fire(ev);
           // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
           connections.filter(function (c) {
               return c.name === db.name && c !== db && !c._vcFired;
           }).map(function (c) {
               return c.on("versionchange").fire(ev);
           });
       }

       extend(this, {
           Collection: Collection,
           Table: Table,
           Transaction: Transaction,
           Version: Version,
           WhereClause: WhereClause,
           WriteableCollection: WriteableCollection,
           WriteableTable: WriteableTable
       });

       init();

       addons.forEach(function (fn) {
           fn(db);
       });
   }

   var fakeAutoComplete = function () {}; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())
   var fake = false; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())

   function parseType(type) {
       if (typeof type === 'function') {
           return new type();
       } else if (isArray(type)) {
           return [parseType(type[0])];
       } else if (type && typeof type === 'object') {
           var rv = {};
           applyStructure(rv, type);
           return rv;
       } else {
           return type;
       }
   }

   function applyStructure(obj, structure) {
       keys(structure).forEach(function (member) {
           var value = parseType(structure[member]);
           obj[member] = value;
       });
       return obj;
   }

   function eventSuccessHandler(done) {
       return function (ev) {
           done(ev.target.result);
       };
   }

   function hookedEventSuccessHandler(resolve) {
       // wrap() is needed when calling hooks because the rare scenario of:
       //  * hook does a db operation that fails immediately (IDB throws exception)
       //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
       //    wrap() will also execute in a virtual tick.
       //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
       //  * If this was the last event in the bulk, the promise will resolve after a physical tick
       //    and the transaction will have committed already.
       // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
       // because it is always marked with _lib = true when created using Transaction._promise().
       return wrap(function (event) {
           var req = event.target,
               result = req.result,
               ctx = req._hookCtx,
               // Contains the hook error handler. Put here instead of closure to boost performance.
           hookSuccessHandler = ctx && ctx.onsuccess;
           hookSuccessHandler && hookSuccessHandler(result);
           resolve && resolve(result);
       }, resolve);
   }

   function eventRejectHandler(reject) {
       return function (event) {
           preventDefault(event);
           reject(event.target.error);
           return false;
       };
   }

   function hookedEventRejectHandler(reject) {
       return wrap(function (event) {
           // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.

           var req = event.target,
               err = req.error,
               ctx = req._hookCtx,
               // Contains the hook error handler. Put here instead of closure to boost performance.
           hookErrorHandler = ctx && ctx.onerror;
           hookErrorHandler && hookErrorHandler(err);
           preventDefault(event);
           reject(err);
           return false;
       });
   }

   function preventDefault(event) {
       if (event.stopPropagation) // IndexedDBShim doesnt support this on Safari 8 and below.
           event.stopPropagation();
       if (event.preventDefault) // IndexedDBShim doesnt support this on Safari 8 and below.
           event.preventDefault();
   }

   function globalDatabaseList(cb) {
       var val,
           localStorage = Dexie.dependencies.localStorage;
       if (!localStorage) return cb([]); // Envs without localStorage support
       try {
           val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
       } catch (e) {
           val = [];
       }
       if (cb(val)) {
           localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
       }
   }

   function awaitIterator(iterator) {
       var callNext = function (result) {
           return iterator.next(result);
       },
           doThrow = function (error) {
           return iterator.throw(error);
       },
           onSuccess = step(callNext),
           onError = step(doThrow);

       function step(getNext) {
           return function (val) {
               var next = getNext(val),
                   value = next.value;

               return next.done ? value : !value || typeof value.then !== 'function' ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
           };
       }

       return step(callNext)();
   }

   //
   // IndexSpec struct
   //
   function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
       /// <param name="name" type="String"></param>
       /// <param name="keyPath" type="String"></param>
       /// <param name="unique" type="Boolean"></param>
       /// <param name="multi" type="Boolean"></param>
       /// <param name="auto" type="Boolean"></param>
       /// <param name="compound" type="Boolean"></param>
       /// <param name="dotted" type="Boolean"></param>
       this.name = name;
       this.keyPath = keyPath;
       this.unique = unique;
       this.multi = multi;
       this.auto = auto;
       this.compound = compound;
       this.dotted = dotted;
       var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
       this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
   }

   //
   // TableSchema struct
   //
   function TableSchema(name, primKey, indexes, instanceTemplate) {
       /// <param name="name" type="String"></param>
       /// <param name="primKey" type="IndexSpec"></param>
       /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
       /// <param name="instanceTemplate" type="Object"></param>
       this.name = name;
       this.primKey = primKey || new IndexSpec();
       this.indexes = indexes || [new IndexSpec()];
       this.instanceTemplate = instanceTemplate;
       this.mappedClass = null;
       this.idxByName = arrayToObject(indexes, function (index) {
           return [index.name, index];
       });
   }

   // Used in when defining dependencies later...
   // (If IndexedDBShim is loaded, prefer it before standard indexedDB)
   var idbshim = _global.idbModules && _global.idbModules.shimIndexedDB ? _global.idbModules : {};

   function safariMultiStoreFix(storeNames) {
       return storeNames.length === 1 ? storeNames[0] : storeNames;
   }

   function getNativeGetDatabaseNamesFn(indexedDB) {
       var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
       return fn && fn.bind(indexedDB);
   }

   // Export Error classes
   props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};

   //
   // Static methods and properties
   //
   props(Dexie, {

       //
       // Static delete() method.
       //
       delete: function (databaseName) {
           var db = new Dexie(databaseName),
               promise = db.delete();
           promise.onblocked = function (fn) {
               db.on("blocked", fn);
               return this;
           };
           return promise;
       },

       //
       // Static exists() method.
       //
       exists: function (name) {
           return new Dexie(name).open().then(function (db) {
               db.close();
               return true;
           }).catch(Dexie.NoSuchDatabaseError, function () {
               return false;
           });
       },

       //
       // Static method for retrieving a list of all existing databases at current host.
       //
       getDatabaseNames: function (cb) {
           return new Promise(function (resolve, reject) {
               var getDatabaseNames = getNativeGetDatabaseNamesFn(indexedDB);
               if (getDatabaseNames) {
                   // In case getDatabaseNames() becomes standard, let's prepare to support it:
                   var req = getDatabaseNames();
                   req.onsuccess = function (event) {
                       resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
                   };
                   req.onerror = eventRejectHandler(reject);
               } else {
                   globalDatabaseList(function (val) {
                       resolve(val);
                       return false;
                   });
               }
           }).then(cb);
       },

       defineClass: function (structure) {
           /// <summary>
           ///     Create a javascript constructor based on given template for which properties to expect in the class.
           ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
           /// </summary>
           /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
           /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

           // Default constructor able to copy given properties into this object.
           function Class(properties) {
               /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
               /// </param>
               properties ? extend(this, properties) : fake && applyStructure(this, structure);
           }
           return Class;
       },

       applyStructure: applyStructure,

       ignoreTransaction: function (scopeFunc) {
           // In case caller is within a transaction but needs to create a separate transaction.
           // Example of usage:
           //
           // Let's say we have a logger function in our app. Other application-logic should be unaware of the
           // logger function and not need to include the 'logentries' table in all transaction it performs.
           // The logging should always be done in a separate transaction and not be dependant on the current
           // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
           //
           //     Dexie.ignoreTransaction(function() {
           //         db.logentries.add(newLogEntry);
           //     });
           //
           // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
           // in current Promise-scope.
           //
           // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
           // API for this because
           //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
           //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
           //  3) setImmediate() is not supported in the ES standard.
           //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
           return PSD.trans ? usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
           scopeFunc(); // No need to change scope because there is no ongoing transaction.
       },

       vip: function (fn) {
           // To be used by subscribers to the on('ready') event.
           // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
           // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
           // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
           // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
           // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
           // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
           // the caller will not resolve until database is opened.
           return newScope(function () {
               PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
               return fn();
           });
       },

       async: function (generatorFn) {
           return function () {
               try {
                   var rv = awaitIterator(generatorFn.apply(this, arguments));
                   if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
                   return rv;
               } catch (e) {
                   return rejection(e);
               }
           };
       },

       spawn: function (generatorFn, args, thiz) {
           try {
               var rv = awaitIterator(generatorFn.apply(thiz, args || []));
               if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
               return rv;
           } catch (e) {
               return rejection(e);
           }
       },

       // Dexie.currentTransaction property
       currentTransaction: {
           get: function () {
               return PSD.trans || null;
           }
       },

       // Export our Promise implementation since it can be handy as a standalone Promise implementation
       Promise: Promise,

       // Dexie.debug proptery:
       // Dexie.debug = false
       // Dexie.debug = true
       // Dexie.debug = "dexie" - don't hide dexie's stack frames.
       debug: {
           get: function () {
               return debug;
           },
           set: function (value) {
               setDebug(value, value === 'dexie' ? function () {
                   return true;
               } : dexieStackFrameFilter);
           }
       },

       // Export our derive/extend/override methodology
       derive: derive,
       extend: extend,
       props: props,
       override: override,
       // Export our Events() function - can be handy as a toolkit
       Events: Events,
       events: Events, // Backward compatible lowercase version. Deprecate.
       // Utilities
       getByKeyPath: getByKeyPath,
       setByKeyPath: setByKeyPath,
       delByKeyPath: delByKeyPath,
       shallowClone: shallowClone,
       deepClone: deepClone,
       getObjectDiff: getObjectDiff,
       asap: asap,
       maxKey: maxKey,
       // Addon registry
       addons: [],
       // Global DB connection list
       connections: connections,

       MultiModifyError: exceptions.Modify, // Backward compatibility 0.9.8. Deprecate.
       errnames: errnames,

       // Export other static classes
       IndexSpec: IndexSpec,
       TableSchema: TableSchema,

       //
       // Dependencies
       //
       // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
       //
       // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
       // For node.js, you need to require indexeddb-js or similar and then set these deps.
       //
       dependencies: {
           // Required:
           indexedDB: idbshim.shimIndexedDB || _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
           IDBKeyRange: idbshim.IDBKeyRange || _global.IDBKeyRange || _global.webkitIDBKeyRange
       },

       // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
       semVer: DEXIE_VERSION,
       version: DEXIE_VERSION.split('.').map(function (n) {
           return parseInt(n);
       }).reduce(function (p, c, i) {
           return p + c / Math.pow(10, i * 2);
       }),
       fakeAutoComplete: fakeAutoComplete,

       // https://github.com/dfahlander/Dexie.js/issues/186
       // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
       // x.default. Workaround: Set Dexie.default = Dexie.
       default: Dexie
   });

   tryCatch(function () {
       // Optional dependencies
       // localStorage
       Dexie.dependencies.localStorage = (typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : _global.localStorage;
   });

   // Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
   Promise.rejectionMapper = mapError;

   // Fool IDE to improve autocomplete. Tested with Visual Studio 2013 and 2015.
   doFakeAutoComplete(function () {
       Dexie.fakeAutoComplete = fakeAutoComplete = doFakeAutoComplete;
       Dexie.fake = fake = true;
   });

   return Dexie;

}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;

},{}],12:[function(require,module,exports){
var atob = require('./atob');

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};

},{"./atob":11}],13:[function(require,module,exports){
'use strict';

var base64_url_decode = require('./base64_url_decode');

module.exports = function (token,options) {
  if (typeof token !== 'string') {
    throw new Error('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  return JSON.parse(base64_url_decode(token.split('.')[pos]));
};

},{"./base64_url_decode":12}]},{},[1]);
