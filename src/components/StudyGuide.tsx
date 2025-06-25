'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Search, RefreshCw, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import questionsData from '../data/questions.json';

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  hint: string;
  category: string;
}

const categories = [
  'Soil Management',
  'Safe Work Practices',
  'Tree Biology',
  'Identification and Selection',
  'Tree Risk Management',
  'Pest and Disease Management',
  'Installation and Establishment',
  'Pruning',
  'Tree and Shrub Nutrition and Fertilization',
  'Diagnosis and Treatment',
  'Trees and Construction',
  'Tree Support Systems',
  'Tree Protection',
  'Urban Forestry'
];

// Exam simulation weights based on domains
const examWeights = {
  'Soil Management': 0.08,
  'Safe Work Practices': 0.16,
  'Tree Biology': 0.14,
  'Identification and Selection': 0.07,
  'Tree Risk Management': 0.08,
  'Pest and Disease Management': 0.05,
  'Installation and Establishment': 0.10,
  'Pruning': 0.10,
  'Tree and Shrub Nutrition and Fertilization': 0.05,
  'Diagnosis and Treatment': 0.15,
  'Trees and Construction': 0.02,
  'Tree Support Systems': 0.02,
  'Tree Protection': 0.07,
  'Urban Forestry': 0.06
};

export default function StudyGuide() {
  const [questions] = useState<Question[]>(questionsData as Question[]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<{ [key: number]: string }>({});
  const [examResults, setExamResults] = useState<{ correct: number; total: number } | null>(null);
  const [userProgress, setUserProgress] = useState<{ [category: string]: { correct: number; total: number } }>({});

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem('arboracle_study_progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Filter questions based on selected categories and search term
    let filtered = questions.filter(q => selectedCategories.includes(q.category));
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredQuestions(filtered);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setShowHint(false);
    setSelectedAnswer('');
  }, [selectedCategories, searchTerm, questions]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAnswerSelect = (answer: string) => {
    if (!showAnswer) {
      setSelectedAnswer(answer);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    
    // Update progress
    if (selectedAnswer && !isExamMode) {
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      
      setUserProgress(prev => {
        const updated = { ...prev };
        if (!updated[currentQuestion.category]) {
          updated[currentQuestion.category] = { correct: 0, total: 0 };
        }
        updated[currentQuestion.category].total += 1;
        if (isCorrect) {
          updated[currentQuestion.category].correct += 1;
        }
        
        // Save to localStorage
        localStorage.setItem('arboracle_study_progress', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  const startExamSimulation = () => {
    // Generate 200 questions based on weights
    const examQs: Question[] = [];
    
    categories.forEach(category => {
      const weight = examWeights[category as keyof typeof examWeights] || 0;
      const count = Math.round(200 * weight);
      const categoryQuestions = questions.filter(q => q.category === category);
      
      for (let i = 0; i < count && categoryQuestions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
        examQs.push(categoryQuestions[randomIndex]);
      }
    });
    
    // Shuffle exam questions
    const shuffled = examQs.sort(() => Math.random() - 0.5);
    setExamQuestions(shuffled.slice(0, 200));
    setIsExamMode(true);
    setCurrentQuestionIndex(0);
    setExamAnswers({});
    setExamResults(null);
  };

  const submitExam = () => {
    let correct = 0;
    examQuestions.forEach((q, index) => {
      if (examAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    
    setExamResults({ correct, total: examQuestions.length });
  };

  const currentQuestion = isExamMode 
    ? examQuestions[currentQuestionIndex] 
    : filteredQuestions[currentQuestionIndex];

  if (!currentQuestion && !isExamMode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No questions match your criteria. Try adjusting your filters.</p>
      </div>
    );
  }

  if (isExamMode && examResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Exam Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {Math.round((examResults.correct / examResults.total) * 100)}%
              </div>
              <p className="text-gray-600">
                You got {examResults.correct} out of {examResults.total} questions correct
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={() => setIsExamMode(false)} variant="outline">
                Back to Study Mode
              </Button>
              <Button onClick={startExamSimulation}>
                Retake Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategories(categories);
              setSearchTerm('');
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
          
          <Button
            onClick={startExamSimulation}
            className="bg-green-600 hover:bg-green-700"
          >
            Start Exam Simulation
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {!isExamMode && Object.keys(userProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(userProgress).map(([category, progress]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category}</span>
                    <span>{progress.correct}/{progress.total} ({Math.round((progress.correct / progress.total) * 100)}%)</span>
                  </div>
                  <Progress value={(progress.correct / progress.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Display */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {isExamMode ? examQuestions.length : filteredQuestions.length}
              </CardTitle>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {currentQuestion.category}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{currentQuestion.question}</div>
            
            {/* Answer Options */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => isExamMode 
                    ? setExamAnswers(prev => ({ ...prev, [currentQuestionIndex]: key }))
                    : handleAnswerSelect(key)
                  }
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    isExamMode
                      ? examAnswers[currentQuestionIndex] === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      : showAnswer
                        ? key === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : key === selectedAnswer && key !== currentQuestion.correctAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        : selectedAnswer === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={!isExamMode && showAnswer}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{key}.</span>
                    <span>{value}</span>
                    {showAnswer && !isExamMode && (
                      <>
                        {key === currentQuestion.correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                        {key === selectedAnswer && key !== currentQuestion.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                        )}
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Hint Section */}
            {!isExamMode && !showAnswer && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </Button>
              </div>
            )}
            
            {!isExamMode && showHint && !showAnswer && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">{currentQuestion.hint}</p>
              </div>
            )}
            
            {/* Explanation */}
            {!isExamMode && showAnswer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={isExamMode ? () => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1)) : handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {!isExamMode && (
                <Button
                  onClick={handleShowAnswer}
                  disabled={!selectedAnswer || showAnswer}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Check Answer
                </Button>
              )}
              
              {isExamMode && currentQuestionIndex === examQuestions.length - 1 ? (
                <Button
                  onClick={submitExam}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={isExamMode 
                    ? () => setCurrentQuestionIndex(Math.min(examQuestions.length - 1, currentQuestionIndex + 1))
                    : handleNextQuestion
                  }
                  disabled={isExamMode ? false : currentQuestionIndex === filteredQuestions.length - 1}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}