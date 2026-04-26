import { useEffect, useRef } from 'react';
import './TimerBar.css';

export default function TimerBar({ timeLeft, maxTime }) {
  const pct = Math.max(0, (timeLeft / maxTime) * 100);
  const urgent = timeLeft <= 5;

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
