'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Trophy, Target, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

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

export function StudyGuide() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [studyMode, setStudyMode] = useState<'practice' | 'exam'>('practice');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examStarted, setExamStarted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  // Load questions from public/questions.json
  useEffect(() => {
    fetch('/questions.json')
      .then(response => response.json())
      .then(data => {
        setQuestions(data);
        setFilteredQuestions(data);
      })
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  // Get unique categories
  const categories = ['All Categories', ...Array.from(new Set(questions.map(q => q.category)))];

  // Filter questions based on category and search
  useEffect(() => {
    let filtered = questions;
    
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredQuestions(filtered);
  }, [questions, selectedCategory, searchTerm]);

  const startPractice = () => {
    if (filteredQuestions.length > 0) {
      const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      setCurrentQuestion(randomQuestion);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const startExamSimulation = () => {
    // Create weighted exam with domain percentages (based on typical arborist exam structure)
    const domainWeights = {
      'Tree Physiology': 15,
      'Soil Management': 10,
      'Pruning': 20,
      'Tree Protection': 15,
      'Risk Assessment': 15,
      'Urban Forestry': 10,
      'Plant Health Care': 15
    };
    
    let examSet: Question[] = [];
    Object.entries(domainWeights).forEach(([category, percentage]) => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const numQuestions = Math.floor((percentage / 100) * 50); // 50 question exam
      
      for (let i = 0; i < numQuestions && categoryQuestions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
        examSet.push(categoryQuestions[randomIndex]);
        categoryQuestions.splice(randomIndex, 1);
      }
    });
    
    setExamQuestions(examSet);
    setCurrentQuestion(examSet[0] || null);
    setExamStarted(true);
    setExamScore(0);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowResult(true);
    
    if (studyMode === 'practice') {
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    } else {
      setExamScore(prev => prev + (isCorrect ? 1 : 0));
    }
  };

  const nextQuestion = () => {
    if (studyMode === 'exam' && examQuestions.length > 0) {
      const currentIndex = examQuestions.findIndex(q => q.id === currentQuestion?.id);
      if (currentIndex < examQuestions.length - 1) {
        setCurrentQuestion(examQuestions[currentIndex + 1]);
        setSelectedAnswer('');
        setShowResult(false);
      } else {
        // Exam complete
        setExamStarted(false);
        setCurrentQuestion(null);
      }
    } else {
      startPractice();
    }
  };

  const resetStudy = () => {
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setExamStarted(false);
    setExamScore(0);
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-3xl">📚</span>
          <h2 className="text-2xl font-bold text-green-800">Bodhi&apos;s Study Guide</h2>
        </div>
        <p className="text-green-600">
          Master arborist certification with AI-powered study assistance
        </p>
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</div>
            <div className="text-sm text-gray-600">Practice Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{score.correct}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
            <div className="text-sm text-gray-600">Study Categories</div>
          </CardContent>
        </Card>
      </div>

      {!currentQuestion ? (
        <div className="space-y-6">
          {/* Study Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Choose Study Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => { setStudyMode('practice'); startPractice(); }}
                  className="h-auto p-6 flex flex-col gap-2"
                  variant={studyMode === 'practice' ? 'default' : 'outline'}
                >
                  <Target className="w-8 h-8" />
                  <div className="font-semibold">Practice Mode</div>
                  <div className="text-sm opacity-80">Study individual questions with immediate feedback</div>
                </Button>
                <Button 
                  onClick={() => { setStudyMode('exam'); startExamSimulation(); }}
                  className="h-auto p-6 flex flex-col gap-2"
                  variant={studyMode === 'exam' ? 'default' : 'outline'}
                >
                  <Trophy className="w-8 h-8" />
                  <div className="font-semibold">Exam Simulation</div>
                  <div className="text-sm opacity-80">Take a 50-question practice exam</div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters for Practice Mode */}
          {studyMode === 'practice' && (
            <Card>
              <CardHeader>
                <CardTitle>Study Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search Questions</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {filteredQuestions.length} questions available
                  </Badge>
                  <Button onClick={resetStudy} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Question Display */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{currentQuestion.category}</Badge>
              {studyMode === 'exam' && (
                <Badge variant="outline">
                  Question {examQuestions.findIndex(q => q.id === currentQuestion.id) + 1} of {examQuestions.length}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedAnswer === key ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-4 ${
                    showResult 
                      ? key === currentQuestion.correctAnswer 
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : key === selectedAnswer && key !== currentQuestion.correctAnswer
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'opacity-50'
                      : ''
                  }`}
                  onClick={() => !showResult && setSelectedAnswer(key)}
                  disabled={showResult}
                >
                  <span className="font-semibold mr-3">{key}.</span>
                  <span>{value}</span>
                  {showResult && key === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                  )}
                  {showResult && key === selectedAnswer && key !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 ml-auto text-red-600" />
                  )}
                </Button>
              ))}
            </div>

            {/* Result and Explanation */}
            {showResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    selectedAnswer === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
                {currentQuestion.hint && (
                  <p className="text-blue-700 text-sm">
                    <strong>Hint:</strong> {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!showResult ? (
                <Button 
                  onClick={submitAnswer} 
                  disabled={!selectedAnswer}
                  className="flex-1"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="flex-1">
                  {studyMode === 'exam' && examQuestions.findIndex(q => q.id === currentQuestion.id) === examQuestions.length - 1
                    ? 'Finish Exam'
                    : 'Next Question'
                  }
                </Button>
              )}
              <Button variant="outline" onClick={resetStudy}>
                Exit Study
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exam Results */}
      {studyMode === 'exam' && !examStarted && examQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Exam Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-600">
                {Math.round((examScore / examQuestions.length) * 100)}%
              </div>
              <p className="text-gray-600">
                You scored {examScore} out of {examQuestions.length} questions correctly
              </p>
              <Progress value={(examScore / examQuestions.length) * 100} className="w-full" />
              <div className="flex gap-3 justify-center">
                <Button onClick={() => startExamSimulation()}>
                  Retake Exam
                </Button>
                <Button variant="outline" onClick={resetStudy}>
                  Return to Study
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}