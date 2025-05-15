// File: popup.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('snippets');
  chrome.storage.local.get('snippets', (data) => {
    (data.snippets || []).reverse().forEach(snippet => {
      const div = document.createElement('div');
      div.className = 'snippet';
      div.innerHTML = `
        <p>${snippet.text}</p>
        <small>
          <a href="${snippet.url}" target="_blank">${snippet.title}</a><br>
          ${new Date(snippet.time).toLocaleString()}
        </small>
      `;
      container.appendChild(div);
    });
  });
});
