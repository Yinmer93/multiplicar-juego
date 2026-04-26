import './HPBar.css';

export default function HPBar({ current, max, label }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const colorClass = pct > 50 ? 'hp-high' : pct > 25 ? 'hp-mid' : 'hp-low';

  return (
    <div className="hpbar-wrapper">
      <div className="hpbar-label">
        {label} <span className="hpbar-numbers">{current}/{max}</span>
      </div>
      <div className="hpbar-track">
        <div
          className={`hpbar-fill ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
