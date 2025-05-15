function loadSnippets(folder) {
  chrome.storage.local.get(['snippets'], (data) => {
    const container = document.getElementById('snippets');
    container.innerHTML = '';
    (data.snippets || []).filter(snippet => snippet.folder === folder).reverse().forEach(snippet => {
      const div = document.createElement('div');
      div.className = 'snippet';
      div.innerHTML = `
        <p>${snippet.text}</p>
        <small><a href="${snippet.url}" target="_blank">${snippet.title}</a><br>${new Date(snippet.time).toLocaleString()}</small>
        <div class="snippet-actions">
          <button onclick="deleteSnippet('${snippet.id}')">🗑️ Delete</button>
        </div>
      `;
      container.appendChild(div);
    });
  });
}

function populateFolders() {
  chrome.storage.local.get(['snippets'], (data) => {
    const folderSelect = document.getElementById('folderSelect');
    const folders = new Set((data.snippets || []).map(s => s.folder));
    folderSelect.innerHTML = '';
    [...folders].sort().forEach(folder => {
      const option = document.createElement('option');
      option.value = folder;
      option.textContent = folder;
      folderSelect.appendChild(option);
    });
    if (folders.size > 0) {
      loadSnippets(folderSelect.value);
    }
  });
}

function deleteSnippet(id) {
  chrome.storage.local.get(['snippets'], (data) => {
    const updated = (data.snippets || []).filter(s => s.id !== id);
    chrome.storage.local.set({ snippets: updated }, () => {
      loadSnippets(document.getElementById('folderSelect').value);
    });
  });
}

document.getElementById('folderSelect').addEventListener('change', (e) => {
  loadSnippets(e.target.value);
});

document.getElementById('createFolder').addEventListener('click', () => {
  const name = document.getElementById('folderInput').value.trim();
  if (!name) return;
  chrome.storage.local.get(['snippets'], (data) => {
    const snippets = data.snippets || [];
    snippets.push({ id: crypto.randomUUID(), text: '[New Folder Placeholder]', url: '', title: '', time: new Date().toISOString(), folder: name });
    chrome.storage.local.set({ snippets }, populateFolders);
  });
});

document.getElementById('renameFolder').addEventListener('click', () => {
  const oldName = document.getElementById('folderSelect').value;
  const newName = document.getElementById('folderInput').value.trim();
  if (!oldName || !newName) return;
  chrome.storage.local.get(['snippets'], (data) => {
    const snippets = (data.snippets || []).map(s => s.folder === oldName ? { ...s, folder: newName } : s);
    chrome.storage.local.set({ snippets }, populateFolders);
  });
});

document.getElementById('deleteFolder').addEventListener('click', () => {
  const folder = document.getElementById('folderSelect').value;
  chrome.storage.local.get(['snippets'], (data) => {
    const snippets = (data.snippets || []).filter(s => s.folder !== folder);
    chrome.storage.local.set({ snippets }, populateFolders);
  });
});

document.addEventListener('DOMContentLoaded', populateFolders);