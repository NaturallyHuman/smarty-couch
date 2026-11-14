import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { RANK_TRACKS, RankProgress, getRankValue, getUnlockedRankIds } from '@/utils/playerRanks';
import { TVButton } from './TVButton';

export const PlayerRanks = ({ progress, newlyUnlocked }: { progress: RankProgress; newlyUnlocked: string[] }) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const unlocked = getUnlockedRankIds(progress);
  const track = RANK_TRACKS[trackIndex];
  const value = getRankValue(progress, track.key);
  const next = track.milestones.find(rank => !unlocked.includes(rank.id));
  return <section className="rank-view w-full" aria-label="Player ranks">
    <div className="progress-tabs" role="group" aria-label="Rank track">
      {RANK_TRACKS.map((item, index) => <TVButton key={item.key} variant={index === trackIndex ? 'primary' : 'secondary'} aria-pressed={index === trackIndex} onClick={() => setTrackIndex(index)}>{['Games', 'Personal Best', 'Streak'][index]}</TVButton>)}
    </div>
    <div className="rank-summary">
      <p className="rank-total"><strong className="rank-lifetime-value text-foreground">{value.toLocaleString()}</strong> <span className="text-muted-foreground">{track.unit}</span></p>
      <p className="rank-next text-warning">{next ? `${Math.max(0, next.threshold - value).toLocaleString()} ${track.unit} to ${next.name}` : 'All ranks unlocked'}</p>
    </div>
    <ol className="rank-milestones">
      {track.milestones.map(rank => {
        const earned = unlocked.includes(rank.id);
        return <li key={rank.id} className={earned ? 'text-foreground' : 'text-muted-foreground'}>
          {earned ? <Check className="text-success" aria-label="Unlocked" /> : <Lock aria-label="Locked" />}
          <div><p className="rank-name font-semibold">{rank.name} {newlyUnlocked.includes(rank.id) && <span className="text-warning">New</span>}</p><p className="rank-requirement">{rank.threshold.toLocaleString()} {track.unit}</p></div>
        </li>;
      })}
    </ol>
    <p className="rank-unlocked-total text-muted-foreground">{unlocked.length}/12 lifetime ranks unlocked</p>
  </section>;
};
