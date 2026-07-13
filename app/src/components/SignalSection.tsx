import { cn } from '../utils/cn.ts';

/**
 * SignalSection — community vote buttons for a spell.
 */
export default function SignalSection({ skill, getVote, castVote, aggregateFor }: { skill: string; getVote?: any; castVote?: any; aggregateFor?: any }) {
  if (!getVote || !aggregateFor) return null;

  const userVote = getVote(skill);
  const agg = aggregateFor(skill);

  return (
    <div className="signal-section" aria-label="Community signal">
      <div className="signal-row">
        <span className="signal-question">Did this help?</span>
        <div className="signal-buttons">
          <button
            type="button"
            className={cn('signal-btn', 'signal-up', userVote === 'up' && 'active')}
            onClick={() => castVote?.(skill, 'up')}
            aria-label="This spell helped me"
            title="This helped"
          >
            <span aria-hidden="true">▲</span>
            <span className="signal-count">{agg.up}</span>
          </button>
          <button
            type="button"
            className={cn('signal-btn', 'signal-down', userVote === 'down' && 'active')}
            onClick={() => castVote?.(skill, 'down')}
            aria-label="This spell did not help"
            title="Did not help"
          >
            <span aria-hidden="true">▼</span>
            <span className="signal-count">{agg.down}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
