import { Question } from '@/types/game';
import questionsData from '@/data/questions.json';

export const selectQuestions = (category: string, count: number = 6, round: number = 1): Question[] => {
  const allQuestions = questionsData as Question[];
  
  // Filter by category if not "All"
  const filtered = category === 'All' 
    ? allQuestions 
    : allQuestions.filter(q => q.category === category);

  // Sort by difficulty
  const sorted = [...filtered].sort((a, b) => a.difficulty - b.difficulty);

  // Adjust difficulty range based on round
  // Round 1: difficulty 1-6
  // Round 2: difficulty 3-8
  // Round 3: difficulty 5-10
  // Round 4: difficulty 6-10 (for two-player mode)
  const minDifficulty = Math.min(1 + (round - 1) * 2, 6);
  const maxDifficulty = Math.min(minDifficulty + 5, 10);

  const selected: Question[] = [];
  const used = new Set<string>();

  // Try to pick questions within the difficulty range
  for (let i = 0; i < count; i++) {
    const targetDiff = minDifficulty + Math.floor((i / count) * (maxDifficulty - minDifficulty + 1));
    
    // Find closest unused question to target difficulty
    let bestMatch: Question | null = null;
    let minDiff = Infinity;

    for (const q of sorted) {
      if (used.has(q.id)) continue;
      if (q.difficulty < minDifficulty || q.difficulty > maxDifficulty) continue;
      const diff = Math.abs(q.difficulty - targetDiff);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = q;
      }
    }

    if (bestMatch) {
      selected.push(bestMatch);
      used.add(bestMatch.id);
    } else {
      // Fallback: pick any unused question within range
      const remaining = sorted.filter(q => 
        !used.has(q.id) && 
        q.difficulty >= minDifficulty && 
        q.difficulty <= maxDifficulty
      );
      if (remaining.length > 0) {
        const fallback = remaining[0];
        selected.push(fallback);
        used.add(fallback.id);
      } else {
        // Last fallback: any unused question
        const anyRemaining = sorted.filter(q => !used.has(q.id));
        if (anyRemaining.length > 0) {
          const fallback = anyRemaining[0];
          selected.push(fallback);
          used.add(fallback.id);
        }
      }
    }
  }

  return selected;
};
