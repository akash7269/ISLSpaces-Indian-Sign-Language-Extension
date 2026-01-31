// ai_bridge.js - Simplified: Only English meaning + Hindi translation
(function () {
  if (window.__ISL_AI_BRIDGE_INSTALLED__) return;
  window.__ISL_AI_BRIDGE_INSTALLED__ = true;

  function postResponse(id, payload) {
    window.postMessage({ source: 'ISL_SPACES_BRIDGE', type: 'ISL_AI_RESPONSE', id, payload }, '*');
  }

  async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Try Chrome built-in LanguageModel (if supported)
  async function tryLanguageModel(word) {
    if (!('LanguageModel' in window)) return null;
    try {
      let avail = await LanguageModel.availability();
      const maxWait = 6; let attempts = 0;
      while ((avail === 'downloadable' || avail === 'model-downloading') && attempts < maxWait) {
        await sleep(2000);
        attempts++;
        avail = await LanguageModel.availability();
      }
      if (avail !== 'readily') return null;

      const session = await LanguageModel.create({
        outputLanguage: 'en',
        systemPrompt: 'You are a concise English dictionary.'
      });

      const raw = await session.prompt(
        `Explain the meaning of the English word "${word}" in one short sentence. Respond only with plain text.`
      );

      return { meaning: String(raw).trim() };
    } catch (e) {
      console.warn('ai_bridge: LanguageModel failed', e);
      return null;
    }
  }

  // Try Chrome built-in Translator (if supported)
  async function tryTranslator(text) {
    if (!('Translator' in window)) return null;
    try {
      let state = await Translator.availability({ sourceLanguage: 'en', targetLanguage: 'hi' });
      const maxWait = 6; let attempts = 0;
      while ((state === 'downloadable' || state === 'model-downloading') && attempts < maxWait) {
        await sleep(2000);
        attempts++;
        state = await Translator.availability({ sourceLanguage: 'en', targetLanguage: 'hi' });
      }
      if (state !== 'readily') return null;

      const t = await Translator.create({ sourceLanguage: 'en', targetLanguage: 'hi' });
      return await t.translate(text);
    } catch (e) {
      console.warn('ai_bridge: Translator failed', e);
      return null;
    }
  }

  // Online dictionary (fallback)
  async function onlineMeaning(word) {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return null;
      const data = await res.json();
      const def = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      if (!def) return null;
      return { meaning: def };
    } catch (e) {
      console.warn('onlineMeaning error', e);
      return null;
    }
  }

  // Online translation (fallback)
  async function onlineTranslate(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data[0]?.[0]?.[0] || null; // extract translated text
  } catch (e) {
    console.warn('onlineTranslate error', e);
    return null;
  }
}


  // Build meaning + Hindi info
  async function buildAIInfo(word) {
    const out = {
      available: false,
      modelAvailable: false,
      translatorAvailable: false,
      english: null,
      hindi: null,
      error: null,
    };

    try {
      // Step 1: Try Chrome AI model
      const lm = null;
      // const lm = await tryLanguageModel(word);
      if (lm) {
        out.modelAvailable = true;
        out.english = lm;
        out.available = true;
      }

      // Step 2: Fallback to online dictionary
      if (!out.english) {
        const dict = await onlineMeaning(word);
        if (dict) {
          out.english = dict;
          out.available = true;
        } else {
          out.english = { meaning: `No definition found for "${word}".` };
        }
      }

      // Step 3: Hindi translation
      const hiText = await onlineTranslate(out.english.meaning);
      // const hiText = (await tryTranslator(out.english.meaning)) || (await onlineTranslate(out.english.meaning));
      if (hiText) {
        out.hindi = hiText;
        out.translatorAvailable = true;
      } else {
        out.hindi = 'Hindi translation unavailable.';
      }

      return out;
    } catch (e) {
      out.error = String(e);
      console.error('buildAIInfo error:', e);
      return out;
    }
  }

  // Listen for AI requests from content.js
  window.addEventListener('message', async (ev) => {
    const msg = ev.data || {};
    if (!msg || msg.source !== 'ISL_SPACES_CONTENT' || msg.type !== 'ISL_AI_QUERY') return;
    const { id, word } = msg;
    try {
      const info = await buildAIInfo(word);
      postResponse(id, info);
    } catch (err) {
      postResponse(id, { error: String(err) });
    }
  });
})();
