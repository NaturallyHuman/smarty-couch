import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category mapping from app categories to Open Trivia DB IDs
const categoryMap: { [key: string]: number } = {
  'Movies': 11,
  'Science': 17,
  'History': 23,
  'Sports': 21,
  'General': 9, // General Knowledge
};

// Difficulty mapping
const difficultyMap: { [key: number]: string } = {
  1: 'easy',
  2: 'medium',
  3: 'hard',
};

interface OpenTriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'All', amount = 10, round = 1, excludeIds = [] } = await req.json();
    
    console.log('Fetching trivia questions:', { category, amount, round, excludedCount: excludeIds.length });

    // Build API URL - fetch extra questions to account for potential duplicates
    const fetchAmount = Math.min(amount + 10, 50); // Cap at 50 to avoid API limits
    let apiUrl = `https://opentdb.com/api.php?amount=${fetchAmount}`;
    
    // Add category if not "All"
    if (category !== 'All' && categoryMap[category]) {
      apiUrl += `&category=${categoryMap[category]}`;
    }
    
    // Add difficulty based on round
    const difficulty = difficultyMap[Math.min(round, 3)] || 'medium';
    apiUrl += `&difficulty=${difficulty}`;
    
    // Fetch from Open Trivia DB
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Open Trivia DB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error(`Open Trivia DB returned error code: ${data.response_code}`);
    }

    // Transform questions to app format
    const questions = data.results.map((q: OpenTriviaQuestion, index: number) => {
      // Decode HTML entities
      const decodeHtml = (html: string) => {
        return html
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&ldquo;/g, '"')
          .replace(/&rdquo;/g, '"')
          .replace(/&rsquo;/g, "'")
          .replace(/&lsquo;/g, "'")
          .replace(/&eacute;/g, 'é')
          .replace(/&ntilde;/g, 'ñ')
          .replace(/&deg;/g, '°');
      };

      // Shuffle answers
      const allAnswers = [q.correct_answer, ...q.incorrect_answers];
      const shuffled = allAnswers
        .map(a => ({ answer: decodeHtml(a), sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.answer);
      
      const correctIndex = shuffled.findIndex(a => a === decodeHtml(q.correct_answer));

      return {
        id: `otdb-${Date.now()}-${index}`,
        text: decodeHtml(q.question),
        choices: shuffled,
        correctIndex,
        category: q.category,
        difficulty: q.difficulty,
      };
    });

    console.log(`Successfully fetched ${questions.length} questions`);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        questions: [] 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
