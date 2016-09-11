
function switchIcon(status){
  var icon = 'unactived.png';

  if(status){
    icon = 'icon.png';
  }

  chrome.browserAction.setIcon({path:icon});
}

chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.tabs.sendRequest(tab.id, {command: "toggleOpen"},function(res){
    switchIcon(res.status);
  });

});
chrome.tabs.onActivated.addListener(function(tab){
    chrome.tabs.sendRequest(tab.tabId, {command: "getStatus"}, function(res){
      if(!res) res = {};
      
      switchIcon(res.status);
    });
});