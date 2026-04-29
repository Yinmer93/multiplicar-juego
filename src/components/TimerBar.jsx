import { useEffect, useRef } from 'react';
import './TimerBar.css';

export default function TimerBar({ timeLeft, maxTime, urgent: alwaysUrgent }) {
  const pct = Math.max(0, (timeLeft / maxTime) * 100);
  const urgent = alwaysUrgent || timeLeft <= 5;

  return (
    <div className="timerbar-wrapper">
      <div className={`timerbar-count ${urgent ? 'urgent' : ''}`}>
        ⏱ {timeLeft}s
      </div>
      <div className="timerbar-track">
        <div
          className={`timerbar-fill ${urgent ? 'urgent' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
