const DEFAULTS = { color: 'rgba(255, 255, 0, 0.6)', autostart: true };

(async function() {
  const st = await chrome.storage.sync.get(DEFAULTS);
  document.getElementById('color').value = st.color || DEFAULTS.color;
  document.getElementById('autostart').checked = st.autostart ?? DEFAULTS.autostart;
})();

document.getElementById('save').addEventListener('click', async () => {
  const color = document.getElementById('color').value || DEFAULTS.color;
  const autostart = document.getElementById('autostart').checked;
  await chrome.storage.sync.set({ color, autostart });
  document.getElementById('status').textContent = 'Saved!';
  setTimeout(() => document.getElementById('status').textContent = '', 1200);
});
