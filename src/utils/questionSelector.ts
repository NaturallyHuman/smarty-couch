import { Question } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';

export const selectQuestions = async (category: string, count: number = 10, round: number = 1, excludeIds: string[] = []): Promise<Question[]> => {
  try {
    console.log('Fetching questions from API:', { category, count, round, excludedCount: excludeIds.length });
    
    // Fetch extra questions to account for filtering out duplicates
    const fetchAmount = count + excludeIds.length + 5;
    
    const { data, error } = await supabase.functions.invoke('fetch-trivia', {
      body: { category, amount: fetchAmount, round, excludeIds }
    });

    if (error) {
      console.error('Error fetching questions from API:', error);
      throw error;
    }

    if (!data || !data.questions || data.questions.length === 0) {
      console.error('No questions returned from API');
      throw new Error('No questions available');
    }

    // Filter out any questions that were already used
    const filteredQuestions = data.questions.filter(
      (q: Question) => !excludeIds.includes(q.id)
    );

    // Take only the number we need
    const selectedQuestions = filteredQuestions.slice(0, count);

    if (selectedQuestions.length < count) {
      console.warn(`Only got ${selectedQuestions.length} unique questions, requested ${count}`);
    }

    console.log(`Successfully fetched ${selectedQuestions.length} unique questions`);
    return selectedQuestions as Question[];
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
};
