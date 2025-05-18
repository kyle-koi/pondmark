// Parse query parameters
function getQueryParams() {
  const params = {};
  window.location.search.substring(1).split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[key] = decodeURIComponent(value || '');
  });
  return params;
}

const params = getQueryParams();

// Populate folder dropdown
chrome.storage.local.get(['folders', 'bookmarks'], (data) => {
  const folders = data.folders || [];
  const folderSelect = document.getElementById('folderSelect');
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    folderSelect.appendChild(option);
  });
});

// Save the bookmark when the button is clicked
document.getElementById('saveBtn').addEventListener('click', () => {
  const folderId = document.getElementById('folderSelect').value;
  if (!folderId) return;
  chrome.storage.local.get(['bookmarks'], (data) => {
    const bookmarks = data.bookmarks || [];
    bookmarks.push({
      id: crypto.randomUUID(),
      text: params.text,
      url: params.url,
      title: params.title,
      time: new Date().toISOString(),
      folderId
    });
    chrome.storage.local.set({ bookmarks }, () => {
      window.close();
    });
  });
}); 