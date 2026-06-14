import { useState } from 'react';
import { translateText } from '../../services/openai.js';

/**
 * @param {{ text: string, onTranslated: (t: string) => void }} props
 */
export function TranslateButton({ text, onTranslated }) {
  const [lang, setLang]     = useState('fr');
  const [loading, setLoading] = useState(false);
  const flags = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪' };
  const next  = { fr: 'en', en: 'es', es: 'de', de: 'fr' };

  const translate = async (e) => {
    e.stopPropagation();
    const nextLang = next[lang];
    if (nextLang === 'fr') { onTranslated(text); setLang('fr'); return; }
    setLoading(true);
    const translated = await translateText(text, nextLang);
    if (translated) onTranslated(translated);
    setLang(nextLang);
    setLoading(false);
  };

  return (
    <button onClick={translate} disabled={loading} style={{ background: 'none', border: '1px solid #e0ece7', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', color: '#6a8a80', cursor: 'pointer' }}>
      {loading ? '⏳' : `🌐 ${flags[lang]}`}
    </button>
  );
}
