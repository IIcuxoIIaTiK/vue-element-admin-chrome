!function e(t, n, r) {
    function m(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = "function" == typeof require && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var err = new Error("Cannot find module '" + o + "'");
                throw err.code = "MODULE_NOT_FOUND", err;
            }
            var f = n[o] = {
                exports: {}
            };
            t[o][0].call(f.exports, function(e) {
                var event = t[o][1][e];
                return m(event ? event : e);
            }, f, f.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    for (var i = "function" == typeof require && require, s = 0; s < r.length; s++) m(r[s]);
    return m;
}({
    1: [ function(createElement, tag, properties) {
        "use strict";
        function create() {
            var n = b.getDeviceId();
            n || (n = r.generateUUID(), b.setDeviceId(n)), l.setup(), m.setup(), h.activateListener(), 
            b.getAuthToken() ? (y.refreshTokenIfRequired(), y.createContextMenus(), y.syncDeviceList(function(e) {
                e && y.createContextMenus();
            }), m.updateViewedCount()) : y.handleUnauthorizedRequest();
        }
        function onInput(e) {
            r.gaEvent(c, "onInstalled"), l.setup(), m.setup();
            var i = b.getDeviceId();
            r.injectContentScript(), i || (b.emptyLocalStorage(), b.setDefaults(), i = chrome.runtime.id, 
            b.setDeviceId(i)), b.setGithubFeatureDefaults(), b.setDefaults(), b.getGcmToken() ? done() : get();
        }
        function sendResponse() {
            l.setup(), m.setup(), done(), r.gaEvent(c, "onStartup");
        }
        function done() {
            y.refreshTokenIfRequired(), b.getAuthToken() ? (y.createContextMenus(), y.syncDeviceList(function(e) {
                e && y.createContextMenus();
            }), m.updateViewedCount()) : y.handleUnauthorizedRequest();
        }
        function s() {
            h.activateListener(), j.activateGCMListener(), y.activateCommandListener();
        }
        function get() {
            var els = [ a.GoogleProjectNumber ];
            chrome.gcm.register(els, function(e) {
                return chrome.runtime.lastError ? (b.setItem(a.GCMErrorKey, chrome.runtime.lastError), 
                void r.gaEvent(c, "chromeGCMRegistrationError", chrome.runtime.lastError)) : (b.setGcmToken(e), 
                void y.getAuthTokenAndLogin());
            });
        }
        var b = createElement("./lib/db.js"), l = createElement("./lib/bookmarksDb.js"), m = createElement("./lib/queueDb.js"), a = createElement("./lib/constants.js"), r = createElement("./lib/util.js"), j = createElement("./lib/notify.js"), y = createElement("./lib/api.js"), h = createElement("./lib/message.js"), c = "background";
        r.getBrowser() == a.Firefox ? create() : (chrome.runtime.onInstalled.addListener(function(details) {
            onInput(details);
        }), s(), chrome.runtime.onStartup.addListener(function() {
            sendResponse();
        }), chrome.management.onEnabled.addListener(function(activeInfo) {
            sendResponse(), r.injectContentScript();
        }));
    }, {
        "./lib/api.js": 2,
        "./lib/bookmarksDb.js": 3,
        "./lib/constants.js": 4,
        "./lib/db.js": 5,
        "./lib/message.js": 6,
        "./lib/notify.js": 7,
        "./lib/queueDb.js": 8,
        "./lib/util.js": 9
    } ],
    2: [ function(createElement, tag, properties) {
        "use strict";
        function process() {
            var invert = me.getDeviceName();
            if (!invert) return done(), void chrome.tabs.create({
                active: !0,
                url: m.LoginPageUrl
            });
            var t = compile();
            t.success(function(u) {
                me.setAuthToken(u.authToken), me.setDirectedId(u.directedId), me.isDefaultsSet() || me.setDefaults(), 
                chrome.browserAction.setPopup({
                    popup: "html/main.html"
                }), drag(function(e) {
                    e && parser();
                }), check(), parser(), tabLoaded(), console.setBadgeText(0), c.updateViewedCount(), 
                console.gaEvent(res, "getAuthTokenAndLoginSuccess");
            }), t.fail(function(e, r, t) {
                done(), console.gaEvent(res, "getAuthTokenAndLoginFail");
            });
        }
        function respond(next, response, tab) {
            "complete" == response.status && tab.url.indexOf(m.HomePageUrl) > -1 && (process(), 
            chrome.tabs.remove(tab.id, function() {}));
        }
        function callback() {
            chrome.tabs.onUpdated.addListener(respond);
        }
        function tabLoaded() {
            chrome.tabs.onUpdated.removeListener(respond);
        }
        function tick(data, el) {
            var c = data.menuItemId.split(";")[0], index = data.menuItemId.split(";")[1], name = data.pageUrl, a = el.title, result = el.favIconUrl, b = "";
            chrome.tabs.query({
                currentWindow: !0,
                active: !0
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    name: m.MessageGetUrlImage
                }, function(response) {
                    b = response;
                });
            }), setTimeout(call(c, null, name, a, b, result, index), 250);
        }
        function combine(ast, t) {
            var node = ast.menuItemId.split(";")[1], options = ast.menuItemId.split(";")[2], name = ast.linkUrl, type = "", result = "", value = "";
            call(node, null, name, type, value, result, options);
        }
        function line(e, node) {
            var target = e.pageUrl, path = node.title, data = node.favIconUrl, options = "";
            chrome.tabs.query({
                currentWindow: !0,
                active: !0
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    name: m.MessageGetUrlImage
                }, function(response) {
                    options = response;
                });
            }), setTimeout(log(null, target, path, options, data), 350);
        }
        function getValue(state, code) {
            var url = state.linkUrl, path = "", data = "", options = "";
            log(null, url, path, options, data);
        }
        function f(e, el) {
            if (me.getBoolean(m.ShowBookmarkTagsDialog)) console.showAddTagsDialog(me.getBookmarkTags()); else {
                var x = e.pageUrl, y = el.title, name = el.favIconUrl, options = "";
                chrome.tabs.query({
                    currentWindow: !0,
                    active: !0
                }, function(tabs) {
                    chrome.tabs.sendMessage(el[0].id, {
                        name: m.MessageGetUrlImage
                    }, function(cookies) {
                        options = cookies;
                    });
                }), setTimeout(push(null, x, y, options, name), 350);
            }
        }
        function toString(b, object) {
            var x = b.linkUrl, y = "", name = "", i = "";
            push(null, x, y, i, name);
        }
        function initialize() {
            chrome.tabs.create({
                url: chrome.extension.getURL("html/settings.html"),
                active: !0
            }), console.gaEvent(key, "showSettingsPage");
        }
        var me = createElement("./db.js"), m = createElement("./constants.js"), console = createElement("./util.js"), l = createElement("./notify.js"), c = createElement("./queueDb.js"), h = createElement("./bookmarksDb.js"), p = createElement("jwt-decode"), res = "api", key = "contexMenu", remove = function(e, method, options) {
            return $.ajax({
                url: e,
                type: method,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(m.AuthTokenKey));
                },
                data: options,
                complete: function(xhr, status) {
                    401 == xhr.status ? done() : e != m.RefreshTokenApi && fn();
                }
            });
        }, done = function() {
            var current = window.location.href;
            current && current.indexOf("_generated_background_page.html") > -1 ? (callback(), 
            l.showLoginNotification()) : current && current.indexOf("github.html") > -1 ? console.sendMessage({
                name: m.MessageActivateTabListener
            }) : (window.location.href = m.LoginPageUrl, console.sendMessage({
                name: m.MessageActivateTabListener
            })), chrome.browserAction.setPopup({
                popup: "/html/login.html"
            }), chrome.contextMenus.removeAll(), chrome.contextMenus.create({
                id: "1",
                title: "Click on Voblet icon in menu to Login",
                contexts: [ "all" ]
            });
        }, i = function() {
            init(), me.setAuthToken(""), me.setQueueLastUpdatedTimestamp(0), me.setBookmarksLastUpdatedTimestamp(0), 
            me.updateDevicesList([]), console.setBadgeText(":("), c.deleteAll().then(function(exists) {}).catch(function(err) {}), 
            h.deleteAll().then(function(exists) {}).catch(function(err) {}), done(), console.gaEvent(res, "logoutUser");
        }, create = function(url, data) {
            return $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=UTF-8",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + me.getAuthToken());
                },
                data: JSON.stringify(data),
                complete: function(err, items) {
                    401 == err.status ? done() : fn();
                }
            });
        }, compile = function() {
            var zoom = me.getDeviceName();
            return zoom || (zoom = "chrome", me.setDeviceName(zoom)), $.ajax({
                type: "POST",
                url: m.ChromeLoginUrl,
                data: {
                    deviceId: me.getDeviceId(),
                    pushToken: me.getGcmToken(),
                    deviceName: zoom
                }
            });
        }, fn = function() {
            var i = me.getAuthToken();
            try {
                var pos = p(i), d = Date.now() / 1e3;
                if (pos.exp - d < m.FifteenDays) {
                    var t = remove(m.RefreshTokenApi, "POST", {});
                    t.success(function(u) {
                        me.setAuthToken(u.authToken), console.gaEvent(res, "refreshTokenIfRequiredSuccess");
                    }), t.fail(function(e, r, t) {
                        console.gaEvent(res, "refreshTokenIfRequiredFail");
                    });
                }
            } catch (i) {}
        }, drag = function(el) {
            var t = remove(m.DevicesApi, "GET", {});
            t.success(function(data) {
                me.updateDevicesList(data.devices), el(m.Success), console.gaEvent(res, "syncDeviceListSuccess");
            }), t.fail(function(err, transaction, error) {
                el(m.Fail), console.gaEvent(res, "syncDeviceListFail", err.status);
            });
        }, init = function() {
            var t = create(m.DevicesApi + "/" + me.getDeviceId(), {
                action: m.ActionLogout
            });
            t.success(function(u) {
                console.gaEvent(res, "logoutDeviceOnServerSideSuccess");
            }), t.fail(function(err, r, t) {
                console.gaEvent(res, "logoutDeviceOnServerSideFail", err.status);
            });
        }, check = function(r) {
            var t = remove(m.TagsApi, "GET", {});
            t.success(function(result) {
                me.updateBookmarkTags(result.tags), r && r(m.Success), console.gaEvent(res, "syncBookmarkTagsSucces");
            }), t.fail(function(err, transaction, error) {
                r && r(m.Fail), console.gaEvent(res, "syncBookmarkTagsFail", err.status);
            });
        }, log = function(type, id, obj, context, data) {
            var s = {
                note: type,
                url: id,
                urlTitle: obj,
                urImage: context,
                urlIcon: data
            }, t = create(m.QueueApi, s);
            t.success(function(u) {
                console.showToastInTab(m.QueueSuccessMessage), c.addItem(u).then(function(exists) {
                    c.updateViewedCount();
                }).catch(function(err) {}), console.gaEvent(key, "addToQueueSuccess");
            }), t.fail(function(e, r, t) {
                console.showToastInTab(m.QueueFailedMessage), console.gaEvent(key, "addToQueueFail", e.status);
            });
        }, call = function(id, x, y, width, height, cx, cy) {
            var args = {
                type: m.TypeUrl,
                note: x,
                content: y,
                urlTitle: width,
                urImage: height,
                urlIcon: cx,
                destination: id,
                action: cy
            }, options = create(m.SharedApi, args);
            options.success(function(opt) {
                console.showToastInTab(m.SharedSuccessMessage), me.addToShared(opt), console.gaEvent(key, "addToSharedSuccess");
            }), options.fail(function(e, i, t) {
                console.showToastInTab(m.SharedFailedMessage), console.gaEvent(key, "addToSharedFail", e.status);
            });
        }, push = function(x, t, b, c, d) {
            var i = {
                note: x,
                url: t,
                tagIds: [],
                urlTitle: b,
                urImage: c,
                urlIcon: d
            }, a = create(m.BookmarkApi, i);
            a.success(function(data) {
                console.showToastInTab(m.BookmarkSuccessMessage), h.addItem(data.bookmarkItem).then(function(exists) {}).catch(function(err) {}), 
                console.gaEvent(key, "saveBookmarkSuccess");
            }), a.fail(function(e, r, t) {
                console.showToastInTab(m.BookmarkFailedMessage), console.gaEvent(key, "saveBookmarkFail", e.status);
            });
        }, setup = function() {
            chrome.commands.onCommand.addListener(function(command) {
                "add-to-bookmarks" == command ? chrome.tabs.query({
                    active: !0,
                    lastFocusedWindow: !0
                }, function(data) {
                    if (me.getBoolean(m.ShowBookmarkTagsDialog)) console.showAddTagsDialog(me.getBookmarkTags()); else {
                        var text = "";
                        chrome.tabs.getSelected(null, function(tab) {
                            chrome.tabs.sendMessage(tab.id, {
                                name: m.MessageGetUrlImage
                            }, function(data) {
                                text = data;
                            });
                        }), setTimeout(push(null, data[0].url, data[0].title, text, data[0].favIconUrl), 250);
                    }
                }) : "add-to-queue" == command && chrome.tabs.query({
                    active: !0,
                    lastFocusedWindow: !0
                }, function(data) {
                    var result = "";
                    chrome.tabs.getSelected(null, function(tab) {
                        chrome.tabs.sendMessage(tab.id, {
                            name: m.MessageGetUrlImage
                        }, function(response) {
                            result = response;
                        });
                    }), setTimeout(log("", data[0].url, data[0].title, result, data[0].favIconUrl), 250);
                }), console.gaEvent(res, "onCommand", command);
            });
        }, parser = function() {
            chrome.contextMenus.removeAll(function() {
                me.getBoolean(m.ShowContextMenuQueue) && (chrome.contextMenus.create({
                    id: "queue",
                    title: "Add to Queue",
                    contexts: [ "page" ],
                    onclick: line
                }), chrome.contextMenus.create({
                    id: "queue;link",
                    title: "Add to Queue",
                    contexts: [ "link" ],
                    onclick: getValue
                })), me.getBoolean(m.ShowContextMenuBookmarks) && (chrome.contextMenus.create({
                    id: "bookmark",
                    title: "Save as bookmark",
                    contexts: [ "page" ],
                    onclick: f
                }), chrome.contextMenus.create({
                    id: "bookmark;link",
                    title: "Save as bookmark",
                    contexts: [ "link" ],
                    onclick: toString
                }));
                var files = me.getOtherDevicesList();
                files.length > 1;
                for (var fn = me.getBlockedDeviceIds(), i = 0; i < files.length; i++) if (!(fn.indexOf(files[i].itemId) > -1)) {
                    var file = files[i].type;
                    chrome.contextMenus.create({
                        id: files[i].itemId + ";",
                        title: "Send link to " + files[i].name,
                        contexts: [ "page" ],
                        onclick: tick
                    }), chrome.contextMenus.create({
                        id: "link;" + files[i].itemId + ";",
                        title: "Send link to " + files[i].name,
                        contexts: [ "link" ],
                        onclick: combine
                    }), file == m.AndroidDeviceType && (me.getBoolean(m.ShowContextMenuSendToWhatsapp) && chrome.contextMenus.create({
                        id: files[i].itemId + ";" + m.ActionWhatsapp,
                        title: "Send link to Whatsapp on " + files[i].name,
                        contexts: [ "page" ],
                        onclick: tick
                    }), me.getBoolean(m.ShowContextMenuOpenOnPhone) && chrome.contextMenus.create({
                        id: files[i].itemId + ";" + m.ActionOpenUrl,
                        title: "Open link on " + files[i].name,
                        contexts: [ "page" ],
                        onclick: tick
                    }));
                }
                chrome.contextMenus.create({
                    id: "settings",
                    title: "Settings",
                    contexts: [ "all" ],
                    onclick: initialize
                }, function() {}), console.gaEvent(key, "createContextMenus");
            });
        };
        tag.exports = {
            syncDeviceList: drag,
            getRequestObj: remove,
            getJsonPostRequestObj: create,
            getLoginRequestObj: compile,
            getAuthTokenAndLogin: process,
            syncBookmarkTags: check,
            activateCommandListener: setup,
            refreshTokenIfRequired: fn,
            activateTabListener: callback,
            createContextMenus: parser,
            logoutUser: i,
            handleUnauthorizedRequest: done
        };
    }, {
        "./bookmarksDb.js": 3,
        "./constants.js": 4,
        "./db.js": 5,
        "./notify.js": 7,
        "./queueDb.js": 8,
        "./util.js": 9,
        "jwt-decode": 13
    } ],
    3: [ function(createElement, tag, properties) {
        "use strict";
        function init() {
            try {
                s.version(1).stores({
                    bookmarks: "itemId,url,created,updated"
                });
            } catch (e) {}
            s.open().catch(function(err) {});
        }
        function load(obj, req) {
            return obj.searchText = create(obj), new Promise(function(resolve, reject) {
                s.bookmarks.put(obj).then(function(exists) {
                    resolve(exists), callback();
                }).catch(function(err) {
                    reject(err);
                });
            });
        }
        function run(path) {
            return new Promise(function(resolve, reject) {
                s.bookmarks.delete(path).then(function(exists) {
                    resolve(exists), callback();
                }).catch(function(err) {
                    reject(err);
                });
            });
        }
        function update(results, scrollTo) {
            s.transaction("rw", s.bookmarks, function() {
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    object.searchText = create(object), s.bookmarks.put(object).catch(function(time) {
                        b.setBookmarksLastUpdatedTimestamp(0), scrollTo(p.Fail, p.DatabaseErr, time);
                    });
                }
            }).then(function(exists) {
                callback(), scrollTo(p.Success);
            }).catch(function(time) {
                b.setBookmarksLastUpdatedTimestamp(0), scrollTo(p.Fail, p.DatabaseErr, time), c.gaEvent(q, "bulkInsertFail");
            });
        }
        function Player(results, add) {
            s.transaction("rw", s.bookmarks, function() {
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    "D" != object.updateAction ? (object.searchText = create(object), s.bookmarks.put(object).catch(function(time) {
                        b.setBookmarksLastUpdatedTimestamp(0), add(p.Fail, p.DatabaseErr, time);
                    })) : s.bookmarks.delete(object.itemId).catch(function(time) {
                        b.setBookmarksLastUpdatedTimestamp(0), add(p.Fail, p.DatabaseErr, time);
                    });
                }
            }).then(function(exists) {
                add(p.Success), callback();
            }).catch(function(time) {
                b.setBookmarksLastUpdatedTimestamp(0), add(p.Fail, p.DatabaseErr, time), c.gaEvent(q, "bulkInsertOnUpdateActionFail");
            });
        }
        function get(callback) {
            s.bookmarks.orderBy("created").reverse().toArray(function(e) {
                callback(p.Success, e);
            }).catch(function(width) {
                callback(p.Fail, p.DatabaseErr, width);
            });
        }
        function destroy(timing) {
            return s.bookmarks.where("url").startsWithAnyOfIgnoreCase(timing);
        }
        function create(options) {
            var _key = options.note + k + options.url + k + options.urlTitle + k + options.urlImage;
            return _key.toLowerCase();
        }
        function clear() {
            return s.bookmarks.clear();
        }
        function callback() {
            chrome.tabs && chrome.tabs.query({
                url: [ "*://github.com/*", "*://gist.github.com/*" ]
            }, function(tabs) {
                for (var i = 0; i < tabs.length; i++) chrome.tabs.sendMessage(tabs[i].id, {
                    name: p.MessageBookmarksUpdated
                });
            });
        }
        var a = createElement("dexie"), b = createElement("./db.js"), c = createElement("./util.js"), p = createElement("./constants.js"), q = "bookmarksDb", s = new a("Bookmarks"), k = "fds{|}";
        tag.exports = {
            setup: init,
            bookmarkDb: s,
            addItem: load,
            deleteItem: run,
            getAll: get,
            getItemsWithUrlPrefix: destroy,
            deleteAll: clear,
            bulkInsert: update,
            bulkInsertBasedOnUpdateAction: Player
        };
    }, {
        "./constants.js": 4,
        "./db.js": 5,
        "./util.js": 9,
        dexie: 10
    } ],
    4: [ function(formElementFinder, rootNode, nodeName) {
        "use strict";
        var len = "https://api.voblet.com", results = "https://voblet.com", i = "Firefox", item = "Chrome";
        rootNode.exports = Object.freeze({
            GoogleProjectNumber: "594496440754",
            GoogleAnalyticsCode: "UA-86885186-3",
            SessionApi: len + "/v1/session",
            SharedApi: len + "/v1/shared",
            QueueApi: len + "/v1/queue",
            BookmarkApi: len + "/v1/bookmark",
            BookmarkBulkApi: len + "/v1/bookmarkbulk",
            DevicesApi: len + "/v1/devices",
            TagsApi: len + "/v1/tags",
            Firefox: i,
            Chrome: item,
            ChromeLoginUrl: results + "/chromelogin",
            WebsiteLoginPageUrl: results + "/login",
            HomePageUrl: results + "/home",
            RefreshTokenApi: results + "/refreshtoken",
            LoginPageUrl: chrome.extension.getURL("html/login.html"),
            SettingsPageUrl: chrome.extension.getURL("html/settings.html"),
            MainPageUrl: chrome.extension.getURL("html/main.html"),
            VobletPageUrl: chrome.extension.getURL("html/voblet.html"),
            MainTag: "main-tag",
            errorImage: "errorImage.png",
            AuthTokenKey: "authToken",
            Tendays: 864e3,
            OneDay: 86400,
            HalfDay: 43200,
            FifteenDays: 1296e3,
            Indefinite: 36e5,
            FiveMinutesInMs: 3e5,
            TenMinutesInMs: 6e5,
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
            EnableGithubBookmarkingKey: "githubBookmarkingKey",
            EnableQueueGithubKey: "queueForGithub",
            QueueOpenNewTabKey: "queueOpenNewTabKey",
            SharedNotificationsKey: "sharedNotificationsKey",
            SharedOpenNewTabKey: "sharedOpenNewTabKey",
            BookmarksLastUpdateTimestamp: "bookmarksLastUpdateTimestamp",
            QueueLastUpdateTimestamp: "queueLastUpdateTimestamp",
            ShowMarkAsViewedKey: "showMarkAsViewed",
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
            QueueSuccessMessage: "Added to Queue",
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
            GithubGistPrefix: "https://gist.github.com",
            GetBookmarksAndTags: "GetBookmarksAndTags",
            SyncBookmarks: "SyncBookmarks",
            AndroidDeviceType: "android",
            Success: !0,
            Fail: !1,
            DatabaseErr: "databaseErr",
            NetworkErr: "networkErr",
            UnauthorizedErr: "unauthorizedErr",
            GCMErrorKey: "gcmErrorKey",
            TwitterIcon: "../img/twitter_icon.png",
            FacebookIcon: "../img/fb_icon.png",
            YoutubeIcon: "../img/youtube_icon.png"
        });
    }, {} ],
    5: [ function(NodeGenerator, args, options) {
        "use strict";
        function callback(key) {
            var value = localStorage.getItem(key);
            return null == value ? [] : JSON.parse(value);
        }
        function done(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }
        var dg = NodeGenerator("./constants.js"), dm = "gcmToken", dd = "deviceId", dl = "deviceName", dc = "deviceList", df = "directedId", dt = "sessions", g = "shared", o = "blockedDevices", m = "bookmarkTags", l = "defaultsSet", d = function(key) {
            return localStorage.getItem(key);
        }, p = function(n, d) {
            localStorage.setItem(n, d);
        }, r = function(key) {
            var ns = localStorage.getItem(key);
            return "true" == ns;
        }, q = function(key, value) {
            localStorage.setItem(key, value);
        }, s = function() {
            return localStorage.getItem(dg.AuthTokenKey);
        }, c = function(value) {
            localStorage.setItem(dg.AuthTokenKey, value);
        }, t = function() {
            return localStorage.getItem(dm);
        }, f = function(d) {
            localStorage.setItem(dm, d), localStorage.setItem(dg.GCMErrorKey, "");
        }, tt = function() {
            return localStorage.getItem(dd);
        }, pp = function(obj) {
            localStorage.setItem(dd, obj);
        }, geometry = function() {
            return localStorage.getItem(df);
        }, material = function(s) {
            localStorage.setItem(df, s);
        }, camera = function() {
            return localStorage.getItem(dl);
        }, fog = function(access_code) {
            localStorage.setItem(dl, access_code);
        }, texture = function() {
            var _n = Number(localStorage.getItem(dg.BookmarksLastUpdateTimestamp));
            return isNaN(_n) ? 0 : _n;
        }, images = function(access_code) {
            localStorage.setItem(dg.BookmarksLastUpdateTimestamp, access_code);
        }, materials = function() {
            var _n = Number(localStorage.getItem(dg.QueueLastUpdateTimestamp));
            return isNaN(_n) ? 0 : _n;
        }, light = function(access_code) {
            localStorage.setItem(dg.QueueLastUpdateTimestamp, access_code);
        }, data = function() {
            return callback(dc);
        }, binLoader = function(err) {
            err ? done(dc, err) : done(dc, []);
        }, jsonLoader = function() {
            var all = callback(dc), t = localStorage.getItem(dd), m = all.filter(function(node) {
                return node.itemId != t;
            });
            return m;
        }, counter_models = function() {
            return callback(o);
        }, counter_textures = function(fn) {
            var array = callback(o);
            array.push(fn), array = array.filter(function(item, index, array) {
                return array.indexOf(item) == index;
            }), done(o, array);
        }, total_models = function(str) {
            var value = callback(o), index = value.indexOf(str);
            index > -1 && value.splice(index, 1), done(o, value);
        }, total_textures = function() {
            exports() || (localStorage.setItem(dg.DisplayNotificationsKey, !0), localStorage.setItem(dg.ShowBookmarkTagsDialog, !0), 
            localStorage.setItem(dg.QueueNotificationsKey, !0), localStorage.setItem(dg.SharedNotificationsKey, !0), 
            localStorage.setItem(dg.QueueOpenNewTabKey, !1), localStorage.setItem(dg.SharedOpenNewTabKey, !0), 
            localStorage.setItem(dg.ShowMarkAsViewedKey, !0), localStorage.setItem(dg.ShowContextMenuDevices, !0), 
            localStorage.setItem(dg.ShowContextMenuBookmarks, !0), localStorage.setItem(dg.ShowContextMenuQueue, !0), 
            localStorage.setItem(dg.GithubFirstTimeUserKey, !0), localStorage.setItem(dg.EnableGithubBookmarkingKey, !0), 
            localStorage.setItem(l, !0));
        }, result = function() {
            void 0 == d(dg.GithubFirstTimeUserKey) && (p(dg.GithubFirstTimeUserKey, !0), p(dg.EnableGithubBookmarkingKey, !0));
        }, success = function() {
            localStorage.clear();
        }, fakeOpenDialog = function() {
            return callback(dt);
        }, add = function(b) {
            for (var n = !1, d = callback(dt), i = 0; i < d.length && d[i].itemId != b.itemId; i++) ;
            0 == n && (d.unshift(b), done(dt, d));
        }, onBlur = function(e) {
            e ? done(dt, e) : done(dt, []);
        }, traverse = function(el) {
            var ret = callback(dt), args = ret.filter(function(e) {
                return e.itemId != el;
            });
            done(dt, args);
        }, allDocs = function() {
            return callback(g);
        }, getObject = function(id) {
            for (var array = callback(g), i = 0; i < array.length; i++) if (array[i].itemId == id) return array[i];
        }, startup = function(b) {
            for (var n = !1, d = callback(g), i = 0; i < d.length && d[i].itemId != b.itemId; i++) ;
            0 == n && (d.unshift(b), done(g, d));
        }, ok = function(e) {
            e ? done(g, e) : done(g, []);
        }, resolve = function(value) {
            var results = callback(g), def = results.filter(function(instance) {
                return instance.itemId != value;
            });
            done(g, def);
        }, walk = function() {
            var d = callback(m);
            return d.sort(function(a, b) {
                var aName = a.name.toLowerCase(), bName = b.name.toLowerCase();
                return aName < bName ? -1 : aName > bName ? 1 : 0;
            }), d;
        }, processData = function(b) {
            var results = callback(m), d = results.filter(function(a) {
                return a.itemId != b.itemId;
            });
            d || (d = []), d.unshift(b), done(m, d);
        }, _reFormatCardNumber = function(e) {
            e ? done(m, e) : done(m, []);
        }, animate = function(value) {
            var p = callback(m), l = p.filter(function(s) {
                return s.itemId != value;
            });
            done(m, l);
        }, exports = function() {
            return r(l);
        };
        args.exports = {
            getItem: d,
            setItem: p,
            getBoolean: r,
            setBoolean: q,
            getAuthToken: s,
            setAuthToken: c,
            getGcmToken: t,
            setGcmToken: f,
            getDeviceId: tt,
            setDeviceId: pp,
            getDirectedId: geometry,
            setDirectedId: material,
            getDeviceName: camera,
            setDeviceName: fog,
            emptyLocalStorage: success,
            getDevicesList: data,
            getOtherDevicesList: jsonLoader,
            updateDevicesList: binLoader,
            setDefaults: total_textures,
            isDefaultsSet: exports,
            getSessionsData: fakeOpenDialog,
            addToSessions: add,
            updateSessionsData: onBlur,
            deleteFromSessions: traverse,
            getSharedItem: getObject,
            getSharedData: allDocs,
            addToShared: startup,
            updateSharedData: ok,
            deleteFromShared: resolve,
            getBookmarksLastUpdatedTimestamp: texture,
            setBookmarksLastUpdatedTimestamp: images,
            getQueueLastUpdatedTimestamp: materials,
            setQueueLastUpdatedTimestamp: light,
            getBookmarkTags: walk,
            addBookmakTag: processData,
            updateBookmarkTags: _reFormatCardNumber,
            deleteBookmarkTag: animate,
            getBlockedDeviceIds: counter_models,
            addBlockedDeviceIds: counter_textures,
            removeBlockedDeviceIds: total_models,
            setGithubFeatureDefaults: result
        };
    }, {
        "./constants.js": 4
    } ],
    6: [ function(_, m, cok) {
        "use strict";
        function create(data, phonegap, callback) {
            if (data.name == o.MessageGetOpenTabUrls) select(), l.gaEvent(el, data.name); else if (data.name == o.RefreshContextMenu) a.createContextMenus(), 
            l.gaEvent(el, data.name); else if (data.name == o.MessageAddBookmark) {
                var cmd = a.getJsonPostRequestObj(o.BookmarkApi, data.data);
                cmd.success(function(data) {
                    if (_this.addItem(data.bookmarkItem, function() {}), data.newTagItems) for (var h = 0; h < data.newTagItems.length; h++) s.addBookmakTag(data.newTagItems[h]);
                    callback({
                        status: o.Success,
                        bookmarkItem: data.bookmarkItem,
                        newTagItems: data.newTagItems
                    });
                }), cmd.fail(function(e, r, t) {
                    callback({
                        status: o.Fail,
                        statusCode: e.status
                    });
                }), l.gaEvent(el, data.name);
            } else if (data.name == o.MessageUpdateBookmark) {
                var cmd = a.getJsonPostRequestObj(o.BookmarkApi + "/" + data.itemId, data.data);
                cmd.success(function(data) {
                    if (_this.addItem(data.bookmarkItem, function() {}), data.newTagItems) for (var h = 0; h < data.newTagItems.length; h++) s.addBookmakTag(data.newTagItems[h]);
                    callback({
                        status: o.Success,
                        bookmarkItem: data.bookmarkItem,
                        newTagItems: data.newTagItems
                    });
                }), cmd.fail(function(e, r, t) {
                    callback({
                        status: o.Fail,
                        statusCode: e.status
                    });
                }), l.gaEvent(el, data.name);
            } else if (data.name == o.MessageDeleteBookmark) {
                var left;
                !function() {
                    var id = data.data.itemId;
                    left = a.getRequestObj(o.BookmarkApi + "/" + id, "DELETE", {}), left.success(function(_) {
                        _this.deleteItem(id).then(function(exists) {}).catch(function(err) {}), callback({
                            status: o.Success
                        }), l.gaEvent(el, "deleteBookmarkSuccess");
                    }), left.fail(function(e, r, t) {
                        callback({
                            status: o.Fail,
                            statusCode: e.status
                        });
                    }), l.gaEvent(el, data.name);
                }();
            } else if (data.name == o.MessageAddToQueue) {
                var cmd = a.getJsonPostRequestObj(o.QueueApi, data.data);
                cmd.success(function(u) {
                    c.addItem(u).then(function(exists) {
                        c.updateViewedCount();
                    }).catch(function(err) {}), callback({
                        status: o.Success,
                        queueItem: u
                    });
                }), cmd.fail(function(e, r, t) {
                    callback({
                        status: o.Fail,
                        statusCode: e.status
                    });
                }), l.gaEvent(el, data.name);
            } else if (data.name == o.MessageDeleteFromQueue) {
                var left;
                !function() {
                    var id = data.data.itemId;
                    left = a.getRequestObj(o.QueueApi + "/" + id, "DELETE", {}), left.success(function(_) {
                        c.deleteItem(id).then(function(exists) {
                            c.updateViewedCount();
                        }).catch(function(err) {}), callback({
                            status: o.Success
                        }), l.gaEvent(el, "deleteQueueSuccess");
                    }), left.fail(function(e, r, t) {
                        callback({
                            status: o.Fail,
                            statusCode: e.status
                        });
                    }), l.gaEvent(el, data.name);
                }();
            } else if (data.name == o.MessageActivateTabListener) a.activateTabListener(), l.gaEvent(el, data.name); else if (data.name == o.MessageGetQueueItem) s.getAuthToken() && s.getBoolean(o.ShowMarkAsViewedKey) ? c.getItemByUrl(data.data.url).toArray(function(data) {
                callback(data.length > 0 ? data[0] : void 0);
            }) : callback(void 0); else if (data.name == o.MessageMarkAsViewed) {
                var res = data.data;
                if (res && res.itemId) {
                    var m = {
                        action: o.ActionMarkAsViewed
                    }, left = a.getJsonPostRequestObj(o.QueueApi + "/" + res.itemId, m);
                    left.success(function(u) {
                        l.gaEvent(el, "markAsViewSuccess"), callback(200), c.addItem(u).then(function(exists) {
                            c.updateViewedCount();
                        });
                    }), left.fail(function(e, r, t) {
                        callback(e.status), l.gaEvent(el, "markAsViewFail");
                    });
                }
                l.gaEvent(el, data.name);
            } else data.name == o.MessageGetBookmarkTags ? callback(s.getBookmarkTags()) : data.name == o.MessageGetGithubLinksInQueue ? c.getItemsWithUrlPrefix([ o.GithubPrefix, o.GithubGistPrefix ]).toArray(function(err) {
                callback(err);
            }) : data.name == o.MessageGetGithubLinksInBookmarks ? _this.getItemsWithUrlPrefix([ o.GithubPrefix, o.GithubGistPrefix ]).toArray(function(err) {
                callback(err);
            }) : data.name == o.MessageOpenUrlInRightNav ? chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, data);
            }) : data.name == o.MessageGetValueLocalDb ? (callback(s.getItem(data.key)), l.gaEvent(el, data.name)) : data.name == o.MessageSetValueLocalDb ? (callback(s.setItem(data.key, data.value)), 
            l.gaEvent(el, data.name)) : data.name == o.MessageGAEvent && l.gaEvent(data.eventCategory, data.eventAction);
            return !0;
        }
        function select(ui) {
            chrome.tabs.query({
                currentWindow: !0
            }, function(tabs) {
                for (var result = [], i = 0; i < tabs.length; i++) result.push(tabs[i].url);
                chrome.extension.sendMessage({
                    message: o.ResponseOpenTabUrls,
                    data: result
                }, function() {});
            });
        }
        var o = _("./constants.js"), a = _("./api.js"), s = _("./db.js"), _this = _("./bookmarksDb.js"), c = _("./queueDb.js"), l = _("./util.js"), el = "message", initialize = function() {
            l.getBrowser() == o.Firefox ? browser.runtime.onMessage.addListener(create) : chrome.extension.onMessage.addListener(create);
        };
        m.exports = {
            activateListener: initialize
        };
    }, {
        "./api.js": 2,
        "./bookmarksDb.js": 3,
        "./constants.js": 4,
        "./db.js": 5,
        "./queueDb.js": 8,
        "./util.js": 9
    } ],
    7: [ function(createElement, tag, properties) {
        "use strict";
        function handler(e) {}
        function text(textDisplay) {
            chrome.tabs.create({
                url: textDisplay
            });
        }
        function fn(m, aBlock, old) {
            var err = {
                type: "basic",
                title: aBlock,
                message: old,
                iconUrl: "icon128.png",
                buttons: [ {
                    title: "open"
                } ]
            };
            chrome.notifications.create(m, err, null);
        }
        function dispatchEvent(m, type, detail) {
            var callback = {
                type: "basic",
                title: type,
                message: detail,
                iconUrl: "icon128.png",
                buttons: [ {
                    title: "copy"
                } ]
            };
            chrome.notifications.create(m, callback, null);
        }
        function update(p) {
            if (chrome.notifications.clear(p), p == data.LoginNotificationId) return void text(data.LoginPageUrl);
            var nameParts = p.split(";"), type = nameParts[0], name = nameParts[1];
            if (type == data.GCMTypeQueue) list.getCollection(name).each(function(e) {
                if (e && e.itemId == name) return text(e.url), !1;
            }).catch(function(err) {}); else if (type == data.GCMTypeShared) for (var columns = callback.getSharedData(), i = 0; i < columns.length; i++) columns[i].itemId.toString() == name && (columns[i].type == data.TypeUrl ? text(columns[i].content) : create(columns[i].content));
        }
        function create(name) {
            var el = document.createElement("textarea");
            el.textContent = name;
            var head = document.getElementsByTagName("body")[0];
            head.appendChild(el), el.select(), document.execCommand("copy"), head.removeChild(el);
        }
        function print(text, arg) {
            return text + ";" + arg;
        }
        var data = createElement("./constants.js"), callback = createElement("./db.js"), index = createElement("./util.js"), list = createElement("./queueDb.js"), length = "Received a link", template = "Received a text", i = "notify", setup = function() {
            var tracker = chrome.gcm.onMessage.hasListeners();
            tracker || (chrome.gcm.onMessage.addListener(function(data) {
                if (callback.getAuthToken() && callback.getAuthToken().length > 0) {
                    var data, e = data.data;
                    e.message && (data = JSON.parse(e.message)), callback.getDirectedId() == e.directedId && f(e.type, e.action, data);
                }
            }), chrome.notifications.onClicked.addListener(update), chrome.notifications.onButtonClicked.addListener(update));
        }, x = function(e, i, b) {
            return $.ajax({
                url: e,
                type: i,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(data.AuthTokenKey));
                },
                data: b
            });
        }, f = function(e, t, n) {
            if (index.gaEvent(i, "handleGcmMessage", e), e == data.GCMTypeQueue) return void push(t, n);
            if (e == data.GCMTypeShared) return void test(t, n);
            if (e == data.GCMTypeTagsUpdate) {
                var events = x(data.TagsApi, "GET", {});
                events.success(function(data) {
                    callback.updateBookmarkTags(data.tags), index.gaEvent(i, "syncBookmarkTagsSucces");
                }), events.fail(function(e, r, t) {
                    index.gaEvent(i, "syncBookmarkTagsFail", e.status);
                });
            } else if (e == data.GCMTypeDevicesUpdate) {
                var events = x(data.DevicesApi, "GET", {});
                events.success(function(data) {
                    callback.updateDevicesList(data.devices), index.gaEvent(i, "syncDeviceListSuccess");
                }), events.fail(function(e, r, t) {
                    index.gaEvent(i, "syncBookmarkTagsFail", e.status);
                });
            } else e == data.GCMTypeLogout;
        }, push = function(collection, item) {
            var start = Date.now();
            list.getItem(item.itemId).then(function(v) {
                list.addItem(item).then(function(exists) {
                    list.updateViewedCount();
                }).catch(function(err) {}), void 0 != v ? handler(item) : v.created != item.created ? handler(item) : item.updated - start < data.FiveMinutesInMs && handler(item);
            }).catch(function(err) {
                list.addItem(item).then(function(exists) {
                    list.updateViewedCount();
                }).catch(function(err) {}), handler(item);
            });
        }, test = function(status, e) {
            var o = callback.getSharedItem(e.itemId);
            callback.addToShared(e);
            var a = !0, s = Date.now();
            void 0 != o && o.created - s > data.FiveMinutesInMs && (a = !1), a && callback.getBoolean(data.DisplayNotificationsKey) && (e.type == data.TypeUrl ? callback.getBoolean(data.SharedNotificationsKey) && (fn(print(data.GCMTypeShared, e.itemId), length, e.content), 
            callback.getBoolean(data.SharedOpenNewTabKey) && text(e.content)) : callback.getBoolean(data.SharedNotificationsKey) && dispatchEvent(print(data.GCMTypeShared, e.itemId), template, e.content));
        }, r = function() {
            var map = {
                type: "basic",
                title: "Login to Voblet",
                message: "You are not logged in to Voblet.Click to login",
                iconUrl: "icon128.png"
            };
            chrome.notifications.create(data.LoginNotificationId, map, null);
        };
        tag.exports = {
            activateGCMListener: setup,
            showLoginNotification: r,
            handleQueueGCM: push
        };
    }, {
        "./constants.js": 4,
        "./db.js": 5,
        "./queueDb.js": 8,
        "./util.js": 9
    } ],
    8: [ function(createElement, tag, properties) {
        "use strict";
        function start() {
            try {
                s.version(1).stores({
                    queue: "itemId,url,created,updated"
                });
            } catch (e) {}
            s.open().catch(function(err) {});
        }
        function send(obj) {
            return obj.searchText = create(obj), new Promise(function(resolve, reject) {
                s.queue.put(obj).then(function(exists) {
                    resolve(exists), callback();
                }).catch(function(err) {
                    reject(err);
                });
            });
        }
        function some(file) {
            return new Promise(function(resolve, reject) {
                s.queue.delete(file).then(function(exists) {
                    resolve(exists), callback();
                }).catch(function(err) {
                    reject(err);
                });
            });
        }
        function on(fn) {
            return s.queue.get(fn);
        }
        function add(object) {
            return s.queue.reverse();
        }
        function one(qw) {
            return s.queue.where("url").equalsIgnoreCase(qw).limit(1);
        }
        function destroy(timing) {
            return s.queue.where("url").startsWithAnyOfIgnoreCase(timing);
        }
        function parse(entities, cb) {
            s.transaction("rw", s.queue, function() {
                for (var ii = 0; ii < entities.length; ii++) {
                    var entity = entities[ii];
                    entity.searchText = create(entity), s.queue.put(entity).catch(function(err) {
                        l.setQueueLastUpdatedTimestamp(0), cb(d.Fail, d.DatabaseErr, err);
                    });
                }
            }).then(function(exists) {
                cb(d.Success), callback();
            }).catch(function(err) {
                l.setQueueLastUpdatedTimestamp(0), cb(d.Fail, d.DatabaseErr, err), r.gaEvent(t, "bulkInsertFail");
            });
        }
        function initialize(panels, cb) {
            s.transaction("rw", s.queue, function() {
                for (var i = 0; i < panels.length; i++) {
                    var panel = panels[i];
                    "D" != panel.updateAction ? (panel.searchText = create(panel), s.queue.put(panel).catch(function(err) {
                        l.setQueueLastUpdatedTimestamp(0), cb(d.Fail, d.DatabaseErr, err);
                    })) : s.queue.delete(panel.itemId).catch(function(err) {
                        l.setQueueLastUpdatedTimestamp(0), cb(d.Fail, d.DatabaseErr, err);
                    });
                }
            }).then(function(exists) {
                cb(d.Success), callback();
            }).catch(function(err) {
                l.setQueueLastUpdatedTimestamp(0), cb(d.Fail, d.DatabaseErr, err), r.gaEvent(t, "bulkInsertOnUpdateActionFail");
            });
        }
        function type(value, cb) {
            value == d.OldestFirst ? s.queue.orderBy("created").toArray(function(list) {
                cb(d.Success, list);
            }).catch(function(err) {
                cb(d.Fail, d.DatabaseErr, err);
            }) : s.queue.orderBy("created").reverse().toArray(function(list) {
                cb(d.Success, list);
            }).catch(function(err) {
                cb(d.Fail, d.DatabaseErr, err);
            });
        }
        function off() {
            s.queue.filter(function(callSite) {
                return callSite.isViewed === !1;
            }).count(function(err) {
                r.setBadgeText(err);
            });
        }
        function create(args) {
            var _key = args.note + path + args.url + path + args.urlTitle + path + args.urlImage;
            return _key.toLowerCase();
        }
        function poolLoad() {
            return s.queue.clear();
        }
        function callback() {
            chrome.tabs && chrome.tabs.query({
                url: [ "*://github.com/*", "*://gist.github.com/*" ]
            }, function(tabs) {
                for (var i = 0; i < tabs.length; i++) chrome.tabs.sendMessage(tabs[i].id, {
                    name: d.MessageQueueUpdated
                });
            });
        }
        var c = createElement("dexie"), l = createElement("./db.js"), d = createElement("./constants.js"), r = createElement("./util.js"), t = "queueDb", s = new c("Queue"), path = "fds{|}";
        tag.exports = {
            setup: start,
            addItem: send,
            getItem: on,
            getAll: type,
            getCollection: add,
            getItemByUrl: one,
            getItemsWithUrlPrefix: destroy,
            deleteAll: poolLoad,
            bulkInsert: parse,
            deleteItem: some,
            updateViewedCount: off,
            bulkInsertBasedOnUpdateAction: initialize
        };
    }, {
        "./constants.js": 4,
        "./db.js": 5,
        "./util.js": 9,
        dexie: 10
    } ],
    9: [ function(dataTable, srcColumnIndices, opt_dstColumnIndex) {
        "use strict";
        function assign(object, name, value) {
            return name in object ? Object.defineProperty(object, name, {
                value: value,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : object[name] = value, object;
        }
        function skip(n) {
            var evt = /(http|https|chrome-extension):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            return !!evt.test(n);
        }
        function getWindowSize() {
            return self.innerWidth ? self.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body ? document.body.clientWidth : void 0;
        }
        function sendMessage() {
            chrome.runtime.sendMessage({
                name: node.RefreshContextMenu
            }, null);
        }
        function domino() {
            chrome.windows.getAll({
                populate: !0
            }, function(orderingArr) {
                for (var o, l = orderingArr.length, f = 0; f < l; f++) {
                    o = orderingArr[f];
                    for (var len = o.tabs.length, i = 0; i < len; i++) {
                        var tab = o.tabs[i];
                        tab.url.match(/(chrome|chrome-extension):\/\//gi) || (chrome.tabs.insertCSS(tab.id, {
                            file: "css/contentScriptStyle.css"
                        }), chrome.tabs.executeScript(tab.id, {
                            file: "js/jquery-2.1.1.min.js"
                        }), chrome.tabs.executeScript(tab.id, {
                            file: "contentScript.js"
                        }));
                    }
                }
            });
        }
        var that = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol ? "symbol" : typeof a;
        }, node = dataTable("./constants.js"), length = function() {
            return chrome.app.getDetails().version;
        }, parent = function() {
            return node.Chrome;
        }, result = function() {
            chrome.extension && chrome.tabs ? (chrome.extension.sendMessage({
                name: node.MessageActivateTabListener
            }, null), chrome.tabs.create({
                active: !0,
                url: node.LoginPageUrl
            })) : window.location.href = node.LoginPageUrl;
        }, x = function(e) {
            parent() == node.Firefox ? browser.runtime.sendMessage(e) : chrome.extension.sendMessage(e, null);
        }, i = function(d) {
            chrome.tabs.query({
                active: !0,
                lastFocusedWindow: !0
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: node.MessageShowToast,
                    message: d
                }, null);
            });
        }, size = function(element) {
            chrome.tabs.query({
                currentWindow: !0,
                active: !0
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: node.MessageShowAddTagsDialog,
                    tags: element
                }, null);
            });
        }, onMouseMove = function(e) {
            chrome.tabs.getSelected(null, function(tab) {
                chrome.tabs.sendMessage(tab.id, {
                    type: node.MessageCloseAddTagsDialog,
                    message: e
                }, null);
            });
        }, init = function() {
            var d = new Date().getTime(), dim = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var a = (d + 16 * Math.random()) % 16 | 0;
                return d = Math.floor(d / 16), ("x" == c ? a : 3 & a | 8).toString(16);
            });
            return dim;
        }, formatDate = function(tweet) {
            var date = new Date(tweet), months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec" ], month = (date.getFullYear(), 
            months[date.getMonth()]), day = date.getDate();
            day < 10 && (day = "0" + day), month < 10 && (month = "0" + month);
            var hours = date.getHours(), actual = hours >= 12 ? "PM" : "AM";
            hours %= 12, hours = hours ? hours : 12, hours < 10 && (hours = "0" + hours);
            var m = date.getMinutes();
            m < 10 && (m = "0" + m);
            var sec = date.getSeconds();
            sec < 10 && (sec = "0" + sec);
            var datestr = month + " " + day + ", " + hours + ":" + m + " " + actual;
            return datestr;
        }, listener = function(e) {
            var l = document.createElement("a");
            return l.href = e, l.hostname;
        }, getByTags = function(e, t) {
            return null == e && (e = []), null == t && (t = []), e.sort().toString() == t.sort().toString();
        }, parseLine = function(line) {
            return !(line.length > node.BookmarkTagMaxLength) && !(line.indexOf(",") > -1);
        }, test = function(buffer) {
            for (var a = {}, n = [], l = buffer.length, j = 0, i = 0; i < l; i++) {
                var x = buffer[i];
                1 !== a[x] && (a[x] = 1, n[j++] = x);
            }
            return n;
        }, trackEvent = function(category, action, label) {
            void 0 != ("undefined" == typeof _gaq ? "undefined" : that(_gaq)) && _gaq.push([ "_trackEvent", category, action, label ]);
        }, f = function(id) {
            var x, e, p, i = document.getElementById(id), a = i.getBoundingClientRect(), b = document.getElementById(node.MainTag), j = 0, k = 0;
            return b && (j = b.scrollTop ? b.scrollTop : document.body.scrollTop, k = b.scrollLeft ? b.scrollLeft : document.body.scrollLeft), 
            e = a.top + j, x = a.left + k, p = getWindowSize() - a.right, {
                top: e,
                left: x,
                right: p
            };
        }, update = function(val) {
            var li = "", options = "", content = "", index = "", length = "", i = "", j = assign({
                title: ""
            }, "title", ""), len = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent('select * from html where url="' + val + '"') + "and xpath='//head'";
            return $.ajax({
                url: len,
                type: "get",
                dataType: "html",
                async: !1,
                timeout: 500,
                success: function(data) {
                    var o = $(data), r = o.find("title").text();
                    $(data).find("meta").each(function() {
                        var $this = $(this);
                        "og:title" == $this.attr("property") && (li = $this.attr("content")), "og:image" == $this.attr("property") && (content = $this.attr("content")), 
                        "twitter:title" != $this.attr("name") && "twitter:title" != $this.attr("property") || (options = $this.attr("content")), 
                        "twitter:image" != $this.attr("name") && "twitter:image" != $this.attr("property") || (index = $this.attr("content"));
                    }), "" != r ? length = r : "" != li ? length = li : "" != options && (length = options), 
                    "" != content ? i = content : "" != index && (i = index), j = {
                        title: length,
                        image: i
                    };
                }
            }), j;
        }, clear = function(e) {
            0 == e ? (chrome.browserAction.setBadgeBackgroundColor({
                color: "#50BCB6"
            }), chrome.browserAction.setBadgeText({
                text: ""
            })) : (chrome.browserAction.setBadgeBackgroundColor({
                color: "#50BCB6"
            }), chrome.browserAction.setBadgeText({
                text: "" + e
            }));
        }, _onWindowKeyPress = function(e) {
            return "facebook.com" == e || "m.facebook.com" == e || "fb.com" == e ? node.FacebookIcon : "www.youtube.com" == e || "youtube.com" == e || "m.youtube.com" == e || "youtu.be" == e ? node.YoutubeIcon : "twitter.com" == e || "m.twitter.com" == e || "t.co" == e ? node.TwitterIcon : "";
        };
        srcColumnIndices.exports = {
            getVersionNumber: length,
            generateUUID: init,
            getDomainName: listener,
            getReadableTime: formatDate,
            showToastInTab: i,
            isValidUrl: skip,
            areArraysEqual: getByTags,
            removeDuplicatesInArray: test,
            showAddTagsDialog: size,
            closeAddTagsDialog: onMouseMove,
            gaEvent: trackEvent,
            getOffsetPosition: f,
            isValidBookmarkTag: parseLine,
            getUrlData: update,
            setBadgeText: clear,
            getUrlImageForThisDomain: _onWindowKeyPress,
            updateContextMenu: sendMessage,
            injectContentScript: domino,
            getBrowser: parent,
            sendMessage: x,
            openLoginPage: result
        };
    }, {
        "./constants.js": 4
    } ],
    10: [ function(promiseComplete, module, arg) {
        (function(exports) {
            !function(root, factory) {
                "object" == typeof arg && "undefined" != typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define(factory) : root.Dexie = factory();
            }(this, function() {
                "use strict";
                function stringify(old, newIndentChar) {
                    Dropzone = old, Em = newIndentChar;
                }
                function match() {
                    if (camelize) try {
                        throw match.arguments, new Error();
                    } catch (matched) {
                        return matched;
                    }
                    return new Error();
                }
                function parse(e, _index) {
                    var source = e.stack;
                    return source ? (_index = _index || 0, 0 === source.indexOf(e.name) && (_index += (e.name + e.message).split("\n").length), 
                    source.split("\n").slice(_index).filter(Em).map(function(ch) {
                        return "\n" + ch;
                    }).join("")) : "";
                }
                function undef() {}
                function radius(r) {
                    return r;
                }
                function forEach(callback, f) {
                    return null == callback || callback === radius ? f : function(value) {
                        return f(callback(value));
                    };
                }
                function call(method, func) {
                    return function() {
                        method.apply(this, arguments), func.apply(this, arguments);
                    };
                }
                function u(f, init) {
                    return f === undef ? init : function() {
                        var value = f.apply(this, arguments);
                        void 0 !== value && (arguments[0] = value);
                        var n = this.onsuccess, text = this.onerror;
                        this.onsuccess = null, this.onerror = null;
                        var t = init.apply(this, arguments);
                        return n && (this.onsuccess = this.onsuccess ? call(n, this.onsuccess) : n), text && (this.onerror = this.onerror ? call(text, this.onerror) : text), 
                        void 0 !== t ? t : value;
                    };
                }
                function c(f, route) {
                    return f === undef ? route : function() {
                        f.apply(this, arguments);
                        var d = this.onsuccess, o = this.onerror;
                        this.onsuccess = this.onerror = null, route.apply(this, arguments), d && (this.onsuccess = this.onsuccess ? call(d, this.onsuccess) : d), 
                        o && (this.onerror = this.onerror ? call(o, this.onerror) : o);
                    };
                }
                function process(val, callback) {
                    return val === undef ? callback : function(e) {
                        var r = val.apply(this, arguments);
                        cb(e, r);
                        var text = this.onsuccess, context = this.onerror;
                        this.onsuccess = null, this.onerror = null;
                        var result = callback.apply(this, arguments);
                        return text && (this.onsuccess = this.onsuccess ? call(text, this.onsuccess) : text), 
                        context && (this.onerror = this.onerror ? call(context, this.onerror) : context), 
                        void 0 === r ? void 0 === result ? void 0 : result : cb(r, result);
                    };
                }
                function fn(f, cb) {
                    return f === undef ? cb : function() {
                        return cb.apply(this, arguments) !== !1 && f.apply(this, arguments);
                    };
                }
                function invoke(method, controller) {
                    return method === undef ? controller : function() {
                        var module = method.apply(this, arguments);
                        if (module && "function" == typeof module.then) {
                            for (var app = this, len = arguments.length, args = new Array(len); len--; ) args[len] = arguments[len];
                            return module.then(function() {
                                return controller.apply(app, args);
                            });
                        }
                        return controller.apply(this, arguments);
                    };
                }
                function cb(a, b) {
                    return "object" != typeof b ? a : (push(b).forEach(function(prop) {
                        a[prop] = b[prop];
                    }), a);
                }
                function callback(incoming, key) {
                    return __hasProp.call(incoming, key);
                }
                function describe(name, o) {
                    "function" == typeof o && (o = o(without(name))), push(o).forEach(function(n) {
                        exists(name, n, o[n]);
                    });
                }
                function exists(o, name, post, props) {
                    Object.defineProperty(o, name, cb(post && callback(post, "get") && "function" == typeof post.get ? {
                        get: post.get,
                        set: post.set,
                        configurable: !0
                    } : {
                        value: post,
                        configurable: !0,
                        writable: !0
                    }, props));
                }
                function isFunction(object) {
                    return {
                        from: function(From) {
                            return object.prototype = Object.create(From.prototype), exists(object.prototype, "constructor", object), 
                            {
                                extend: describe.bind(null, object.prototype)
                            };
                        }
                    };
                }
                function clean(e, callback) {
                    var s, p = __extends(e, callback);
                    return p || (s = without(e)) && clean(s, callback);
                }
                function max(thisArg, d, b) {
                    return __slice.call(thisArg, d, b);
                }
                function min(target, a) {
                    return a(target);
                }
                function timeout(fn) {
                    var timer = setTimeout(fn, 1e3);
                    clearTimeout(timer);
                }
                function success(instance) {
                    if (!instance) throw new data.Internal("Assertion failed");
                }
                function check(fn) {
                    noop.setImmediate ? setImmediate(fn) : setTimeout(fn, 0);
                }
                function find(bitArray, callback) {
                    return bitArray.reduce(function(s, n, v) {
                        var i = callback(n, v);
                        return i && (s[i[0]] = i[1]), s;
                    }, {});
                }
                function _(str, test) {
                    return function() {
                        try {
                            format.apply(this, arguments);
                        } catch (format) {
                            test(format);
                        }
                    };
                }
                function each(fn, callback, args) {
                    try {
                        fn.apply(null, args);
                    } catch (fn) {
                        callback && callback(fn);
                    }
                }
                function reject(target, a) {
                    var args = add.reject(target);
                    return a ? args.uncaught(a) : args;
                }
                function set(object, name) {
                    if (callback(object, name)) return object[name];
                    if (!name) return object;
                    if ("string" != typeof name) {
                        for (var tags = [], k = 0, lk = name.length; k < lk; ++k) {
                            var id = set(object, name[k]);
                            tags.push(id);
                        }
                        return tags;
                    }
                    var i = name.indexOf(".");
                    if (i !== -1) {
                        var value = object[name.substr(0, i)];
                        return void 0 === value ? void 0 : set(value, name.substr(i + 1));
                    }
                }
                function log(result, val, obj) {
                    if (result && void 0 !== val && !("isFrozen" in Object && Object.isFrozen(result))) if ("string" != typeof val && "length" in val) {
                        success("string" != typeof obj && "length" in obj);
                        for (var i = 0, l = val.length; i < l; ++i) log(result, val[i], obj[i]);
                    } else {
                        var index = val.indexOf(".");
                        if (index !== -1) {
                            var key = val.substr(0, index), args = val.substr(index + 1);
                            if ("" === args) void 0 === obj ? delete result[key] : result[key] = obj; else {
                                var text = result[key];
                                text || (text = result[key] = {}), log(text, args, obj);
                            }
                        } else void 0 === obj ? delete result[val] : result[val] = obj;
                    }
                }
                function Timer(label, a) {
                    "string" == typeof a ? log(label, a, void 0) : "length" in a && [].map.call(a, function(val) {
                        log(label, val, void 0);
                    });
                }
                function show(o) {
                    var r = {};
                    for (var k in o) callback(o, k) && (r[k] = o[k]);
                    return r;
                }
                function clone(obj) {
                    if (!obj || "object" != typeof obj) return obj;
                    var copy;
                    if (isArray(obj)) {
                        copy = [];
                        for (var i = 0, len = obj.length; i < len; ++i) copy.push(clone(obj[i]));
                    } else if (obj instanceof Date) copy = new Date(), copy.setTime(obj.getTime()); else {
                        copy = obj.constructor ? Object.create(obj.constructor.prototype) : {};
                        for (var attr in obj) callback(obj, attr) && (copy[attr] = clone(obj[attr]));
                    }
                    return copy;
                }
                function filter(s, data, result, prefix) {
                    return result = result || {}, prefix = prefix || "", push(s).forEach(function(name) {
                        if (callback(data, name)) {
                            var i = s[name], v = data[name];
                            "object" == typeof i && "object" == typeof v && i && v && i.constructor === v.constructor ? filter(i, v, result, prefix + name + ".") : i !== v && (result[prefix + name] = data[name]);
                        } else result[prefix + name] = void 0;
                    }), push(data).forEach(function(key) {
                        callback(s, key) || (result[prefix + key] = data[key]);
                    }), result;
                }
                function remove(a) {
                    var i, result, node, b;
                    if (1 === arguments.length) {
                        if (isArray(a)) return a.slice();
                        if (this === id && "string" == typeof a) return [ a ];
                        if (b = serialize(a)) {
                            for (result = []; node = b.next(), !node.done; ) result.push(node.value);
                            return result;
                        }
                        if (null == a) return [ a ];
                        if (i = a.length, "number" == typeof i) {
                            for (result = new Array(i); i--; ) result[i] = a[i];
                            return result;
                        }
                        return [ a ];
                    }
                    for (i = arguments.length, result = new Array(i); i--; ) result[i] = arguments[i];
                    return result;
                }
                function wrap(args) {
                    return _concat.apply([], args);
                }
                function value(name, index) {
                    this._e = match(), this.name = name, this.message = index;
                }
                function format(last, table) {
                    return last + ". Errors: " + table.map(function(e) {
                        return e.toString();
                    }).filter(function(v, i, o) {
                        return o.indexOf(v) === i;
                    }).join("\n");
                }
                function err(msg, page, r, l) {
                    this._e = match(), this.failures = page, this.failedKeys = l, this.successCount = r;
                }
                function listener(message, a) {
                    this._e = match(), this.name = "BulkError", this.failures = a, this.message = format(message, a);
                }
                function stack(e, error) {
                    if (!e || e instanceof value || e instanceof TypeError || e instanceof SyntaxError || !e.name || !handlers[e.name]) return e;
                    var err = new handlers[e.name](error || e.message, e);
                    return "stack" in e && exists(err, "stack", {
                        get: function() {
                            return this.inner.stack;
                        }
                    }), err;
                }
                function run(files) {
                    function create(name, callback, context) {
                        if ("object" == typeof name) return next(name);
                        callback || (callback = fn), context || (context = undef);
                        var msg = {
                            subscribers: [],
                            fire: context,
                            subscribe: function(state) {
                                msg.subscribers.indexOf(state) === -1 && (msg.subscribers.push(state), msg.fire = callback(msg.fire, state));
                            },
                            unsubscribe: function(local) {
                                msg.subscribers = msg.subscribers.filter(function(callSite) {
                                    return callSite !== local;
                                }), msg.fire = msg.subscribers.reduce(callback, context);
                            }
                        };
                        return c[name] = error[name] = msg, msg;
                    }
                    function next(inps) {
                        push(inps).forEach(function(i) {
                            var k = inps[i];
                            if (isArray(k)) create(i, inps[i][0], inps[i][1]); else {
                                if ("asap" !== k) throw new data.InvalidArgument("Invalid event config");
                                var p = create(i, radius, function() {
                                    for (var len = arguments.length, args = new Array(len); len--; ) args[len] = arguments[len];
                                    p.subscribers.forEach(function(cb) {
                                        check(function() {
                                            cb.apply(null, args);
                                        });
                                    });
                                });
                            }
                        });
                    }
                    var c = {}, error = function(e, context) {
                        if (context) {
                            for (var len = arguments.length, args = new Array(len - 1); --len; ) args[len - 1] = arguments[len];
                            return c[e].subscribe.apply(null, args), files;
                        }
                        if ("string" == typeof e) return c[e];
                    };
                    error.addEventType = create;
                    for (var i = 1, l = arguments.length; i < l; ++i) create(arguments[i]);
                    return error;
                }
                function add(fn) {
                    if ("object" != typeof this) throw new TypeError("Promises must be constructed via new");
                    this._listeners = [], this.onuncatched = undef, this._lib = !1;
                    var result = this._PSD = obj;
                    if (Dropzone && (this._stackHolder = match(), this._prev = null, this._numPrev = 0, 
                    test(this, left)), "function" != typeof fn) {
                        if (fn !== i) throw new TypeError("Not a function");
                        return this._state = arguments[1], this._value = arguments[2], void (this._state === !1 && func(this, this._value));
                    }
                    this._state = null, this._value = null, ++result.ref, bind(this, fn);
                }
                function Handler(onFulfilled, onRejected, resolve, reject) {
                    this.onFulfilled = "function" == typeof onFulfilled ? onFulfilled : null, this.onRejected = "function" == typeof onRejected ? onRejected : null, 
                    this.resolve = resolve, this.reject = reject, this.psd = obj;
                }
                function bind(data, callback) {
                    try {
                        callback(function(v) {
                            if (null === data._state) {
                                if (v === data) throw new TypeError("A promise cannot be resolved with itself.");
                                var arrayBuffer = data._lib && indexOf();
                                v && "function" == typeof v.then ? bind(data, function(value, key) {
                                    v instanceof add ? v._then(value, key) : v.then(value, key);
                                }) : (data._state = !0, data._value = v, f(data)), arrayBuffer && next();
                            }
                        }, func.bind(null, data));
                    } catch (callback) {
                        func(data, callback);
                    }
                }
                function func(promise, value) {
                    if (result.push(value), null === promise._state) {
                        var newVal = promise._lib && indexOf();
                        value = ref(value), promise._state = !1, promise._value = value, Dropzone && null !== value && "object" == typeof value && !value._promise && each(function() {
                            var result = clean(value, "stack");
                            value._promise = promise, exists(value, "stack", {
                                get: function() {
                                    return y ? result && (result.get ? result.get.apply(value) : result.value) : promise.stack;
                                }
                            });
                        }), combine(promise), f(promise), newVal && next();
                    }
                }
                function f(p) {
                    var a = p._listeners;
                    p._listeners = [];
                    for (var i = 0, l = a.length; i < l; ++i) destroy(p, a[i]);
                    var b = p._PSD;
                    --b.ref || b.finalize(), 0 === command && (++command, defer(function() {
                        0 === --command && done();
                    }, []));
                }
                function destroy(that, deferred) {
                    if (null === that._state) return void that._listeners.push(deferred);
                    var l = that._state ? deferred.onFulfilled : deferred.onRejected;
                    if (null === l) return (that._state ? deferred.resolve : deferred.reject)(that._value);
                    var args = deferred.psd;
                    ++args.ref, ++command, defer(go, [ l, that, deferred ]);
                }
                function go(callback, n, that) {
                    var r = obj, l = that.psd;
                    try {
                        l !== r && (obj = l), left = n;
                        var value, i = n._value;
                        n._state ? value = callback(i) : (result.length && (result = []), value = callback(i), 
                        result.indexOf(i) === -1 && send(n)), that.resolve(value);
                    } catch (callback) {
                        that.reject(callback);
                    } finally {
                        l !== r && (obj = r), left = null, 0 === --command && done(), --l.ref || l.finalize();
                    }
                }
                function register(that, obj, func) {
                    if (obj.length === func) return obj;
                    var name = "";
                    if (that._state === !1) {
                        var s, msg, node = that._value;
                        null != node ? (s = node.name || "Error", msg = node.message || node, name = parse(node, 0)) : (s = node, 
                        msg = ""), obj.push(s + (msg ? ": " + msg : "") + name);
                    }
                    return Dropzone && (name = parse(that._stackHolder, 2), name && obj.indexOf(name) === -1 && obj.push(name), 
                    that._prev && register(that._prev, obj, func)), obj;
                }
                function test(t, value) {
                    var i = value ? value._numPrev + 1 : 0;
                    i < j && (t._prev = value, t._numPrev = i);
                }
                function trigger() {
                    indexOf() && next();
                }
                function indexOf() {
                    var e = a;
                    return a = !1, h = !1, e;
                }
                function next() {
                    var r, i, l;
                    do for (;len.length > 0; ) for (r = len, len = [], l = r.length, i = 0; i < l; ++i) {
                        var t = r[i];
                        t[0].apply(null, t[1]);
                    } while (len.length > 0);
                    a = !0, h = !0;
                }
                function done() {
                    var handlers = children;
                    children = [], handlers.forEach(function(h) {
                        h._PSD.onunhandled.call(null, h._value, h);
                    });
                    for (var ret = callbacks.slice(0), i = ret.length; i; ) ret[--i]();
                }
                function init(callback) {
                    function func() {
                        callback(), callbacks.splice(callbacks.indexOf(func), 1);
                    }
                    callbacks.push(func), ++command, defer(function() {
                        0 === --command && done();
                    }, []);
                }
                function combine(f) {
                    children.some(function(n) {
                        return n._value === f._value;
                    }) || children.push(f);
                }
                function send(data) {
                    for (var i = children.length; i; ) if (children[--i]._value === data._value) return void children.splice(i, 1);
                }
                function capture(inTarget) {}
                function unload(data) {
                    return new add(i, !1, data);
                }
                function __bind(me, fn) {
                    var mesh = obj;
                    return function() {
                        var search = indexOf(), o = obj;
                        try {
                            return o !== mesh && (obj = mesh), compileFn.apply(this, arguments);
                        } catch (compileFn) {
                            fn && fn(compileFn);
                        } finally {
                            o !== mesh && (obj = o), search && next();
                        }
                    };
                }
                function extend(value, index, object, callback) {
                    var result = obj, i = Object.create(result);
                    i.parent = result, i.ref = 0, i.global = !1, ++result.ref, i.finalize = function() {
                        --this.parent.ref || this.parent.finalize();
                    };
                    var ret = slice(i, value, index, object, callback);
                    return 0 === i.ref && i.finalize(), ret;
                }
                function slice(e, f, xs, state, m) {
                    var elem = obj;
                    try {
                        return e !== elem && (obj = e), f(xs, state, m);
                    } finally {
                        e !== elem && (obj = elem);
                    }
                }
                function merge(context, args) {
                    var result;
                    try {
                        result = args.onuncatched(context);
                    } catch (context) {}
                    if (result !== !1) try {
                        add.on.error.fire(context, args);
                    } catch (context) {}
                }
                function create(name, res) {
                    function factory() {
                        d.on("versionchange", function(e) {
                            e.newVersion > 0, d.close();
                        }), d.on("blocked", function(e) {
                            !e.newVersion || e.newVersion < e.oldVersion;
                        });
                    }
                    function User(scrollElement) {
                        this._cfg = {
                            version: scrollElement,
                            storesSource: null,
                            dbschema: {},
                            tables: {},
                            contentUpgrade: null
                        }, this.stores({});
                    }
                    function f(x, b, done) {
                        var a = d._createTransaction(result, i, key);
                        a.create(b), a._completion.catch(done);
                        var c = a._reject.bind(a);
                        extend(function() {
                            obj.trans = a, 0 === x ? (push(key).forEach(function(k) {
                                func(b, k, key[k].primKey, key[k].indexes);
                            }), add.follow(function() {
                                return d.on.populate.fire(a);
                            }).catch(c)) : test(x, a, b).catch(c);
                        });
                    }
                    function test(target, t, x) {
                        function done() {
                            return docs.length ? add.resolve(docs.shift()(t.idbtrans)).then(done) : add.resolve();
                        }
                        var docs = [], user = names.filter(function(callSite) {
                            return callSite._cfg.version === target;
                        })[0];
                        if (!user) throw new data.Upgrade("Dexie specification of currently installed DB version is missing");
                        key = d._dbSchema = user._cfg.dbschema;
                        var a = !1, elements = names.filter(function(callSite) {
                            return callSite._cfg.version > target;
                        });
                        return elements.forEach(function(element) {
                            docs.push(function() {
                                var id = key, name = element._cfg.dbschema;
                                get(id, x), get(name, x), key = d._dbSchema = name;
                                var p = fn(id, name);
                                if (p.add.forEach(function(p) {
                                    func(x, p[0], p[1].primKey, p[1].indexes);
                                }), p.change.forEach(function(group) {
                                    if (group.recreate) throw new data.Upgrade("Not yet support for changing primary key");
                                    var name = x.objectStore(group.name);
                                    group.add.forEach(function(tag) {
                                        next(name, tag);
                                    }), group.change.forEach(function(tag) {
                                        name.deleteIndex(tag.name), next(name, tag);
                                    }), group.del.forEach(function(doclet) {
                                        name.deleteIndex(doclet);
                                    });
                                }), element._cfg.contentUpgrade) return a = !0, add.follow(function() {
                                    element._cfg.contentUpgrade(t);
                                });
                            }), docs.push(function(msg) {
                                if (a && !_len) {
                                    var state = element._cfg.dbschema;
                                    notify(state, msg);
                                }
                            });
                        }), done().then(function() {
                            init(key, x);
                        });
                    }
                    function fn(data, row) {
                        var msg = {
                            del: [],
                            add: [],
                            change: []
                        };
                        for (var k in data) row[k] || msg.del.push(k);
                        for (k in row) {
                            var r = data[k], e = row[k];
                            if (r) {
                                var api = {
                                    name: k,
                                    def: e,
                                    recreate: !1,
                                    del: [],
                                    add: [],
                                    change: []
                                };
                                if (r.primKey.src !== e.primKey.src) api.recreate = !0, msg.change.push(api); else {
                                    var collection = r.idxByName, object = e.idxByName;
                                    for (var i in collection) object[i] || api.del.push(i);
                                    for (i in object) {
                                        var node = collection[i], block = object[i];
                                        node ? node.src !== block.src && api.change.push(block) : api.add.push(block);
                                    }
                                    (api.del.length > 0 || api.add.length > 0 || api.change.length > 0) && msg.change.push(api);
                                }
                            } else msg.add.push([ k, e ]);
                        }
                        return msg;
                    }
                    function func(trans, name, options, taglist) {
                        var err = trans.db.createObjectStore(name, options.keyPath ? {
                            keyPath: options.keyPath,
                            autoIncrement: options.auto
                        } : {
                            autoIncrement: options.auto
                        });
                        return taglist.forEach(function(tag) {
                            next(err, tag);
                        }), err;
                    }
                    function init(p, x) {
                        push(p).forEach(function(y) {
                            x.db.objectStoreNames.contains(y) || func(x, y, p[y].primKey, p[y].indexes);
                        });
                    }
                    function notify(obj, transaction) {
                        for (var i = 0; i < transaction.db.objectStoreNames.length; ++i) {
                            var key = transaction.db.objectStoreNames[i];
                            null == obj[key] && transaction.db.deleteObjectStore(key);
                        }
                    }
                    function next(ajaxRequest, options) {
                        ajaxRequest.createIndex(options.name, options.keyPath, {
                            unique: options.unique,
                            multiEntry: options.multi
                        });
                    }
                    function event(data) {
                        return d.on.error.fire(data);
                    }
                    function on(el, ev, fn) {
                        if (loading || obj.letThrough) {
                            var content = d._createTransaction(el, ev, key);
                            return content._promise(el, function(err, res) {
                                extend(function() {
                                    obj.trans = content, fn(err, res, content);
                                });
                            }).then(function(value) {
                                return content._completion.then(function() {
                                    return value;
                                });
                            });
                        }
                        if (!a) {
                            if (!k) return reject(new data.DatabaseClosed(), event);
                            d.open().catch(undef);
                        }
                        return index.then(function() {
                            return on(el, ev, fn);
                        });
                    }
                    function Element(name, schema, tag) {
                        this.name = name, this.schema = schema, this.hook = templates[name] ? templates[name].hook : run(null, {
                            creating: [ u, undef ],
                            reading: [ forEach, radius ],
                            updating: [ process, undef ],
                            deleting: [ c, undef ]
                        }), this._collClass = tag || reset;
                    }
                    function Application(name, options, params) {
                        Element.call(this, name, options, params || opts);
                    }
                    function bind(_combinationsSeen, f, var_args) {
                        return (var_args ? update : replace)(function(_combination) {
                            _combinationsSeen.push(_combination), f && f();
                        });
                    }
                    function call(obj, opts, data, length, fn) {
                        return new add(function(next, array) {
                            var len = data.length, index = len - 1;
                            if (0 === len) return next();
                            if (length) {
                                var _this, p = update(array), win = map(null);
                                each(function() {
                                    for (var i = 0; i < len; ++i) {
                                        _this = {
                                            onsuccess: null,
                                            onerror: null
                                        };
                                        var a = data[i];
                                        fn.call(_this, a[0], a[1], opts);
                                        var xhr = obj.delete(a[0]);
                                        xhr._hookCtx = _this, xhr.onerror = p, i === index ? xhr.onsuccess = map(next) : xhr.onsuccess = win;
                                    }
                                }, function(e) {
                                    throw _this.onerror && _this.onerror(e), e;
                                });
                            } else for (var i = 0; i < len; ++i) {
                                var request = obj.delete(data[i]);
                                request.onerror = __bind(replace(array)), i === index && (request.onsuccess = __bind(function() {
                                    return next();
                                }));
                            }
                        }).uncaught(event);
                    }
                    function tick(mode, gameClock, paused, parent) {
                        var that = this;
                        this.db = d, this.mode = mode, this.storeNames = gameClock, this.idbtrans = null, 
                        this.on = run(this, "complete", "error", "abort"), this.parent = parent || null, 
                        this.active = !0, this._tables = null, this._reculock = 0, this._blockedFuncs = [], 
                        this._psd = null, this._dbschema = paused, this._resolve = null, this._reject = null, 
                        this._completion = new add(function(l, r) {
                            that._resolve = l, that._reject = r;
                        }).uncaught(event), this._completion.then(function() {
                            that.on.complete.fire();
                        }, function(e) {
                            return that.on.error.fire(e), that.parent ? that.parent._reject(e) : that.active && that.idbtrans && that.idbtrans.abort(), 
                            that.active = !1, reject(e);
                        });
                    }
                    function item(selection, buffer, value) {
                        this._ctx = {
                            table: selection,
                            index: ":id" === buffer ? null : buffer,
                            collClass: selection._collClass,
                            or: value
                        };
                    }
                    function reset(e, callback) {
                        var cb = null, err = null;
                        if (callback) try {
                            cb = callback();
                        } catch (e) {
                            err = e;
                        }
                        var item = e._ctx, name = item.table;
                        this._ctx = {
                            table: name,
                            index: item.index,
                            isPrimKey: !item.index || name.schema.primKey.keyPath && item.index === name.schema.primKey.name,
                            range: cb,
                            keysOnly: !1,
                            dir: "next",
                            unique: "",
                            algorithm: null,
                            filter: null,
                            replayFilter: null,
                            justLimit: !0,
                            isMatch: null,
                            offset: 0,
                            limit: 1 / 0,
                            error: err,
                            or: item.or,
                            valueMapper: name.hook.reading.fire
                        };
                    }
                    function destroy(options, id) {
                        return !(options.filter || options.algorithm || options.or) && (id ? options.justLimit : !options.replayFilter);
                    }
                    function opts() {
                        reset.apply(this, arguments);
                    }
                    function sortci(a, b) {
                        return a._cfg.version - b._cfg.version;
                    }
                    function emit(ary, data, evt, targetTouches) {
                        data.forEach(function(i) {
                            var e = d._tableFactory(evt, targetTouches[i]);
                            ary.forEach(function(o) {
                                i in o || (o[i] = e);
                            });
                        });
                    }
                    function attachEvents(target) {
                        target.forEach(function(item) {
                            for (var p in item) item[p] instanceof Element && delete item[p];
                        });
                    }
                    function load(element, push, cb, next, offset, get) {
                        var len = get ? function(nodeOrQuery, type, callback) {
                            return cb(get(nodeOrQuery), type, callback);
                        } : cb, emit = __bind(len, offset);
                        element.onerror || (element.onerror = replace(offset)), push ? element.onsuccess = _(function() {
                            var key = element.result;
                            if (key) {
                                var err = function() {
                                    key.continue();
                                };
                                push(key, function(e) {
                                    err = e;
                                }, next, offset) && emit(key.value, key, function(e) {
                                    err = e;
                                }), err();
                            } else next();
                        }, offset) : element.onsuccess = _(function() {
                            var doc = element.result;
                            if (doc) {
                                var len = function() {
                                    doc.continue();
                                };
                                emit(doc.value, doc, function(err) {
                                    len = err;
                                }), len();
                            } else next();
                        }, offset);
                    }
                    function traverse(hash) {
                        var refs = [];
                        return hash.split(",").forEach(function(key) {
                            key = key.trim();
                            var name = key.replace(/([&*]|\+\+)/g, ""), id = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
                            refs.push(new Plugin(name, id || null, /\&/.test(key), /\*/.test(key), /\+\+/.test(key), isArray(id), /\./.test(key)));
                        }), refs;
                    }
                    function done(err, pos) {
                        return args.cmp(err, pos);
                    }
                    function render(other, value) {
                        return done(other, value) < 0 ? other : value;
                    }
                    function translate(key, value) {
                        return done(key, value) > 0 ? key : value;
                    }
                    function comparator(type, value) {
                        return args.cmp(type, value);
                    }
                    function compare(pos, renderer) {
                        return args.cmp(renderer, pos);
                    }
                    function current(ma, mb) {
                        return ma < mb ? -1 : ma === mb ? 0 : 1;
                    }
                    function binary(eA, eB) {
                        return eA > eB ? -1 : eA === eB ? 0 : 1;
                    }
                    function concat(compileFn, second) {
                        return compileFn ? second ? function() {
                            return compileFn.apply(this, arguments) && second.apply(this, arguments);
                        } : compileFn : second;
                    }
                    function write() {
                        if (d.verno = db.version / 10, d._dbSchema = key = {}, i = max(db.objectStoreNames, 0), 
                        0 !== i.length) {
                            var transaction = db.transaction(lambda(i), "readonly");
                            i.forEach(function(type) {
                                for (var store = transaction.objectStore(type), data = store.keyPath, n = data && "string" == typeof data && data.indexOf(".") !== -1, i = new Plugin(data, data || "", !1, !1, !!store.autoIncrement, data && "string" != typeof data, n), x = [], j = 0; j < store.indexNames.length; ++j) {
                                    var options = store.index(store.indexNames[j]);
                                    data = options.keyPath, n = data && "string" == typeof data && data.indexOf(".") !== -1;
                                    var evt = new Plugin(options.name, data, !!options.unique, !!options.multiEntry, !1, data && "string" != typeof data, n);
                                    x.push(evt);
                                }
                                key[type] = new constructor(type, i, x, {});
                            }), emit([ templates, tick.prototype ], push(key), result, key);
                        }
                    }
                    function get(url, trans) {
                        for (var buf = trans.db.objectStoreNames, ix = 0; ix < buf.length; ++ix) {
                            var len = buf[ix], data = trans.objectStore(len);
                            children = "getAll" in data;
                            for (var i = 0; i < data.indexNames.length; ++i) {
                                var name = data.indexNames[i], a = data.index(name).keyPath, slug = "string" == typeof a ? a : "[" + max(a).join("+") + "]";
                                if (url[len]) {
                                    var entity = url[len].idxByName[slug];
                                    entity && (entity.name = name);
                                }
                            }
                        }
                    }
                    function dispatch(args) {
                        d.on("blocked").fire(args), options.filter(function(o) {
                            return o.name === d.name && o !== d && !o._vcFired;
                        }).map(function(cat) {
                            return cat.on("versionchange").fire(args);
                        });
                    }
                    var x, end, children, l = create.dependencies, ret = cb({
                        addons: create.addons,
                        autoOpen: !0,
                        indexedDB: l.indexedDB,
                        IDBKeyRange: l.IDBKeyRange
                    }, res), value = ret.addons, k = ret.autoOpen, args = ret.indexedDB, util = ret.IDBKeyRange, key = this._dbSchema = {}, names = [], i = [], templates = {}, db = null, error = null, a = !1, loading = !1, type = "readonly", result = "readwrite", d = this, index = new add(function(e) {
                        x = e;
                    }), _len2 = new add(function(e, t) {
                        end = t;
                    }), buffer = !0, collection = !!resize(args);
                    this.version = function(row) {
                        if (db || a) throw new data.Schema("Cannot add version when database is open");
                        this.verno = Math.max(this.verno, row);
                        var user = names.filter(function(callSite) {
                            return callSite._cfg.version === row;
                        })[0];
                        return user ? user : (user = new User(row), names.push(user), names.sort(sortci), 
                        user);
                    }, cb(User.prototype, {
                        stores: function(res) {
                            this._cfg.storesSource = this._cfg.storesSource ? cb(this._cfg.storesSource, res) : res;
                            var err = {};
                            names.forEach(function(colData) {
                                cb(err, colData._cfg.storesSource);
                            });
                            var user = this._cfg.dbschema = {};
                            return this._parseStoresSpec(err, user), key = d._dbSchema = user, attachEvents([ templates, d, tick.prototype ]), 
                            emit([ templates, d, tick.prototype, this._cfg.tables ], push(user), result, user), 
                            i = push(user), this;
                        },
                        upgrade: function(cb) {
                            var that = this;
                            return $timeout(function() {
                                cb(d._createTransaction(result, push(that._cfg.dbschema), that._cfg.dbschema));
                            }), this._cfg.contentUpgrade = cb, this;
                        },
                        _parseStoresSpec: function(node, instanceMap) {
                            push(node).forEach(function(key) {
                                if (null !== node[key]) {
                                    var i = {}, options = traverse(node[key]), o = options.shift();
                                    if (o.multi) throw new data.Schema("Primary key cannot be multi-valued");
                                    o.keyPath && log(i, o.keyPath, o.auto ? 0 : o.keyPath), options.forEach(function(result) {
                                        if (result.auto) throw new data.Schema("Only primary key can be marked as autoIncrement (++)");
                                        if (!result.keyPath) throw new data.Schema("Index must have a name and cannot be an empty string");
                                        log(i, result.keyPath, result.compound ? result.keyPath.map(function() {
                                            return "";
                                        }) : "");
                                    }), instanceMap[key] = new constructor(key, o, options, i);
                                }
                            });
                        }
                    }), this._allTables = templates, this._tableFactory = function(name, config) {
                        return name === type ? new Element(config.name, config, reset) : new Application(config.name, config);
                    }, this._createTransaction = function(path, flags, mode, cb) {
                        return new tick(path, flags, mode, cb);
                    }, this._whenReady = function(f) {
                        return new add(list || loading || obj.letThrough ? f : function(key, value) {
                            if (!a) {
                                if (!k) return void value(new data.DatabaseClosed());
                                d.open().catch(undef);
                            }
                            index.then(function() {
                                f(key, value);
                            });
                        }).uncaught(event);
                    }, this.verno = 0, this.open = function() {
                        if (a || db) return index.then(function() {
                            return error ? reject(error, event) : d;
                        });
                        Dropzone && (_len2._stackHolder = match()), a = !0, error = null, loading = !1;
                        var cb = x, params = null;
                        return add.race([ _len2, new add(function(callback, fn) {
                            if (timeout(function() {
                                return callback();
                            }), names.length > 0 && (buffer = !1), !args) throw new data.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
                            var request = buffer ? args.open(name) : args.open(name, Math.round(10 * d.verno));
                            if (!request) throw new data.MissingAPI("IndexedDB API not available");
                            request.onerror = __bind(replace(fn)), request.onblocked = __bind(dispatch), request.onupgradeneeded = __bind(function(event) {
                                if (params = request.transaction, buffer && !d._allowEmptyDB) {
                                    request.onerror = stop, params.abort(), request.result.close();
                                    var req = args.deleteDatabase(name);
                                    req.onsuccess = req.onerror = __bind(function() {
                                        fn(new data.NoSuchDatabase("Database " + name + " doesnt exist"));
                                    });
                                } else {
                                    params.onerror = __bind(replace(fn));
                                    var a = event.oldVersion > Math.pow(2, 62) ? 0 : event.oldVersion;
                                    f(a / 10, params, fn, request);
                                }
                            }, fn), request.onsuccess = __bind(function() {
                                if (params = null, db = request.result, options.push(d), buffer) write(); else if (db.objectStoreNames.length > 0) try {
                                    get(key, db.transaction(lambda(db.objectStoreNames), type));
                                } catch (prop) {}
                                db.onversionchange = __bind(function(data) {
                                    d._vcFired = !0, d.on("versionchange").fire(data);
                                }), collection || onUpdate(function(t) {
                                    if (t.indexOf(prop) === -1) return t.push(prop);
                                }), callback();
                            }, fn);
                        }) ]).then(function() {
                            return create.vip(d.on.ready.fire);
                        }).then(function() {
                            return a = !1, d;
                        }).catch(function(err) {
                            try {
                                params && params.abort();
                            } catch (err) {}
                            return a = !1, d.close(), error = err, reject(error, event);
                        }).finally(function() {
                            loading = !0, cb();
                        });
                    }, this.close = function() {
                        var i = options.indexOf(d);
                        if (i >= 0 && options.splice(i, 1), db) {
                            try {
                                db.close();
                            } catch (i) {}
                            db = null;
                        }
                        k = !1, error = new data.DatabaseClosed(), a && end(error), index = new add(function(e) {
                            x = e;
                        }), _len2 = new add(function(e, t) {
                            end = t;
                        });
                    }, this.delete = function() {
                        var url = arguments.length > 0;
                        return new add(function(callback, element) {
                            function next() {
                                d.close();
                                var deleteRequest = args.deleteDatabase(name);
                                deleteRequest.onsuccess = __bind(function() {
                                    collection || onUpdate(function(t) {
                                        var i = t.indexOf(name);
                                        if (i >= 0) return t.splice(i, 1);
                                    }), callback();
                                }), deleteRequest.onerror = __bind(replace(element)), deleteRequest.onblocked = dispatch;
                            }
                            if (url) throw new data.InvalidArgument("Arguments not allowed in db.delete()");
                            a ? index.then(next) : next();
                        }).uncaught(event);
                    }, this.backendDB = function() {
                        return db;
                    }, this.isOpen = function() {
                        return null !== db;
                    }, this.hasFailed = function() {
                        return null !== error;
                    }, this.dynamicallyOpened = function() {
                        return buffer;
                    }, this.name = name, exists(this, "tables", {
                        get: function() {
                            return push(templates).map(function(name) {
                                return templates[name];
                            });
                        }
                    }), this.on = run(this, "error", "populate", "blocked", "versionchange", {
                        ready: [ invoke, undef ]
                    }), this.on.ready.subscribe = min(this.on.ready.subscribe, function(val) {
                        return function(i, address) {
                            create.vip(function() {
                                val(i), address || val(function name() {
                                    d.on.ready.unsubscribe(i), d.on.ready.unsubscribe(name);
                                });
                            });
                        };
                    }), $timeout(function() {
                        d.on("populate").fire(d._createTransaction(result, i, key)), d.on("error").fire(new Error());
                    }), this.transaction = function(name, opts, fn) {
                        function test(f) {
                            var root = obj;
                            f(add.resolve().then(function() {
                                return extend(function() {
                                    obj.transless = obj.transless || root;
                                    var p = d._createTransaction(name, array, key, args);
                                    obj.trans = p, args ? p.idbtrans = args.idbtrans : p.create();
                                    var i = array.map(function(i) {
                                        return p.tables[i];
                                    });
                                    i.push(p);
                                    var b;
                                    return add.follow(function() {
                                        if (b = fn.apply(p, i)) if ("function" == typeof b.next && "function" == typeof b.throw) b = validate(b); else if ("function" == typeof b.then && !callback(b, "_PSD")) throw new data.IncompatiblePromise("Incompatible Promise returned from transaction scope (read more at http://tinyurl.com/znyqjqc). Transaction scope: " + fn.toString());
                                    }).uncaught(event).then(function() {
                                        return args && p._resolve(), p._completion;
                                    }).then(function() {
                                        return b;
                                    }).catch(function(err) {
                                        return p._reject(err), reject(err);
                                    });
                                });
                            }));
                        }
                        var i = arguments.length;
                        if (i < 2) throw new data.InvalidArgument("Too few arguments");
                        for (var res = new Array(i - 1); --i; ) res[i - 1] = arguments[i];
                        fn = res.pop();
                        var deps = wrap(res), args = obj.trans;
                        args && args.db === d && name.indexOf("!") === -1 || (args = null);
                        var ix = name.indexOf("?") !== -1;
                        name = name.replace("!", "").replace("?", "");
                        try {
                            var array = deps.map(function(obj) {
                                var val = obj instanceof Element ? obj.name : obj;
                                if ("string" != typeof val) throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                                return val;
                            });
                            if ("r" == name || name == type) name = type; else {
                                if ("rw" != name && name != result) throw new data.InvalidArgument("Invalid transaction mode: " + name);
                                name = result;
                            }
                            if (args) {
                                if (args.mode === type && name === result) {
                                    if (!ix) throw new data.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                                    args = null;
                                }
                                args && array.forEach(function(doc) {
                                    if (!callback(args.tables, doc)) {
                                        if (!ix) throw new data.SubTransaction("Table " + doc + " not included in parent transaction.");
                                        args = null;
                                    }
                                });
                            }
                        } catch (name) {
                            return args ? args._promise(null, function(session, callback) {
                                callback(name);
                            }) : reject(name, event);
                        }
                        return args ? args._promise(name, test, "lock") : d._whenReady(test);
                    }, this.table = function(name) {
                        if (list && buffer) return new Application(name);
                        if (!callback(templates, name)) throw new data.InvalidTable("Table " + name + " does not exist");
                        return templates[name];
                    }, describe(Element.prototype, {
                        _trans: function(name, data, timestamp) {
                            var user = obj.trans;
                            return user && user.db === d ? user._promise(name, data, timestamp) : on(name, [ this.name ], data);
                        },
                        _idbstore: function(name, callback, options) {
                            function data(err, res, status) {
                                callback(err, res, status.idbtrans.objectStore(table), status);
                            }
                            if (list) return new add(callback);
                            var el = obj.trans, table = this.name;
                            return el && el.db === d ? el._promise(name, data, options) : on(name, [ this.name ], data);
                        },
                        get: function(key, callback) {
                            var that = this;
                            return this._idbstore(type, function(done, record, arr) {
                                list && done(that.schema.instanceTemplate);
                                var request = arr.get(key);
                                request.onerror = replace(record), request.onsuccess = function() {
                                    done(that.hook.reading.fire(request.result));
                                };
                            }).then(callback);
                        },
                        where: function(o) {
                            return new item(this, o);
                        },
                        count: function(_array) {
                            return this.toCollection().count(_array);
                        },
                        offset: function(el) {
                            return this.toCollection().offset(el);
                        },
                        limit: function(elm) {
                            return this.toCollection().limit(elm);
                        },
                        reverse: function() {
                            return this.toCollection().reverse();
                        },
                        filter: function(node) {
                            return this.toCollection().and(node);
                        },
                        each: function(fn) {
                            return this.toCollection().each(fn);
                        },
                        toArray: function(callback) {
                            return this.toCollection().toArray(callback);
                        },
                        orderBy: function(field) {
                            return new this._collClass(new item(this, field));
                        },
                        toCollection: function() {
                            return new this._collClass(new item(this));
                        },
                        mapToClass: function(parent, var_args) {
                            this.schema.mappedClass = parent;
                            var obj = Object.create(parent.prototype);
                            var_args && some(obj, var_args), this.schema.instanceTemplate = obj;
                            var func = function(b) {
                                if (!b) return b;
                                var a = Object.create(parent.prototype);
                                for (var p in b) callback(b, p) && (a[p] = b[p]);
                                return a;
                            };
                            return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), 
                            this.schema.readHook = func, this.hook("reading", func), parent;
                        },
                        defineClass: function(obj) {
                            return this.mapToClass(create.defineClass(obj), obj);
                        }
                    }), isFunction(Application).from(Element).extend({
                        bulkDelete: function(nodes) {
                            return this.hook.deleting.fire === undef ? this._idbstore(result, function(x, y, index, i) {
                                x(call(index, i, nodes, !1, undef));
                            }) : this.where(":id").anyOf(nodes).delete().then(function() {});
                        },
                        bulkPut: function(arr, dest) {
                            var that = this;
                            return this._idbstore(result, function(callback, done, value) {
                                if (!value.keyPath && !that.schema.primKey.auto && !dest) throw new data.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
                                if (value.keyPath && dest) throw new data.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                                if (dest && dest.length !== arr.length) throw new data.InvalidArgument("Arguments objects and keys must have the same length");
                                if (0 === arr.length) return callback();
                                var args, count, fn = function(err) {
                                    0 === result.length ? callback(err) : done(new listener(that.name + ".bulkPut(): " + result.length + " of " + len + " operations failed", result));
                                }, result = [], len = arr.length, _j = that;
                                if (that.hook.creating.fire === undef && that.hook.updating.fire === undef) {
                                    count = bind(result);
                                    for (var i = 0, e = arr.length; i < e; ++i) args = dest ? value.put(arr[i], dest[i]) : value.put(arr[i]), 
                                    args.onerror = count;
                                    args.onerror = bind(result, fn), args.onsuccess = then(fn);
                                } else {
                                    var array = dest || value.keyPath && arr.map(function(data) {
                                        return set(data, value.keyPath);
                                    }), obj = array && find(array, function(key, i) {
                                        return null != key && [ key, arr[i] ];
                                    }), c = array ? _j.where(":id").anyOf(array.filter(function(value) {
                                        return null != value;
                                    })).modify(function() {
                                        this.value = obj[this.primKey], obj[this.primKey] = null;
                                    }).catch(err, function(e) {
                                        result = e.failures;
                                    }).then(function() {
                                        for (var hash = [], k = dest && [], i = array.length - 1; i >= 0; --i) {
                                            var prop = array[i];
                                            (null == prop || obj[prop]) && (hash.push(arr[i]), dest && k.push(prop), null != prop && (obj[prop] = null));
                                        }
                                        return hash.reverse(), dest && k.reverse(), _j.bulkAdd(hash, k);
                                    }).then(function(response) {
                                        var body = array[array.length - 1];
                                        return null != body ? body : response;
                                    }) : _j.bulkAdd(arr);
                                    c.then(fn).catch(listener, function(data) {
                                        result = result.concat(data.failures), fn();
                                    }).catch(done);
                                }
                            }, "locked");
                        },
                        bulkAdd: function(items, value) {
                            var _this = this, func = this.hook.creating.fire;
                            return this._idbstore(result, function(callback, done, item, e) {
                                function fn(err) {
                                    0 === n.length ? callback(err) : done(new listener(_this.name + ".bulkAdd(): " + n.length + " of " + count + " operations failed", n));
                                }
                                if (!item.keyPath && !_this.schema.primKey.auto && !value) throw new data.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
                                if (item.keyPath && value) throw new data.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                                if (value && value.length !== items.length) throw new data.InvalidArgument("Arguments objects and keys must have the same length");
                                if (0 === items.length) return callback();
                                var that, end, current, n = [], count = items.length;
                                if (func !== undef) {
                                    var element, msg = item.keyPath;
                                    end = bind(n, null, !0), current = map(null), each(function() {
                                        for (var index = 0, length = items.length; index < length; ++index) {
                                            element = {
                                                onerror: null,
                                                onsuccess: null
                                            };
                                            var o = value && value[index], a = items[index], i = value ? o : msg ? set(a, msg) : void 0, c = func.call(element, i, a, e);
                                            null == i && null != c && (msg ? (a = clone(a), log(a, msg, c)) : o = c), that = null != o ? item.add(a, o) : item.add(a), 
                                            that._hookCtx = element, index < length - 1 && (that.onerror = end, element.onsuccess && (that.onsuccess = current));
                                        }
                                    }, function(event) {
                                        throw element.onerror && element.onerror(event), event;
                                    }), that.onerror = bind(n, fn, !0), that.onsuccess = map(fn);
                                } else {
                                    end = bind(n);
                                    for (var i = 0, len = items.length; i < len; ++i) that = value ? item.add(items[i], value[i]) : item.add(items[i]), 
                                    that.onerror = end;
                                    that.onerror = bind(n, fn), that.onsuccess = then(fn);
                                }
                            });
                        },
                        add: function(a, b) {
                            var handler = this.hook.creating.fire;
                            return this._idbstore(result, function(fn, id, options, i) {
                                var callback = {
                                    onsuccess: null,
                                    onerror: null
                                };
                                if (handler !== undef) {
                                    var element = null != b ? b : options.keyPath ? set(e, options.keyPath) : void 0, result = handler.call(callback, element, e, i);
                                    null == element && null != result && (options.keyPath ? log(e, options.keyPath, result) : b = result);
                                }
                                try {
                                    var p = null != b ? options.add(e, b) : options.add(e);
                                    p._hookCtx = callback, p.onerror = update(id), p.onsuccess = map(function(err) {
                                        var obj = options.keyPath;
                                        obj && log(e, obj, err), fn(err);
                                    });
                                } catch (e) {
                                    throw callback.onerror && callback.onerror(e), e;
                                }
                            });
                        },
                        put: function(value, key) {
                            var args = this, idx = this.hook.creating.fire, obj = this.hook.updating.fire;
                            return idx !== undef || obj !== undef ? this._trans(result, function(r, k, headers) {
                                var result = void 0 !== key ? key : args.schema.primKey.keyPath && set(value, args.schema.primKey.keyPath);
                                null == result ? headers.tables[args.name].add(value).then(r, k) : (headers._lock(), 
                                value = clone(value), headers.tables[args.name].where(":id").equals(result).modify(function() {
                                    this.value = value;
                                }).then(function(exists) {
                                    return 0 === exists ? headers.tables[args.name].add(value, key) : result;
                                }).finally(function() {
                                    headers._unlock();
                                }).then(r, k));
                            }) : this._idbstore(result, function(callback, err, store) {
                                var result = void 0 !== key ? store.put(value, key) : store.put(value);
                                result.onerror = replace(err), result.onsuccess = function(e) {
                                    var type = store.keyPath;
                                    type && log(value, type, e.target.result), callback(result.result);
                                };
                            });
                        },
                        "delete": function(url) {
                            return this.hook.deleting.subscribers.length ? this.where(":id").equals(url).delete() : this._idbstore(result, function(callback, v, rest) {
                                var req = rest.delete(url);
                                req.onerror = replace(v), req.onsuccess = function() {
                                    callback(req.result);
                                };
                            });
                        },
                        clear: function() {
                            return this.hook.deleting.subscribers.length ? this.toCollection().delete() : this._idbstore(result, function(callback, v, t) {
                                var req = t.clear();
                                req.onerror = replace(v), req.onsuccess = function() {
                                    callback(req.result);
                                };
                            });
                        },
                        update: function(ret, obj) {
                            if ("object" != typeof obj || isArray(obj)) throw new data.InvalidArgument("Modifications must be an object.");
                            if ("object" != typeof ret || isArray(ret)) return this.where(":id").equals(ret).modify(obj);
                            push(obj).forEach(function(name) {
                                log(ret, name, obj[name]);
                            });
                            var value = set(ret, this.schema.primKey.keyPath);
                            return void 0 === value ? reject(new data.InvalidArgument("Given object does not contain its primary key"), event) : this.where(":id").equals(value).modify(obj);
                        }
                    }), describe(tick.prototype, {
                        _lock: function() {
                            return success(!obj.global), ++this._reculock, 1 !== this._reculock || obj.global || (obj.lockOwnerFor = this), 
                            this;
                        },
                        _unlock: function() {
                            if (success(!obj.global), 0 === --this._reculock) for (obj.global || (obj.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked(); ) {
                                var f = this._blockedFuncs.shift();
                                try {
                                    f();
                                } catch (f) {}
                            }
                            return this;
                        },
                        _locked: function() {
                            return this._reculock && obj.lockOwnerFor !== this;
                        },
                        create: function(req) {
                            var collection = this;
                            if (success(!this.idbtrans), !req && !db) switch (error && error.name) {
                              case "DatabaseClosedError":
                                throw new data.DatabaseClosed(error);

                              case "MissingAPIError":
                                throw new data.MissingAPI(error.message, error);

                              default:
                                throw new data.OpenFailed(error);
                            }
                            if (!this.active) throw new data.TransactionInactive();
                            return success(null === this._completion._state), req = this.idbtrans = req || db.transaction(lambda(this.storeNames), this.mode), 
                            req.onerror = __bind(function(evt) {
                                stop(evt), collection._reject(req.error);
                            }), req.onabort = __bind(function(event) {
                                stop(event), collection.active && collection._reject(new data.Abort()), collection.active = !1, 
                                collection.on("abort").fire(event);
                            }), req.oncomplete = __bind(function() {
                                collection.active = !1, collection._resolve();
                            }), this;
                        },
                        _promise: function(e, t, d) {
                            var that = this;
                            return extend(function() {
                                var state;
                                return that._locked() ? state = new add(function(meta, params) {
                                    that._blockedFuncs.push(function() {
                                        that._promise(e, t, d).then(meta, params);
                                    });
                                }) : (state = that.active ? new add(function(str, options) {
                                    if (e === result && that.mode !== result) throw new data.ReadOnly("Transaction is readonly");
                                    !that.idbtrans && e && that.create(), d && that._lock(), t(str, options, that);
                                }) : reject(new data.TransactionInactive()), that.active && d && state.finally(function() {
                                    that._unlock();
                                })), state._lib = !0, state.uncaught(event);
                            });
                        },
                        abort: function() {
                            this.active && this._reject(new data.Abort()), this.active = !1;
                        },
                        tables: {
                            get: function() {
                                return this._tables ? this._tables : this._tables = find(this.storeNames, function(type) {
                                    return [ type, templates[type] ];
                                });
                            }
                        },
                        complete: function(cb) {
                            return this.on("complete", cb);
                        },
                        error: function(fail) {
                            return this.on("error", fail);
                        },
                        table: function(name) {
                            if (this.storeNames.indexOf(name) === -1) throw new data.InvalidTable("Table " + name + " not in transaction");
                            return templates[name];
                        }
                    }), describe(item.prototype, function() {
                        function val(e, options, HTMLDocument) {
                            var data = e instanceof item ? new e._ctx.collClass(e) : e;
                            return data._ctx.error = HTMLDocument ? new HTMLDocument(options) : new TypeError(options), 
                            data;
                        }
                        function bind(engine) {
                            return new engine._ctx.collClass(engine, function() {
                                return util.only("");
                            }).limit(0);
                        }
                        function callback(NEXT_TRANSITION) {
                            return "next" === NEXT_TRANSITION ? function(item) {
                                return item.toUpperCase();
                            } : function(item) {
                                return item.toLowerCase();
                            };
                        }
                        function next(NEXT_TRANSITION) {
                            return "next" === NEXT_TRANSITION ? function(item) {
                                return item.toLowerCase();
                            } : function(item) {
                                return item.toUpperCase();
                            };
                        }
                        function call(a, matches, result, b, compare, expr) {
                            for (var len = Math.min(a.length, b.length), i = -1, k = 0; k < len; ++k) {
                                var v = matches[k];
                                if (v !== b[k]) return compare(a[k], result[k]) < 0 ? a.substr(0, k) + result[k] + result.substr(k + 1) : compare(a[k], b[k]) < 0 ? a.substr(0, k) + b[k] + result.substr(k + 1) : i >= 0 ? a.substr(0, i) + matches[i] + result.substr(i + 1) : null;
                                compare(a[k], v) < 0 && (i = k);
                            }
                            return len < b.length && "next" === expr ? a + result.substr(a.length) : len < a.length && "prev" === expr ? a.substr(0, result.length) : i < 0 ? null : a.substr(0, i) + b[i] + result.substr(i + 1);
                        }
                        function test(c, add, topic, name) {
                            function done(value) {
                                a = callback(value), cb = next(value), fn = "next" === value ? current : binary;
                                var e = topic.map(function(e) {
                                    return {
                                        lower: cb(e),
                                        upper: a(e)
                                    };
                                }).sort(function(x, y) {
                                    return fn(x.lower, y.lower);
                                });
                                args = e.map(function(v) {
                                    return v.upper;
                                }), items = e.map(function(v) {
                                    return v.lower;
                                }), k = value, p = "next" === value ? "" : name;
                            }
                            var a, cb, fn, args, items, k, p, count = topic.length;
                            if (!topic.every(function(a) {
                                return "string" == typeof a;
                            })) return val(c, text);
                            done("next");
                            var tree = new c._ctx.collClass(c, function() {
                                return util.bound(args[0], items[count - 1] + name);
                            });
                            tree._ondirectionchange = function(e) {
                                done(e);
                            };
                            var start = 0;
                            return tree._addAlgorithm(function(e, done, conn) {
                                var elem = e.key;
                                if ("string" != typeof elem) return !1;
                                var name = cb(elem);
                                if (add(name, items, start)) return !0;
                                for (var a = null, i = start; i < count; ++i) {
                                    var b = call(elem, name, args[i], items[i], fn, k);
                                    null === b && null === a ? start = i + 1 : (null === a || fn(a, b) > 0) && (a = b);
                                }
                                return done(null !== a ? function() {
                                    e.continue(a + p);
                                } : conn), !1;
                            }), tree;
                        }
                        return {
                            between: function(x, y, w, h) {
                                w = w !== !1, h = h === !0;
                                try {
                                    return done(x, y) > 0 || 0 === done(x, y) && (w || h) && (!w || !h) ? success(this) : new this._ctx.collClass(this, function() {
                                        return util.bound(x, y, !w, !h);
                                    });
                                } catch (success) {
                                    return val(this, req);
                                }
                            },
                            equals: function(obj2) {
                                return new this._ctx.collClass(this, function() {
                                    return util.only(obj2);
                                });
                            },
                            above: function(target) {
                                return new this._ctx.collClass(this, function() {
                                    return util.lowerBound(target, !0);
                                });
                            },
                            aboveOrEqual: function(value) {
                                return new this._ctx.collClass(this, function() {
                                    return util.lowerBound(value);
                                });
                            },
                            below: function(target) {
                                return new this._ctx.collClass(this, function() {
                                    return util.upperBound(target, !0);
                                });
                            },
                            belowOrEqual: function(object) {
                                return new this._ctx.collClass(this, function() {
                                    return util.upperBound(object);
                                });
                            },
                            startsWith: function(v) {
                                return "string" != typeof v ? val(this, text) : this.between(v, v + message, !0, !0);
                            },
                            startsWithIgnoreCase: function(value) {
                                return "" === value ? this.startsWith(value) : test(this, function(done, key) {
                                    return 0 === done.indexOf(key[0]);
                                }, [ value ], message);
                            },
                            equalsIgnoreCase: function(left) {
                                return test(this, function(t, a) {
                                    return t === a[0];
                                }, [ left ], "");
                            },
                            anyOfIgnoreCase: function() {
                                var callback = remove.apply(id, arguments);
                                return 0 === callback.length ? bind(this) : test(this, function(value, result) {
                                    return result.indexOf(value) !== -1;
                                }, callback, "");
                            },
                            startsWithAnyOfIgnoreCase: function() {
                                var p = remove.apply(id, arguments);
                                return 0 === p.length ? bind(this) : test(this, function(done, msg) {
                                    return msg.some(function(prefix) {
                                        return 0 === done.indexOf(prefix);
                                    });
                                }, p, message);
                            },
                            anyOf: function() {
                                var obj = remove.apply(id, arguments), callback = comparator;
                                try {
                                    obj.sort(callback);
                                } catch (next) {
                                    return val(this, req);
                                }
                                if (0 === obj.length) return next(this);
                                var tree = new this._ctx.collClass(this, function() {
                                    return util.bound(obj[0], obj[obj.length - 1]);
                                });
                                tree._ondirectionchange = function(implementation) {
                                    callback = "next" === implementation ? comparator : compare, obj.sort(callback);
                                };
                                var i = 0;
                                return tree._addAlgorithm(function(e, f, x) {
                                    for (var k = e.key; callback(k, obj[i]) > 0; ) if (++i, i === obj.length) return f(x), 
                                    !1;
                                    return 0 === callback(k, obj[i]) || (f(function() {
                                        e.continue(obj[i]);
                                    }), !1);
                                }), tree;
                            },
                            notEqual: function(message) {
                                return this.inAnyRange([ [ -(1 / 0), message ], [ message, code ] ], {
                                    includeLowers: !1,
                                    includeUppers: !1
                                });
                            },
                            noneOf: function() {
                                var array = remove.apply(id, arguments);
                                if (0 === array.length) return new this._ctx.collClass(this);
                                try {
                                    array.sort(comparator);
                                } catch (array) {
                                    return val(this, req);
                                }
                                var result = array.reduce(function(x, y) {
                                    return x ? x.concat([ [ x[x.length - 1][1], y ] ]) : [ [ -(1 / 0), y ] ];
                                }, null);
                                return result.push([ array[array.length - 1], code ]), this.inAnyRange(result, {
                                    includeLowers: !1,
                                    includeUppers: !1
                                });
                            },
                            inAnyRange: function(array, item) {
                                function add(params, data) {
                                    for (var i = 0, e = params.length; i < e; ++i) {
                                        var values = params[i];
                                        if (done(data[0], values[1]) < 0 && done(data[1], values[0]) > 0) {
                                            values[0] = render(values[0], data[0]), values[1] = translate(values[1], data[1]);
                                            break;
                                        }
                                    }
                                    return i === e && params.push(data), params;
                                }
                                function write(expected, array) {
                                    return callback(expected[0], array[0]);
                                }
                                function _f(d) {
                                    return !f(d) && !j(d);
                                }
                                var order = this._ctx;
                                if (0 === array.length) return next(this);
                                if (!array.every(function(a) {
                                    return void 0 !== a[0] && void 0 !== a[1] && comparator(a[0], a[1]) <= 0;
                                })) return val(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", data.InvalidArgument);
                                var args, method = !item || item.includeLowers !== !1, params = item && item.includeUppers === !0, callback = comparator;
                                try {
                                    args = array.reduce(add, []), args.sort(write);
                                } catch (next) {
                                    return val(this, req);
                                }
                                var i = 0, f = params ? function(item) {
                                    return comparator(item, args[i][1]) > 0;
                                } : function(item) {
                                    return comparator(item, args[i][1]) >= 0;
                                }, j = method ? function(item) {
                                    return compare(item, args[i][0]) > 0;
                                } : function(item) {
                                    return compare(item, args[i][0]) >= 0;
                                }, h = f, el = new order.collClass(this, function() {
                                    return util.bound(args[0][0], args[args.length - 1][1], !method, !params);
                                });
                                return el._ondirectionchange = function(events) {
                                    "next" === events ? (h = f, callback = comparator) : (h = j, callback = compare), 
                                    args.sort(write);
                                }, el._addAlgorithm(function(o, fn, err) {
                                    for (var x = o.key; h(x); ) if (++i, i === args.length) return fn(err), !1;
                                    return !!_f(x) || 0 !== done(x, args[i][1]) && 0 !== done(x, args[i][0]) && (fn(function() {
                                        callback === comparator ? o.continue(args[i][0]) : o.continue(args[i][1]);
                                    }), !1);
                                }), el;
                            },
                            startsWithAnyOf: function() {
                                var array = remove.apply(id, arguments);
                                return array.every(function(a) {
                                    return "string" == typeof a;
                                }) ? 0 === array.length ? bind(this) : this.inAnyRange(array.map(function(category) {
                                    return [ category, category + message ];
                                })) : val(this, "startsWithAnyOf() only works with strings");
                            }
                        };
                    }), describe(reset.prototype, function() {
                        function func(options, args) {
                            options.filter = concat(options.filter, args);
                        }
                        function test(input, done, t) {
                            var callback = input.replayFilter;
                            input.replayFilter = callback ? function() {
                                return concat(callback(), done());
                            } : done, input.justLimit = t && !callback;
                        }
                        function push(o, data) {
                            o.isMatch = concat(o.isMatch, data);
                        }
                        function create(opts, element) {
                            if (opts.isPrimKey) return element;
                            var handler = opts.table.schema.idxByName[opts.index];
                            if (!handler) throw new data.Schema("KeyPath " + opts.index + " on object store " + element.name + " is not indexed");
                            return element.index(handler.name);
                        }
                        function get(opts, elem) {
                            var store = create(opts, elem);
                            return opts.keysOnly && "openKeyCursor" in store ? store.openKeyCursor(opts.range || null, opts.dir + opts.unique) : store.openCursor(opts.range || null, opts.dir + opts.unique);
                        }
                        function call(options, done, obj, context, key) {
                            var div = options.replayFilter ? concat(options.filter, options.replayFilter()) : options.filter;
                            options.or ? function() {
                                function data() {
                                    2 === ++count && obj();
                                }
                                function next(e, n, v) {
                                    if (!div || div(n, v, data, context)) {
                                        var id = n.primaryKey.toString();
                                        callback(element, id) || (element[id] = !0, done(e, n, v));
                                    }
                                }
                                var element = {}, count = 0;
                                options.or._iterate(next, data, context, key), load(get(options, key), options.algorithm, next, data, context, !options.keysOnly && options.valueMapper);
                            }() : load(get(options, key), concat(options.algorithm, div), done, obj, context, !options.keysOnly && options.valueMapper);
                        }
                        function f(p) {
                            return p.table.schema.instanceTemplate;
                        }
                        return {
                            _read: function(params, callback) {
                                var data = this._ctx;
                                return data.error ? data.table._trans(null, function(results, done) {
                                    done(data.error);
                                }) : data.table._idbstore(type, params).then(callback);
                            },
                            _write: function(name) {
                                var p = this._ctx;
                                return p.error ? p.table._trans(null, function(session, callback) {
                                    callback(p.error);
                                }) : p.table._idbstore(result, name, "locked");
                            },
                            _addAlgorithm: function(args) {
                                var data = this._ctx;
                                data.algorithm = concat(data.algorithm, args);
                            },
                            _iterate: function(x, y, width, height) {
                                return call(this._ctx, x, y, width, height);
                            },
                            clone: function(c) {
                                var a = Object.create(this.constructor.prototype), p = Object.create(this._ctx);
                                return c && cb(p, c), a._ctx = p, a;
                            },
                            raw: function() {
                                return this._ctx.valueMapper = null, this;
                            },
                            each: function(callback) {
                                var opts = this._ctx;
                                if (list) {
                                    var key = f(opts), value = opts.table.schema.primKey.keyPath, index = set(key, opts.index ? opts.table.schema.idxByName[opts.index].keyPath : value), result = set(key, value);
                                    callback(key, {
                                        key: index,
                                        primaryKey: result
                                    });
                                }
                                return this._read(function(value, key, list) {
                                    call(opts, callback, value, key, list);
                                });
                            },
                            count: function(context) {
                                if (list) return add.resolve(0).then(context);
                                var node = this._ctx;
                                if (destroy(node, !0)) return this._read(function(callback, binding, data) {
                                    var source = create(node, data), cursor = node.range ? source.count(node.range) : source.count();
                                    cursor.onerror = replace(binding), cursor.onsuccess = function(event) {
                                        callback(Math.min(event.target.result, node.limit));
                                    };
                                }, context);
                                var counter = 0;
                                return this._read(function(cb, i, res) {
                                    call(node, function() {
                                        return ++counter, !1;
                                    }, function() {
                                        cb(counter);
                                    }, i, res);
                                }, context);
                            },
                            sortBy: function(prop, value) {
                                function add(obj, i) {
                                    return i ? add(obj[parts[i]], i - 1) : obj[p];
                                }
                                function sortBySpecificity(loc, box) {
                                    var x = add(loc, v), y = add(box, v);
                                    return x < y ? -a : x > y ? a : 0;
                                }
                                var parts = prop.split(".").reverse(), p = parts[0], v = parts.length - 1, a = "next" === this._ctx.dir ? 1 : -1;
                                return this.toArray(function(xs) {
                                    return xs.sort(sortBySpecificity);
                                }).then(value);
                            },
                            toArray: function(context) {
                                var options = this._ctx;
                                return this._read(function(callback, i, obj) {
                                    if (list && callback([ f(options) ]), children && "next" === options.dir && destroy(options, !0) && options.limit > 0) {
                                        var el = options.table.hook.reading.fire, table = create(options, obj), a = options.limit < 1 / 0 ? table.getAll(options.range, options.limit) : table.getAll(options.range);
                                        a.onerror = replace(i), a.onsuccess = el === radius ? then(callback) : __bind(then(function(els) {
                                            callback(els.map(el));
                                        }));
                                    } else {
                                        var events = [];
                                        call(options, function(e) {
                                            events.push(e);
                                        }, function() {
                                            callback(events);
                                        }, i, obj);
                                    }
                                }, context);
                            },
                            offset: function(count) {
                                var item = this._ctx;
                                return count <= 0 ? this : (item.offset += count, destroy(item) ? test(item, function() {
                                    var i = count;
                                    return function(b, done) {
                                        return 0 === i || (1 === i ? (--i, !1) : (done(function() {
                                            b.advance(i), i = 0;
                                        }), !1));
                                    };
                                }) : test(item, function() {
                                    var i = count;
                                    return function() {
                                        return --i < 0;
                                    };
                                }), this);
                            },
                            limit: function(target) {
                                return this._ctx.limit = Math.min(this._ctx.limit, target), test(this._ctx, function() {
                                    var t = target;
                                    return function(name, reset, options) {
                                        return --t <= 0 && reset(options), t >= 0;
                                    };
                                }, !0), this;
                            },
                            until: function(done, array) {
                                var data = this._ctx;
                                return list && done(f(data)), func(this._ctx, function(error, callback, data) {
                                    return !done(error.value) || (callback(data), array);
                                }), this;
                            },
                            first: function(callback) {
                                return this.limit(1).toArray(function(arr) {
                                    return arr[0];
                                }).then(callback);
                            },
                            last: function(n) {
                                return this.reverse().first(n);
                            },
                            filter: function(callback) {
                                return list && callback(f(this._ctx)), func(this._ctx, function(res) {
                                    return callback(res.value);
                                }), push(this._ctx, callback), this;
                            },
                            and: function(fn) {
                                return this.filter(fn);
                            },
                            or: function(args) {
                                return new item(this._ctx.table, args, this);
                            },
                            reverse: function() {
                                return this._ctx.dir = "prev" === this._ctx.dir ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), 
                                this;
                            },
                            desc: function() {
                                return this.reverse();
                            },
                            eachKey: function(callback) {
                                var len = this._ctx;
                                return len.keysOnly = !len.isMatch, this.each(function(i, v) {
                                    callback(v.key, v);
                                });
                            },
                            eachUniqueKey: function(data) {
                                return this._ctx.unique = "unique", this.eachKey(data);
                            },
                            eachPrimaryKey: function(callback) {
                                var order = this._ctx;
                                return order.keysOnly = !order.isMatch, this.each(function(i, el) {
                                    callback(el.primaryKey, el);
                                });
                            },
                            keys: function(callback) {
                                var _j = this._ctx;
                                _j.keysOnly = !_j.isMatch;
                                var a = [];
                                return this.each(function(i, el) {
                                    a.push(el.key);
                                }).then(function() {
                                    return a;
                                }).then(callback);
                            },
                            primaryKeys: function(key) {
                                var options = this._ctx;
                                if (children && "next" === options.dir && destroy(options, !0) && options.limit > 0) return this._read(function(i, url, data) {
                                    var p = create(options, data), a = options.limit < 1 / 0 ? p.getAllKeys(options.range, options.limit) : p.getAllKeys(options.range);
                                    a.onerror = replace(url), a.onsuccess = then(i);
                                }).then(key);
                                options.keysOnly = !options.isMatch;
                                var results = [];
                                return this.each(function(i, el) {
                                    results.push(el.primaryKey);
                                }).then(function() {
                                    return results;
                                }).then(key);
                            },
                            uniqueKeys: function(pattern) {
                                return this._ctx.unique = "unique", this.keys(pattern);
                            },
                            firstKey: function(callback) {
                                return this.limit(1).keys(function(values) {
                                    return values[0];
                                }).then(callback);
                            },
                            lastKey: function(path) {
                                return this.reverse().firstKey(path);
                            },
                            distinct: function() {
                                var o = this._ctx, count = o.index && o.table.schema.idxByName[o.index];
                                if (!count || !count.multi) return this;
                                var index = {};
                                return func(this._ctx, function(error) {
                                    var e = error.primaryKey.toString(), end = callback(index, e);
                                    return index[e] = !0, !end;
                                }), this;
                            }
                        };
                    }), isFunction(opts).from(reset).extend({
                        modify: function(a) {
                            var that = this, len = this._ctx, c = len.table.hook, f = c.updating.fire, func = c.deleting.fire;
                            return list && "function" == typeof a && a.call({
                                value: len.table.schema.instanceTemplate
                            }, len.table.schema.instanceTemplate), this._write(function(name, value, capture, options) {
                                function onload(err, cursor) {
                                    function fn(response) {
                                        return context.push(response), h.push(e.primKey), done(), !0;
                                    }
                                    p = cursor.primaryKey;
                                    var e = {
                                        primKey: cursor.primaryKey,
                                        value: err,
                                        onsuccess: null,
                                        onerror: null
                                    };
                                    if (test.call(e, err, e) !== !1) {
                                        var key = !callback(e, "value");
                                        ++i, each(function() {
                                            var request = key ? cursor.delete() : cursor.update(e.value);
                                            request._hookCtx = e, request.onerror = update(fn), request.onsuccess = map(function() {
                                                ++j, done();
                                            });
                                        }, fn);
                                    } else e.onsuccess && e.onsuccess(e.value);
                                }
                                function fn(response) {
                                    return response && (context.push(response), h.push(p)), value(new err("Error modifying one or more objects", context, j, h));
                                }
                                function done() {
                                    k && j + context.length === i && (context.length > 0 ? fn() : name(j));
                                }
                                var test;
                                if ("function" == typeof a) test = f === undef && func === undef ? a : function(name) {
                                    var data = clone(name);
                                    if (a.call(this, name, this) === !1) return !1;
                                    if (callback(this, "value")) {
                                        var j = filter(data, this.value), o = f.call(this, j, this.primKey, data, options);
                                        o && (name = this.value, push(o).forEach(function(key) {
                                            log(name, key, o[key]);
                                        }));
                                    } else func.call(this, this.primKey, name, options);
                                }; else if (f === undef) {
                                    var keys = push(a), len = keys.length;
                                    test = function(value) {
                                        for (var c = !1, i = 0; i < len; ++i) {
                                            var key = keys[i], e = a[key];
                                            set(value, key) !== e && (log(value, key, e), c = !0);
                                        }
                                        return c;
                                    };
                                } else {
                                    var e = a;
                                    a = show(e), test = function(obj) {
                                        var c = !1, b = f.call(this, a, this.primKey, clone(obj), options);
                                        return b && cb(a, b), push(a).forEach(function(d) {
                                            var e = a[d];
                                            set(obj, d) !== e && (log(obj, d, e), c = !0);
                                        }), b && (a = show(e)), c;
                                    };
                                }
                                var i = 0, j = 0, k = !1, context = [], h = [], p = null;
                                that.clone().raw()._iterate(onload, function() {
                                    k = !0, done();
                                }, fn, capture);
                            });
                        },
                        "delete": function() {
                            var that = this, node = this._ctx, length = node.range, error = node.table.hook.deleting.fire, options = error !== undef;
                            if (!options && destroy(node) && (node.isPrimKey && !_ref2 || !length)) return this._write(function(callback, next, tree) {
                                var result = replace(next), req = length ? tree.count(length) : tree.count();
                                req.onerror = result, req.onsuccess = function() {
                                    var file = req.result;
                                    each(function() {
                                        var request = length ? tree.delete(length) : tree.clear();
                                        request.onerror = result, request.onsuccess = function() {
                                            return callback(file);
                                        };
                                    }, function(flagsTypes) {
                                        return next(flagsTypes);
                                    });
                                };
                            });
                            var idx = options ? 2e3 : 1e4;
                            return this._write(function(value, key, a, b) {
                                var i = 0, index = that.clone({
                                    keysOnly: !node.isMatch && !options
                                }).distinct().limit(idx).raw(), result = [], next = function() {
                                    return index.each(options ? function(e, a) {
                                        result.push([ a.primaryKey, a.value ]);
                                    } : function(e, a) {
                                        result.push(a.primaryKey);
                                    }).then(function() {
                                        return options ? result.sort(function(a, b) {
                                            return comparator(a[0], b[0]);
                                        }) : result.sort(comparator), call(a, b, result, options, error);
                                    }).then(function() {
                                        var length = result.length;
                                        return i += length, result = [], length < idx ? i : next();
                                    });
                                };
                                value(next());
                            });
                        }
                    }), cb(this, {
                        Collection: reset,
                        Table: Element,
                        Transaction: tick,
                        Version: User,
                        WhereClause: item,
                        WriteableCollection: opts,
                        WriteableTable: Application
                    }), factory(), value.forEach(function(f) {
                        f(d);
                    });
                }
                function block(fn) {
                    if ("function" == typeof fn) return new fn();
                    if (isArray(fn)) return [ block(fn[0]) ];
                    if (fn && "object" == typeof fn) {
                        var obj = {};
                        return some(obj, fn), obj;
                    }
                    return fn;
                }
                function some(dst, context) {
                    return push(context).forEach(function(key) {
                        var result = block(context[key]);
                        dst[key] = result;
                    }), dst;
                }
                function then(callback) {
                    return function(evt) {
                        callback(evt.target.result);
                    };
                }
                function map(each) {
                    return __bind(function(event) {
                        var x = event.target, fn = x.result, i = x._hookCtx, f = i && i.onsuccess;
                        f && f(fn), each && each(fn);
                    }, each);
                }
                function replace(callback) {
                    return function(evt) {
                        return stop(evt), callback(evt.target.error), !1;
                    };
                }
                function update(next) {
                    return __bind(function(event) {
                        var t = event.target, r = t.error, o = t._hookCtx, u = o && o.onerror;
                        return u && u(r), stop(event), next(r), !1;
                    });
                }
                function stop(event) {
                    event.stopPropagation && event.stopPropagation(), event.preventDefault && event.preventDefault();
                }
                function onUpdate(parse) {
                    var value, store = create.dependencies.localStorage;
                    if (!store) return parse([]);
                    try {
                        value = JSON.parse(store.getItem("Dexie.DatabaseNames") || "[]");
                    } catch (parse) {
                        value = [];
                    }
                    parse(value) && store.setItem("Dexie.DatabaseNames", JSON.stringify(value));
                }
                function validate(instance) {
                    function test(next) {
                        return function(persons) {
                            var r = next(persons), value = r.value;
                            return r.done ? value : value && "function" == typeof value.then ? value.then(callback, args) : isArray(value) ? add.all(value).then(callback, args) : callback(value);
                        };
                    }
                    var done = function(err) {
                        return instance.next(err);
                    }, l = function(msg) {
                        return instance.throw(msg);
                    }, callback = test(done), args = test(l);
                    return test(done)();
                }
                function Plugin(name, a, result, alt, secure, rw, element) {
                    this.name = name, this.keyPath = a, this.unique = result, this.multi = alt, this.auto = secure, 
                    this.compound = rw, this.dotted = element;
                    var data = "string" == typeof a ? a : a && "[" + [].join.call(a, "+") + "]";
                    this.src = (result ? "&" : "") + (alt ? "*" : "") + (secure ? "++" : "") + data;
                }
                function constructor(name, attributes, options, chart) {
                    this.name = name, this.primKey = attributes || new Plugin(), this.indexes = options || [ new Plugin() ], 
                    this.instanceTemplate = chart, this.mappedClass = null, this.idxByName = find(options, function(o) {
                        return [ o.name, o ];
                    });
                }
                function lambda(values) {
                    return 1 === values.length ? values[0] : values;
                }
                function resize(event) {
                    var transitionEnd = event && (event.getDatabaseNames || event.webkitGetDatabaseNames);
                    return transitionEnd && transitionEnd.bind(event);
                }
                var Dropzone = "undefined" != typeof location && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href), Em = function() {
                    return !0;
                }, camelize = !new Error("").stack, push = Object.keys, isArray = Array.isArray, noop = "undefined" != typeof self ? self : "undefined" != typeof window ? window : exports, without = Object.getPrototypeOf, __hasProp = {}.hasOwnProperty, __extends = Object.getOwnPropertyDescriptor, __slice = [].slice, __indexOf = "undefined" != typeof Symbol && Symbol.iterator, serialize = __indexOf ? function(i18n) {
                    var t;
                    return null != i18n && (t = i18n[__indexOf]) && t.apply(i18n);
                } : function() {
                    return null;
                }, id = {}, _concat = [].concat, buffer = [ "Modify", "Bulk", "OpenFailed", "VersionChange", "Schema", "Upgrade", "InvalidTable", "MissingAPI", "NoSuchDatabase", "InvalidArgument", "SubTransaction", "Unsupported", "Internal", "DatabaseClosed", "IncompatiblePromise" ], key = [ "Unknown", "Constraint", "Data", "TransactionInactive", "ReadOnly", "Version", "NotFound", "InvalidState", "InvalidAccess", "Abort", "Timeout", "QuotaExceeded", "Syntax", "DataClone" ], array = buffer.concat(key), store = {
                    VersionChanged: "Database version changed by other database connection",
                    DatabaseClosed: "Database has been closed",
                    Abort: "Transaction aborted",
                    TransactionInactive: "Transaction has already completed or failed"
                };
                isFunction(value).from(Error).extend({
                    stack: {
                        get: function() {
                            return this._stack || (this._stack = this.name + ": " + this.message + parse(this._e, 2));
                        }
                    },
                    toString: function() {
                        return this.name + ": " + this.message;
                    }
                }), isFunction(err).from(value), isFunction(listener).from(value);
                var res = array.reduce(function(p, n) {
                    return p[n] = n + "Error", p;
                }, {}), address = value, data = array.reduce(function(data, id) {
                    function reply(e, statusCode) {
                        this._e = match(), this.name = name, e ? "string" == typeof e ? (this.message = e, 
                        this.inner = statusCode || null) : "object" == typeof e && (this.message = e.name + " " + e.message, 
                        this.inner = e) : (this.message = store[id] || name, this.inner = null);
                    }
                    var name = id + "Error";
                    return isFunction(reply).from(address), data[id] = reply, data;
                }, {});
                data.Syntax = SyntaxError, data.Type = TypeError, data.Range = RangeError;
                var handlers = key.reduce(function(r, key) {
                    return r[key + "Error"] = data[key], r;
                }, {}), e = array.reduce(function(value, i) {
                    return [ "Syntax", "Type", "Range" ].indexOf(i) === -1 && (value[i + "Error"] = data[i]), 
                    value;
                }, {});
                e.ModifyError = err, e.DexieError = value, e.BulkError = listener;
                var i = {}, j = 100, x = 20, y = !1, k = "undefined" == typeof setImmediate ? function() {
                    setTimeout(trigger, 0);
                } : setImmediate.bind(null, trigger), defer = function(callback, t) {
                    len.push([ callback, t ]), h && (k(), h = !1);
                }, a = !0, h = !0, children = [], result = [], left = null, ref = radius, top = {
                    global: !0,
                    ref: 0,
                    unhandleds: [],
                    onunhandled: merge,
                    finalize: function() {
                        this.unhandleds.forEach(function(dest) {
                            try {
                                merge(dest[0], dest[1]);
                            } catch (dest) {}
                        });
                    }
                }, obj = top, len = [], command = 0, callbacks = [];
                describe(add.prototype, {
                    then: function(w, h) {
                        var opts = this, version = new add(function(o, r) {
                            destroy(opts, new Handler(w, h, o, r));
                        });
                        return Dropzone && (!this._prev || null === this._state) && test(version, this), 
                        version;
                    },
                    _then: function(args, callback) {
                        destroy(this, new Handler(null, null, args, callback));
                    },
                    "catch": function(no) {
                        if (1 === arguments.length) return this.then(null, no);
                        var name = arguments[0], next = arguments[1];
                        return "function" == typeof name ? this.then(null, function(err) {
                            return err instanceof name ? next(err) : unload(err);
                        }) : this.then(null, function(err) {
                            return err && err.name === name ? next(err) : unload(err);
                        });
                    },
                    "finally": function(callback) {
                        return this.then(function(exists) {
                            return callback(), exists;
                        }, function(err) {
                            return callback(), unload(err);
                        });
                    },
                    uncaught: function(attrs) {
                        var root = this;
                        return this.onuncatched = fn(this.onuncatched, attrs), this._state === !1 && children.indexOf(this) === -1 && children.some(function(n, i, r) {
                            return n._value === root._value && (r[i] = root);
                        }), this;
                    },
                    stack: {
                        get: function() {
                            if (this._stack) return this._stack;
                            try {
                                y = !0;
                                var res = register(this, [], x), r = res.join("\nFrom previous: ");
                                return null !== this._state && (this._stack = r), r;
                            } finally {
                                y = !1;
                            }
                        }
                    }
                }), describe(add, {
                    all: function() {
                        var options = remove.apply(null, arguments);
                        return new add(function(fn, error) {
                            0 === options.length && fn([]);
                            var n = options.length;
                            options.forEach(function(url, i) {
                                return add.resolve(url).then(function(v) {
                                    options[i] = v, --n || fn(options);
                                }, error);
                            });
                        });
                    },
                    resolve: function(thenable) {
                        return thenable && "function" == typeof thenable.then ? thenable : new add(i, !0, thenable);
                    },
                    reject: unload,
                    race: function() {
                        var args = remove.apply(null, arguments);
                        return new add(function(f, n) {
                            args.map(function(url) {
                                return add.resolve(url).then(f, n);
                            });
                        });
                    },
                    PSD: {
                        get: function() {
                            return obj;
                        },
                        set: function(e) {
                            return obj = e;
                        }
                    },
                    newPSD: extend,
                    usePSD: slice,
                    scheduler: {
                        get: function() {
                            return defer;
                        },
                        set: function(value) {
                            defer = value;
                        }
                    },
                    rejectionMapper: {
                        get: function() {
                            return ref;
                        },
                        set: function(fn) {
                            ref = fn;
                        }
                    },
                    follow: function(next) {
                        return new add(function(data, helpers) {
                            return extend(function(nodes, callback) {
                                var state = obj;
                                state.unhandleds = [], state.onunhandled = callback, state.finalize = call(function() {
                                    var j = this;
                                    init(function() {
                                        0 === j.unhandleds.length ? nodes() : callback(j.unhandleds[0]);
                                    });
                                }, state.finalize), next();
                            }, data, helpers);
                        });
                    },
                    on: run(null, {
                        error: [ fn, capture ]
                    })
                }), timeout(function() {
                    defer = function(fn, args) {
                        setTimeout(function() {
                            fn.apply(null, args);
                        }, 0);
                    };
                });
                var args = "1.4.1", message = String.fromCharCode(65535), code = function() {
                    try {
                        return IDBKeyRange.only([ [] ]), [ [] ];
                    } catch (exception) {
                        return message;
                    }
                }(), req = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", text = "String expected.", options = [], _i = "undefined" != typeof navigator && /(MSIE|Trident|Edge)/.test(navigator.userAgent), _len = _i, _ref2 = _i, _ref3 = function(names) {
                    return !/(dexie\.js|dexie\.min\.js)/.test(names);
                };
                stringify(Dropzone, _ref3);
                var $timeout = function() {}, list = !1, _base = noop.idbModules && noop.idbModules.shimIndexedDB ? noop.idbModules : {};
                return describe(create, e), describe(create, {
                    "delete": function(stopHere) {
                        var _this = new create(stopHere), req = _this.delete();
                        return req.onblocked = function(e) {
                            return _this.on("blocked", e), this;
                        }, req;
                    },
                    exists: function(selector) {
                        return new create(selector).open().then(function(exists) {
                            return exists.close(), !0;
                        }).catch(create.NoSuchDatabaseError, function() {
                            return !1;
                        });
                    },
                    getDatabaseNames: function(callback) {
                        return new add(function(y, val) {
                            var f = resize(indexedDB);
                            if (f) {
                                var r = f();
                                r.onsuccess = function(e) {
                                    y(max(e.target.result, 0));
                                }, r.onerror = replace(val);
                            } else onUpdate(function(t) {
                                return y(t), !1;
                            });
                        }).then(callback);
                    },
                    defineClass: function(methods) {
                        function check(event) {
                            event ? cb(this, event) : list && some(this, methods);
                        }
                        return check;
                    },
                    applyStructure: some,
                    ignoreTransaction: function(assign) {
                        return obj.trans ? slice(obj.transless, assign) : assign();
                    },
                    vip: function(raw) {
                        return extend(function() {
                            return obj.letThrough = !0, raw();
                        });
                    },
                    async: function(str) {
                        return function() {
                            try {
                                var x = validate(compileFn.apply(this, arguments));
                                return x && "function" == typeof x.then ? x : add.resolve(x);
                            } catch (compileFn) {
                                return reject(compileFn);
                            }
                        };
                    },
                    spawn: function(fn, args, scope) {
                        try {
                            var v = validate(fn.apply(scope, args || []));
                            return v && "function" == typeof v.then ? v : add.resolve(v);
                        } catch (fn) {
                            return reject(fn);
                        }
                    },
                    currentTransaction: {
                        get: function() {
                            return obj.trans || null;
                        }
                    },
                    Promise: add,
                    debug: {
                        get: function() {
                            return Dropzone;
                        },
                        set: function(val) {
                            stringify(val, "dexie" === val ? function() {
                                return !0;
                            } : _ref3);
                        }
                    },
                    derive: isFunction,
                    extend: cb,
                    props: describe,
                    override: min,
                    Events: run,
                    events: run,
                    getByKeyPath: set,
                    setByKeyPath: log,
                    delByKeyPath: Timer,
                    shallowClone: show,
                    deepClone: clone,
                    getObjectDiff: filter,
                    asap: check,
                    maxKey: code,
                    addons: [],
                    connections: options,
                    MultiModifyError: data.Modify,
                    errnames: res,
                    IndexSpec: Plugin,
                    TableSchema: constructor,
                    dependencies: {
                        indexedDB: _base.shimIndexedDB || noop.indexedDB || noop.mozIndexedDB || noop.webkitIndexedDB || noop.msIndexedDB,
                        IDBKeyRange: _base.IDBKeyRange || noop.IDBKeyRange || noop.webkitIDBKeyRange
                    },
                    semVer: args,
                    version: args.split(".").map(function(c) {
                        return parseInt(c);
                    }).reduce(function(prev, v, i) {
                        return prev + v / Math.pow(10, 2 * i);
                    }),
                    fakeAutoComplete: $timeout,
                    "default": create
                }), each(function() {
                    create.dependencies.localStorage = null != ("undefined" != typeof chrome && null !== chrome ? chrome.storage : void 0) ? null : noop.localStorage;
                }), add.rejectionMapper = stack, timeout(function() {
                    create.fakeAutoComplete = $timeout = timeout, create.fake = list = !0;
                }), create;
            });
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, {} ],
    11: [ function(formElementFinder, rootNode, nodeName) {
        function InvalidCharacterError(message) {
            this.message = message;
        }
        function test(string) {
            var str = String(string).replace(/=+$/, "");
            if (str.length % 4 == 1) throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            for (var e, a, n = 0, c = 0, m = ""; a = str.charAt(c++); ~a && (e = n % 4 ? 64 * e + a : a, 
            n++ % 4) ? m += String.fromCharCode(255 & e >> (-2 * n & 6)) : 0) a = specials.indexOf(a);
            return m;
        }
        var specials = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        InvalidCharacterError.prototype = new Error(), InvalidCharacterError.prototype.name = "InvalidCharacterError", 
        rootNode.exports = "undefined" != typeof window && window.atob && window.atob.bind(window) || test;
    }, {} ],
    12: [ function(controller, context, queryParams) {
        function next(list) {
            return decodeURIComponent(func(list).replace(/(.)/g, function(m, m1) {
                var hex = m1.charCodeAt(0).toString(16).toUpperCase();
                return hex.length < 2 && (hex = "0" + hex), "%" + hex;
            }));
        }
        var func = controller("./atob");
        context.exports = function(str) {
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
            try {
                return next(output);
            } catch (str) {
                return func(output);
            }
        };
    }, {
        "./atob": 11
    } ],
    13: [ function(get, module, version) {
        "use strict";
        var decode = get("./base64_url_decode");
        module.exports = function(type, options) {
            if ("string" != typeof type) throw new Error("Invalid token specified");
            options = options || {};
            var index = options.header === !0 ? 0 : 1;
            return JSON.parse(decode(type.split(".")[index]));
        };
    }, {
        "./base64_url_decode": 12
    } ]
}, {}, [ 1 ]);
