chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveSnippet",
    title: "Save to ByteDrop",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveSnippet") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: saveSnippet,
      args: [info.selectionText, tab.url, tab.title]
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