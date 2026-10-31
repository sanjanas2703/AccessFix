// The app is too wide for a Chrome popup, so the toolbar icon opens it in a tab.
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
