chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveSnippet",
    title: "Save to Pondmark",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveSnippet") {
    const url = chrome.runtime.getURL('select_folder.html');
    const params =
      '?text=' + encodeURIComponent(info.selectionText) +
      '&url=' + encodeURIComponent(tab.url) +
      '&title=' + encodeURIComponent(tab.title);
    const width = 400;
    const height = 300;
    chrome.system.display.getInfo((displays) => {
      // Use the primary display
      const display = displays.find(d => d.isPrimary) || displays[0];
      const left = Math.round(display.workArea.left + (display.workArea.width - width) / 2);
      const top = Math.round(display.workArea.top + (display.workArea.height - height) / 2);
      chrome.windows.create({
        url: url + params,
        type: 'popup',
        width,
        height,
        left,
        top
      });
    });
  }
});

function saveSnippet(selectedText, pageUrl, pageTitle) {
  chrome.storage.local.get(['folders', 'bookmarks'], (data) => {
    const folders = data.folders || [];
    const bookmarks = data.bookmarks || [];
    let folderId = null;
    if (folders.length > 0) {
      const folderNames = folders.map(f => f.name).join(', ');
      const chosen = prompt('Save to which folder? Available: ' + folderNames, folders[0].name);
      const folder = folders.find(f => f.name === chosen);
      folderId = folder ? folder.id : folders[0].id;
    }
    if (!folderId) {
      alert('No folder available. Please create a folder first.');
      return;
    }
    const bookmark = {
      id: crypto.randomUUID(),
      text: selectedText,
      url: pageUrl,
      title: pageTitle,
      time: new Date().toISOString(),
      folderId: folderId
    };
    bookmarks.push(bookmark);
    chrome.storage.local.set({ bookmarks });
  });
}