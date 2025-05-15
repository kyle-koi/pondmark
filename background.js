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
  const snippet = {
    text: selectedText,
    url: pageUrl,
    title: pageTitle,
    time: new Date().toISOString()
  };
  chrome.storage.local.get({ snippets: [] }, (result) => {
    const snippets = result.snippets;
    snippets.push(snippet);
    chrome.storage.local.set({ snippets });
  });
}