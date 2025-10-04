import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Trophy, 
  Star, 
  Zap, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';

const QuizEngine = ({ 
  questions, 
  onComplete, 
  timeLimit = 30, 
  showTimer = true,
  allowSkip = false,
  showHints = false 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    let timer;
    if (isActive && !isPaused && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [isActive, isPaused, timeLeft]);

  const startQuiz = () => {
    setIsActive(true);
    setTimeLeft(timeLimit);
  };

  const handleTimeUp = () => {
    setIsActive(false);
    setShowResult(true);
    setTimeout(() => {
      onComplete({
        score,
        totalQuestions: questions.length,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        streak: maxStreak,
        timeSpent: (timeLimit - timeLeft)
      });
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correct,
      isCorrect,
      timeSpent: timeLimit - timeLeft
    }]);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(timeLimit);
      } else {
        handleTimeUp();
      }
    }, 1500);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipQuestion = () => {
    if (!allowSkip) return;
    handleAnswerSelect(-1); // -1 indicates skipped
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-100';
      case 'Medium': return 'text-yellow-500 bg-yellow-100';
      case 'Hard': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStreakColor = () => {
    if (streak >= 5) return 'text-purple-500';
    if (streak >= 3) return 'text-blue-500';
    if (streak >= 2) return 'text-green-500';
    return 'text-gray-500';
  };

  if (!isActive && !showResult) {
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
        >
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-4">Ready for the Challenge?</h2>
          <p className="text-gray-300 mb-6">
            {questions.length} questions • {timeLimit}s per question • {questions.reduce((sum, q) => sum + q.points, 0)} total points
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{questions.reduce((sum, q) => sum + q.points, 0)}</div>
              <div className="text-sm text-gray-300">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{timeLimit}s</div>
              <div className="text-sm text-gray-300">Per Question</div>
            </div>
          </div>
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all text-lg"
          >
            <Play className="w-5 h-5 inline mr-2" />
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (showResult) {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-sm text-gray-300">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{correctAnswers}/{questions.length}</div>
              <div className="text-sm text-gray-300">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
              <div className="text-sm text-gray-300">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{maxStreak}</div>
              <div className="text-sm text-gray-300">Best Streak</div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-sm">Question {index + 1}</span>
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{answer.timeSpent}s</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Play Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">🧠</div>
          <div>
            <h3 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h3>
            <p className="text-gray-300">{currentQuestion.category} • {currentQuestion.points} points</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showTimer && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                {timeLeft}s
              </span>
            </div>
          )}
          <button
            onClick={togglePause}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
            {currentQuestion.difficulty}
          </span>
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${getStreakColor()}`} />
            <span className={`font-bold ${getStreakColor()}`}>Streak: {streak}</span>
          </div>
        </div>
        
        <h4 className="text-xl font-semibold mb-6">{currentQuestion.question}</h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedAnswer === null
                  ? 'bg-white/10 hover:bg-white/20 border-white/20'
                  : selectedAnswer === index
                  ? index === currentQuestion.correct
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-red-500/20 border-red-500 text-red-400'
                  : index === currentQuestion.correct
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
              whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
              whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {selectedAnswer !== null && (
                  <div>
                    {index === currentQuestion.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : selectedAnswer === index ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {allowSkip && (
          <button
            onClick={skipQuestion}
            className="w-full mt-4 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Skip Question
          </button>
        )}
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-between">
        <div className="text-yellow-400 font-bold">Score: {score} points</div>
        <div className="text-sm text-gray-300">
          {answers.filter(a => a.isCorrect).length} correct so far
        </div>
      </div>
    </motion.div>
  );
};

export default QuizEngine;
