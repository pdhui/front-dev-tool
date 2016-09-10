
chrome.browserAction.onClicked.addListener(function(tab) {
  // chrome.tabs.executeScript(null, {file: "main.js"});

  chrome.tabs.sendRequest(tab.id, {command: "toggleOpen"},function(res){
    var icon = 'unactived.png';
    if(res.status){
      icon = 'icon.png';
    }

    chrome.browserAction.setIcon(icon);
  });

});