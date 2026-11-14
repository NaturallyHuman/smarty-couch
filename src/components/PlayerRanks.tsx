import { Check, Lock, Trophy } from 'lucide-react';
import { RANK_TRACKS, RankProgress, getRankValue, getUnlockedRankIds } from '@/utils/playerRanks';

export const PlayerRanks = ({ progress, newlyUnlocked }: { progress: RankProgress; newlyUnlocked: string[] }) => {
  const unlocked = getUnlockedRankIds(progress);
  return (
    <section className="w-full text-left" aria-label="Player ranks">
      <div className="mb-4 flex items-center justify-center gap-3">
        <Trophy className="h-6 w-6 text-warning" />
        <h1 className="text-2xl font-bold">Player ranks</h1>
        <span className="text-sm text-muted-foreground">{unlocked.length} / 12 unlocked</span>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {RANK_TRACKS.map(track => {
          const value = getRankValue(progress, track.key);
          const next = track.milestones.find(rank => !unlocked.includes(rank.id));
          return (
            <div key={track.key} className="min-w-0">
              <h2 className="text-base font-semibold text-primary">{track.label}</h2>
              <p className="mb-3 text-sm tabular-nums text-muted-foreground">{value.toLocaleString()} {track.unit}</p>
              <ol className="space-y-2">
                {track.milestones.map(rank => {
                  const earned = unlocked.includes(rank.id);
                  return (
                    <li key={rank.id} className={`flex items-start gap-2 border-b border-border py-2 ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {earned ? <Check aria-label="Unlocked" className="mt-1 h-4 w-4 shrink-0 text-success" /> : <Lock aria-label="Locked" className="mt-1 h-4 w-4 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{rank.name}{newlyUnlocked.includes(rank.id) && <span className="ml-2 text-xs text-warning">New</span>}</p>
                        <p className="text-xs">{rank.threshold.toLocaleString()} {track.unit}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-xs text-warning">{next ? `${Math.max(0, next.threshold - value).toLocaleString()} ${track.unit} to ${next.name}` : 'All ranks unlocked'}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};