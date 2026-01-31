chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "isl_lookup",
    title: "View in ISL",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "isl_lookup" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "LOOKUP_WORD",
      text: info.selectionText
    });
  }
});
