import { useEffect, useState } from 'react';
import './JumpCooldownTimer.css';

interface JumpCooldownTimerProps {
  lastJumpAt: string | null;
  onCooldownComplete: () => void;
}

export function JumpCooldownTimer({ lastJumpAt, onCooldownComplete }: JumpCooldownTimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!lastJumpAt) {
      setRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const jumpTime = new Date(lastJumpAt).getTime();
      const now = Date.now();
      const elapsed = (now - jumpTime) / 1000; // seconds
      const cooldown = 10; // 10 second cooldown
      const rem = Math.max(0, cooldown - elapsed);
      setRemaining(rem);

      if (rem === 0) {
        onCooldownComplete();
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 100);

    return () => clearInterval(interval);
  }, [lastJumpAt, onCooldownComplete]);

  if (remaining === 0) return null;

  return (
    <div className="jump-cooldown-timer">
      <div className="jump-cooldown-icon">⏳</div>
      <span className="jump-cooldown-text">
        Jump drive recharging: {remaining.toFixed(1)}s
      </span>
    </div>
  );
}
