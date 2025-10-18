import { Question } from '@/types/game';
import questionsData from '@/data/questions.json';

export const selectQuestions = (category: string, count: number = 10): Question[] => {
  const allQuestions = questionsData as Question[];
  
  // Filter by category if not "All"
  const filtered = category === 'All' 
    ? allQuestions 
    : allQuestions.filter(q => q.category === category);

  // Sort by difficulty
  const sorted = [...filtered].sort((a, b) => a.difficulty - b.difficulty);

  const selected: Question[] = [];
  const used = new Set<string>();

  // Try to pick one question for each difficulty level 1-10
  for (let targetDiff = 1; targetDiff <= count; targetDiff++) {
    // Find closest unused question to target difficulty
    let bestMatch: Question | null = null;
    let minDiff = Infinity;

    for (const q of sorted) {
      if (used.has(q.id)) continue;
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
      // Fallback: pick any unused question
      const remaining = sorted.filter(q => !used.has(q.id));
      if (remaining.length > 0) {
        const fallback = remaining[0];
        selected.push(fallback);
        used.add(fallback.id);
      }
    }
  }

  return selected;
};
