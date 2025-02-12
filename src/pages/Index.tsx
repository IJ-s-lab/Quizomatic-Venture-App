
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Quiz from "@/components/Quiz";

const queryClient = new QueryClient();

const Index = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-center text-quiz-text mb-2">
            Trivia Quiz
          </h1>
          <p className="text-quiz-secondary text-center mb-8">
            Test your knowledge with these fun trivia questions!
          </p>
          <Quiz />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default Index;
