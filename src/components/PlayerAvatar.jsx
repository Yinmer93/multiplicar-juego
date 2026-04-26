import './PlayerAvatar.css';

/**
 * PlayerAvatar — renders the player's customized avatar bubble.
 *
 * Props:
 *   profile  { face, hat, color, name }
 *   size     'sm' | 'md' | 'lg' | 'xl'   (default 'md')
 *   showName boolean (default false)
 */
export default function PlayerAvatar({ profile, size = 'md', showName = false }) {
  const { face = '🧒', hat = '', color = '#6a11cb', name = '' } = profile ?? {};

  return (
    <div className={`player-avatar player-avatar--${size}`}>
      <div className="player-avatar-bubble" style={{ background: color }}>
        <span className="player-avatar-face">{face}</span>
        {hat && <span className="player-avatar-hat">{hat}</span>}
      </div>
      {showName && name && (
        <span className="player-avatar-name">{name}</span>
      )}
    </div>
  );
}
