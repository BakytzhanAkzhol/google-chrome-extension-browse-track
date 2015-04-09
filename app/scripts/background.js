 'use strict';
 function formatTime(seconds) {
  //var hh = Math.floor(seconds / 3600);
  var mm = Math.floor(seconds / 60) % 60,
  ss = Math.floor(seconds) % 60;
  return ((mm<10)?'0'+mm:mm)+":"+((ss<10)?'0'+ss:ss);
}
(function() {
  var Stat, calc, tabChanged, updateBadge,timer,res;
  chrome.runtime.onInstalled.addListener(function(details) {
    return console.log('previousVersion', details.previousVersion);
  });
  chrome.browserAction.setBadgeText({
    text: 'Hello'
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
    Stat.data[url]=lst;
    return Stat.data[url];
  };

  calc = function(url) {
    var i, lst, n, _i;
    lst = Stat.data[url];
    if (!lst) {
      return 0;
    }
    n = Math.floor(lst.length / 2);
    res = 0;
    console.log(res);
    for (i = _i = 0; 0 <= n ? _i <= n : _i >= n; i = 0 <= n ? ++_i : --_i) {
      if (lst[2 * i + 1] && lst[2 * i]) {
        res += lst[2 * i + 1].getTime() - lst[2 * i].getTime();
      }
    }
    res += (new Date()).getTime() - lst[lst.length - 1].getTime();
    return res;
  };

  updateBadge = function(url) {
    var res;
    res = calc(url);
    return chrome.browserAction.setBadgeText({
      text: "" + formatTime(res / 1000)
    });
  };
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    //console.log("Select " + activeInfo.tabId + " ");
    Stat.curTabId = activeInfo.tabId;
    return chrome.tabs.get(activeInfo.tabId, function(tab) {
      if (tab.url) {
        tabChanged(tab.url);
      }
      timer=window.setInterval(function() {
        return chrome.tabs.get(Stat.curTabId, function(tab) {
       //   console.log(tab);
          if (tab.url) {
             return updateBadge(tab.url);
          }
          });
    }, 1000);
      return updateBadge(tab.url);
    });
  });

  chrome.tabs.onActiveChanged.addListener(function(){
    if(timer!=null){
      console.log("Interval is cleaner");
      var n=''+Stat.curTabId;
      clearInterval(timer);
      timer=null;
      
      chrome.storage.sync.set({n:res}, function() {
         chrome.storage.sync.get(n, function(data) {
          var t=data;
          console.log(t);
        });
      });}  
    });
 // console.log('Browse Trucks is starting works');
}).call(this);