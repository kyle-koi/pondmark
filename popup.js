// New data structure: separate folders and bookmarks
let folders = [];
let bookmarks = [];

// Load folders and bookmarks from storage
function loadData() {
  chrome.storage.local.get(['folders', 'bookmarks'], (data) => {
    folders = data.folders || [];
    bookmarks = data.bookmarks || [];
    populateFolders();
  });
}

// Save folders and bookmarks to storage
function saveData() {
  chrome.storage.local.set({ folders, bookmarks }, () => {
    populateFolders();
  });
}

// Populate folder dropdown
function populateFolders() {
  const folderSelect = document.getElementById('folderSelect');
  folderSelect.innerHTML = '';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    folderSelect.appendChild(option);
  });
  if (folders.length > 0) {
    loadBookmarks(folderSelect.value);
  }
}

// Load bookmarks for a folder
function loadBookmarks(folderId) {
  const container = document.getElementById('snippets');
  container.innerHTML = '';
  bookmarks.filter(bookmark => bookmark.folderId === folderId).reverse().forEach(bookmark => {
    const div = document.createElement('div');
    div.className = 'snippet';
    div.innerHTML = `
      <p>${bookmark.text}</p>
      <small><a href="${bookmark.url}" target="_blank">${bookmark.title}</a><br>${new Date(bookmark.time).toLocaleString()}</small>
      <div class="snippet-actions">
        <button class="delete-btn" data-id="${bookmark.id}">&#128465; Delete</button>
        <select class="move-select" data-id="${bookmark.id}">
          <option value="">Move to...</option>
          ${folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
        </select>
      </div>
    `;
    container.appendChild(div);
  });

  // Attach event listeners for delete buttons
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      bookmarks = bookmarks.filter(b => b.id !== id);
      saveData();
      loadBookmarks(folderId);
    });
  });

  // Attach event listeners for move selects
  container.querySelectorAll('.move-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.getAttribute('data-id');
      const newFolderId = sel.value;
      if (!newFolderId) return;
      const bookmark = bookmarks.find(b => b.id === id);
      if (bookmark) {
        bookmark.folderId = newFolderId;
        saveData();
        loadBookmarks(folderId);
      }
    });
  });
}

// Create a new folder
document.getElementById('createFolder').addEventListener('click', () => {
  const name = document.getElementById('folderInput').value.trim();
  if (!name) return;
  if (folders.some(f => f.name === name)) {
    alert('Folder name already exists!');
    return;
  }
  folders.push({ id: crypto.randomUUID(), name });
  saveData();
  document.getElementById('folderInput').value = '';
});

// Rename a folder
document.getElementById('renameFolder').addEventListener('click', () => {
  const folderId = document.getElementById('folderSelect').value;
  const newName = document.getElementById('folderInput').value.trim();
  if (!folderId || !newName) return;
  if (folders.some(f => f.name === newName)) {
    alert('Folder name already exists!');
    return;
  }
  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    folder.name = newName;
    saveData();
  }
  document.getElementById('folderInput').value = '';
});

// Delete a folder
document.getElementById('deleteFolder').addEventListener('click', () => {
  const folderId = document.getElementById('folderSelect').value;
  if (!folderId) return;
  if (confirm('Are you sure you want to delete this folder? All bookmarks will be deleted.')) {
    folders = folders.filter(f => f.id !== folderId);
    bookmarks = bookmarks.filter(b => b.folderId !== folderId);
    saveData();
  }
});

// Create a new bookmark
function createBookmark(text, url, title, folderId) {
  const bookmark = { id: crypto.randomUUID(), text, url, title, time: new Date().toISOString(), folderId };
  bookmarks.push(bookmark);
  saveData();
  loadBookmarks(folderId); // Show the new bookmark immediately
}

// Example: Create a bookmark when a snippet is saved
document.getElementById('saveSnippet').addEventListener('click', () => {
  const text = document.getElementById('snippetText').value.trim();
  const url = document.getElementById('snippetUrl').value.trim();
  const title = document.getElementById('snippetTitle').value.trim();
  const folderId = document.getElementById('folderSelect').value;
  if (!text || !url || !folderId) return;
  createBookmark(text, url, title, folderId);
  document.getElementById('snippetText').value = '';
  document.getElementById('snippetUrl').value = '';
  document.getElementById('snippetTitle').value = '';
});

document.getElementById('folderSelect').addEventListener('change', (e) => {
  loadBookmarks(e.target.value);
});

// Load data on startup
document.addEventListener('DOMContentLoaded', loadData);