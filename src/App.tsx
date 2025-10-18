import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CategorySelect from "./pages/CategorySelect";
import RoundIntro from "./pages/RoundIntro";
import Question from "./pages/Question";
import Results from "./pages/Results";
import Stats from "./pages/Stats";
import HighScore from "./pages/HighScore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<CategorySelect />} />
          <Route path="/round-intro" element={<RoundIntro />} />
          <Route path="/question" element={<Question />} />
          <Route path="/results" element={<Results />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/highscore" element={<HighScore />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
