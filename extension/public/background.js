// Opens the side panel when the toolbar icon is clicked. The panel is the Vue
// client, built by "npm run build:extension".
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => console.error(err));
