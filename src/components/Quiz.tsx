
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Question, QuizState } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Quiz = () => {
  const { toast } = useToast();
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    showResults: false,
    loading: true,
    error: null,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quiz"],
    queryFn: async () => {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=10&type=multiple"
      );
      const data = await response.json();
      return data.results;
    },
  });

  useEffect(() => {
    if (data) {
      setQuizState((prev) => ({
        ...prev,
        questions: data,
        loading: false,
      }));
    }
  }, [data]);

  useEffect(() => {
    if (quizState.questions.length > 0) {
      const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
      const shuffledOptions = shuffleArray([
        ...currentQuestion.incorrect_answers,
        currentQuestion.correct_answer,
      ]);
      setOptions(shuffledOptions);
    }
  }, [quizState.questions, quizState.currentQuestionIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-quiz-primary text-xl">
          Loading Quiz...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-quiz-error mb-4">Failed to load quiz questions</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const handleAnswerSubmit = (selectedOption: string) => {
    if (answerSubmitted) return;

    setSelectedAnswer(selectedOption);
    setAnswerSubmitted(true);

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct_answer;

    if (isCorrect) {
      setQuizState((prev) => ({ ...prev, score: prev.score + 1 }));
      toast({
        title: "Correct!",
        description: "Well done!",
        className: "bg-quiz-success text-white",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${currentQuestion.correct_answer}`,
        className: "bg-quiz-error text-white",
      });
    }

    setTimeout(() => {
      if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        setQuizState((prev) => ({ ...prev, showResults: true }));
      } else {
        setQuizState((prev) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
      }
    }, 1500);
  };

  const resetQuiz = async () => {
    await refetch();
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      showResults: false,
      loading: true,
      error: null,
    });
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  };

  if (quizState.showResults) {
    return (
      <div className="max-w-2xl mx-auto p-8 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-quiz-text mb-6">Quiz Results</h2>
          <p className="text-2xl mb-4">
            Your score:{" "}
            <span className="text-quiz-primary font-bold">
              {quizState.score} / {quizState.questions.length}
            </span>
          </p>
          <p className="text-quiz-secondary mb-8">
            {quizState.score === quizState.questions.length
              ? "Perfect score! Impressive!"
              : quizState.score >= quizState.questions.length / 2
              ? "Well done! Keep practicing!"
              : "Keep trying, you'll do better next time!"}
          </p>
          <Button
            onClick={resetQuiz}
            className="bg-quiz-primary hover:bg-quiz-primary/90 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion =
    quizState.questions[quizState.currentQuestionIndex] || null;

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-quiz-secondary">
              Question {quizState.currentQuestionIndex + 1} of{" "}
              {quizState.questions.length}
            </span>
            <span className="text-quiz-primary font-bold">
              Score: {quizState.score}
            </span>
          </div>
          <Progress
            value={
              ((quizState.currentQuestionIndex + 1) /
                quizState.questions.length) *
              100
            }
            className="h-2"
          />
        </div>

        <div className="mb-8">
          <p className="text-sm text-quiz-secondary mb-2">
            {currentQuestion.category}
          </p>
          <h2 className="text-xl font-semibold text-quiz-text mb-6">
            {decodeHtml(currentQuestion.question)}
          </h2>

          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSubmit(option)}
                disabled={answerSubmitted}
                className={`w-full p-4 rounded-lg text-left transition-all transform hover:scale-[1.01] ${
                  answerSubmitted
                    ? option === currentQuestion.correct_answer
                      ? "bg-quiz-success text-white"
                      : option === selectedAnswer
                      ? "bg-quiz-error text-white"
                      : "bg-gray-100 text-gray-500"
                    : "bg-gray-100 hover:bg-gray-200 text-quiz-text"
                }`}
              >
                <div className="flex items-center">
                  {answerSubmitted &&
                    option === currentQuestion.correct_answer && (
                      <Check className="w-5 h-5 mr-2" />
                    )}
                  {answerSubmitted &&
                    option === selectedAnswer &&
                    option !== currentQuestion.correct_answer && (
                      <X className="w-5 h-5 mr-2" />
                    )}
                  <span>{decodeHtml(option)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
