import { Question } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';

const USED_QUESTIONS_KEY = 'trivia_used_question_ids';

const getUsedQuestionIds = (): string[] => {
  try {
    const stored = localStorage.getItem(USED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsedQuestionIds = (ids: string[]) => {
  localStorage.setItem(USED_QUESTIONS_KEY, JSON.stringify(ids));
};

const getDifficultyForRound = (round: number): string => {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
};

export const selectQuestions = async (
  category: string,
  count: number = 10,
  round: number = 1,
  excludeIds: string[] = []
): Promise<Question[]> => {
  const difficulty = getDifficultyForRound(round);
  const persistedUsedIds = getUsedQuestionIds();
  const allExcluded = [...new Set([...excludeIds, ...persistedUsedIds])];

  console.log('Fetching questions from DB:', { category, count, difficulty, excludedCount: allExcluded.length });

  let query = supabase
    .from('questions')
    .select('*')
    .eq('difficulty', difficulty);

  if (category !== 'All') {
    query = query.eq('category', category);
  }

  if (allExcluded.length > 0) {
    query = query.not('id', 'in', `(${allExcluded.join(',')})`);
  }

  let { data, error } = await query.limit(count);

  // If not enough questions, reset persisted used IDs and retry
  if (!error && (!data || data.length < count)) {
    console.log('Not enough unused questions, resetting pool');
    saveUsedQuestionIds([]);

    let retryQuery = supabase
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty);

    if (category !== 'All') {
      retryQuery = retryQuery.eq('category', category);
    }

    if (excludeIds.length > 0) {
      retryQuery = retryQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const retryResult = await retryQuery.limit(count);
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No questions available');
  }

  // Shuffle the results
  const shuffled = data.sort(() => Math.random() - 0.5).slice(0, count);

  // Save used IDs
  const newUsedIds = [...persistedUsedIds, ...shuffled.map(q => q.id)];
  saveUsedQuestionIds(newUsedIds);

  // Map to Question type
  const questions: Question[] = shuffled.map(q => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3,
    text: q.text,
    choices: q.choices,
    correctIndex: q.correct_index,
  }));

  console.log(`Successfully fetched ${questions.length} questions`);
  return questions;
};
