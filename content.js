// ====================== CONSTANTS ======================
const PLAYER_ID = 'islspaces-player';
const AI_BRIDGE_URL = chrome.runtime.getURL('ai_bridge.js');

const ISL_API_URL = "https://10.176.30.190:8000/CDAC/texttoisl";
const AVATAR_ID = "1";

// ====================== STATE ======================
let currentWord = null;
let closeTimer = null;
const aiCache = {};
const pending = {};

// ====================== STYLE ======================
(function injectStyle() {
  if (document.getElementById('islspaces-style')) return;

  const style = document.createElement('style');
  style.id = 'islspaces-style';
  style.textContent = `
    #${PLAYER_ID} {
      position: absolute;
      width: 320px;
      background: #383838;
      color: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 35px rgba(0,0,0,.45);
      z-index: 999999;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }

    #${PLAYER_ID} video {
      width: 100%;
      background: #000;
    }

    .isl-content {
      padding: 6px;
      font-size: 13px;
      line-height: 1.3;
    }

    .isl-row {
      margin-bottom: 6px;
    }

    .isl-pill {
      display: inline-block;
      background: #2b2b2b;
      padding: 2px 6px;
      margin: 2px;
      border-radius: 4px;
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);
})();

// ====================== AI BRIDGE ======================
(function injectAIBridge() {
  if (document.getElementById('isl-ai-bridge')) return;
  const script = document.createElement('script');
  script.id = 'isl-ai-bridge';
  script.src = AI_BRIDGE_URL;
  document.head.appendChild(script);
})();

window.addEventListener('message', e => {
  const m = e.data || {};
  if (m.source === 'ISL_SPACES_BRIDGE' && m.type === 'ISL_AI_RESPONSE') {
    if (pending[m.id]) {
      pending[m.id](m.payload);
      delete pending[m.id];
    }
  }
});

// ====================== HELPERS ======================
function getWordFromText(text, offset) {
  const left = text.slice(0, offset).split(/\s+/).pop();
  const right = text.slice(offset).split(/\s+/).shift();
  return (left + right).replace(/[^a-zA-Z]/g, '');
}

function smartPosition(el, anchorRect) {
  const pad = 8;
  let top = anchorRect.bottom + pad + scrollY;
  let left = anchorRect.left + scrollX;

  if (left + 340 > innerWidth) {
    left = innerWidth - 340 - pad;
  }
  if (top + 300 > innerHeight + scrollY) {
    top = anchorRect.top - 300 - pad + scrollY;
  }

  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
}

// ====================== MEANING + HINDI ======================
async function fetchMeaningAndHindi(word) {
  const base = word.toLowerCase();
  if (aiCache[base]) return aiCache[base];

  try {
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${base}`);
    const dictData = await dictRes.json();
    const meaning = dictData[0]?.meanings[0]?.definitions[0]?.definition || null;

    let hindi = null;
    if (meaning) {
      const hiRes = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(meaning)}&langpair=en|hi`
      );
      const hiData = await hiRes.json();
      hindi = hiData.responseData?.translatedText || null;
    }

    return (aiCache[base] = { english: meaning, hindi });
  } catch {
    return { english: null, hindi: null };
  }
}

// ====================== SYNONYMS ======================
async function getSynonyms(word) {
  try {
    const res = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
    const data = await res.json();
    return data.slice(0, 3).map(w => w.word);
  } catch {
    return [];
  }
}

// ====================== POPUP ======================
async function showPopup(text, anchorRect, isSelection = false)
 {
  if (!text) return;

  const normalized = text.toLowerCase().trim();
  if (normalized === currentWord) return;

  closePopup();
  currentWord = normalized;
  const firstWord = text.split(/\s+/)[0];



  const popup = document.createElement('div');
  popup.id = PLAYER_ID;

  popup.innerHTML = `
  <video autoplay loop muted controls></video>

  <div class="isl-content">
    <div class="isl-row"><b>${isSelection ? 'Text:' : 'Word:'}</b> ${text}</div>
    <div class="isl-row" id="isl-loading">Loading...</div>
    <div class="isl-row isl-result" style="display:none">
      <b>Synonyms:</b><span id="isl-syn"></span></div>
    <div class="isl-row isl-result" style="display:none"><b>Meaning:</b><span id="isl-mean"></span></div>

    <div class="isl-row isl-result" style="display:none"><b>Hindi:</b><span id="isl-hi"></span></div>
  </div>
`;

  popup.onmouseenter = () => clearTimeout(closeTimer);
  popup.onmouseleave = delayedClose;

  document.body.appendChild(popup);
  smartPosition(popup, anchorRect);

  // ISL video
  try {
    const res = await fetch(ISL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: currentWord, avatar_id: AVATAR_ID })
    });
    const d = await res.json();
    popup.querySelector('video').src = d?.file?.pose_url || '';
  } catch {}

  let meaning = { english: null, hindi: null };
let syns = [];

if (!isSelection || text.split(/\s+/).length === 1) {
  // single word only
  [meaning, syns] = await Promise.all([
    fetchMeaningAndHindi(firstWord),
    getSynonyms(firstWord)
  ]);
}


  // remove loading
  popup.querySelector('#isl-loading')?.remove();

  // fill data
  popup.querySelector('#isl-mean').textContent = meaning.english || '—';
  popup.querySelector('#isl-hi').textContent = meaning.hindi || '—';
  popup.querySelector('#isl-syn').innerHTML =
    syns.length
      ? syns.map(s => `<span class="isl-pill">${s}</span>`).join(' ')
      : '—';

  // show all result rows together
  if (!isSelection || text.split(/\s+/).length === 1) {
  popup.querySelectorAll('.isl-result').forEach(el => {
    el.style.display = 'block';
  });
}


}

// ====================== CLOSE ======================
function closePopup() {
  currentWord = null;
  const p = document.getElementById(PLAYER_ID);
  if (p) p.remove();
}

function delayedClose() {
  closeTimer = setTimeout(closePopup, 400);
}

// ====================== SELECT SUPPORT ======================
document.addEventListener('mouseup', () => {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!text) return;

  const rect = sel.getRangeAt(0).getBoundingClientRect();

  // MULTI WORD / SENTENCE SUPPORT
  showPopup(text, rect, true);
});


// ====================== HOVER SUPPORT ======================
let hoverTimer = null;

document.addEventListener('mousemove', e => {
  clearTimeout(hoverTimer);

  hoverTimer = setTimeout(() => {
    const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (!range || !range.startContainer?.textContent) return;

    const word = getWordFromText(
      range.startContainer.textContent,
      range.startOffset
    );

    if (!word || word.length < 2) return;

    showPopup(word, {
      left: e.clientX,
      top: e.clientY,
      bottom: e.clientY,
      right: e.clientX
    });
  }, 350);
});

// ====================== MOBILE TOUCH ======================
document.addEventListener('touchend', e => {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!text) return;

  const rect = sel.getRangeAt(0).getBoundingClientRect();``
  showPopup(text, rect);
});             