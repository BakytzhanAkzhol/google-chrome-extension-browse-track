(function() {
  'use strict';
  var Stat, calc, tabChanged, updateBadge;

  chrome.runtime.onInstalled.addListener(function(details) {
    return console.log('previousVersion', details.previousVersion);
  });

  chrome.browserAction.setBadgeText({
    text: 'Hello, World'
  });

  Stat = {
    data: {},
    cur: null
  };

  tabChanged = function(url) {
    var lst;
    if (Stat.cur) {
      lst = Stat.data[Stat.cur];
      lst.push(new Date());
    }
    Stat.cur = url;
    lst = Stat.data[url] || [];
    lst.push(new Date());
    return Stat.data[url] = lst;
  };

  calc = function(url) {
    var i, lst, n, res, _i;
    lst = Stat.data[url];
    if (!lst) {
      return 0;
    }
    n = Math.floor(lst.length / 2);
    res = 0;
    for (i = _i = 0; 0 <= n ? _i <= n : _i >= n; i = 0 <= n ? ++_i : --_i) {
      if (lst[2 * i + 1] && lst[2 * i]) {
        res += lst[2 * i + 1].getTime() - lst[2 * i].getTime();
      }
    }
    res += (new Date()).getTime() - lst[lst.length - 1].getTime();
    return res;
  };

  updateBadge = function(url) {
    var HH, MM, SS, hh, id, mm, res, ss, textTime;
    res = calc(url);
    id = String(Stat.curTabId);
    console.log(id);
    chrome.storage.local.set(function(_arg) {
      var res;
      res = _arg.id;
      return console.log(chrome.storage.local.get(id));
    });
    mm = res % 60;
    hh = Math.floor(res / (3600 * 60000));
    mm = Math.floor(res / 60000.);
    ss = parseInt(((res % 60000) / 1000) % 60);
    HH = hh <= 9 ? '0' + hh : hh;
    MM = mm <= 9 ? '0' + mm : mm;
    SS = ss <= 9 ? '0' + ss : ss;
    textTime = hh <= 1 ? "" + MM + ":" + SS : "" + HH + ":" + MM + ":" + SS;
    return chrome.browserAction.setBadgeText({
      text: textTime
    });
  };

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log("Select " + activeInfo.tabId + " ");
    Stat.curTabId = activeInfo.tabId;
    return chrome.tabs.get(activeInfo.tabId, function(tab) {
      if (tab.url) {
        tabChanged(tab.url);
      }
      return updateBadge(tab.url);
    });
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "update") {
      if (!Stat.curTabId) {
        return;
      }
      return chrome.tabs.get(Stat.curTabId, function(tab) {
        if (tab.url) {
          return updateBadge(tab.url);
        }
      });
    }
  });

  chrome.alarms.create("update", {
    periodInMinutes: 0.010
  });

  console.log('\'Allo \'Allo! Event Page for Browser Action');

}).call(this);
