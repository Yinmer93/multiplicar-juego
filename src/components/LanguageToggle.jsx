import './LanguageToggle.css';

export default function LanguageToggle({ language, onToggle }) {
  return (
    <button
      className="lang-toggle"
      onClick={onToggle}
      title="Switch language / Cambiar idioma"
    >
      {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
    </button>
  );
}
