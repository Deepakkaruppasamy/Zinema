import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Award, 
  Target,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Brain
} from 'lucide-react';
import QuizEngine from '../components/quiz/QuizEngine';
import UserChallenges from '../components/quiz/UserChallenges';

const MovieQuizzes = () => {
  const [activeTab, setActiveTab] = useState('trivia');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(5);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);

  // Sample trivia questions
  const triviaQuestions = [
    {
      id: 1,
      question: "Which movie won the Academy Award for Best Picture in 2023?",
      options: ["Everything Everywhere All at Once", "The Banshees of Inisherin", "Top Gun: Maverick", "Avatar: The Way of Water"],
      correct: 0,
      points: 50,
      category: "Awards",
      difficulty: "Medium"
    },
    {
      id: 2,
      question: "Who directed the movie 'Inception'?",
      options: ["Steven Spielberg", "Christopher Nolan", "Martin Scorsese", "Quentin Tarantino"],
      correct: 1,
      points: 30,
      category: "Directors",
      difficulty: "Easy"
    },
    {
      id: 3,
      question: "What is the highest-grossing movie of all time?",
      options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"],
      correct: 0,
      points: 40,
      category: "Box Office",
      difficulty: "Medium"
    },
    {
      id: 4,
      question: "Which actor played the Joker in 'The Dark Knight'?",
      options: ["Joaquin Phoenix", "Heath Ledger", "Jared Leto", "Jack Nicholson"],
      correct: 1,
      points: 35,
      category: "Actors",
      difficulty: "Easy"
    },
    {
      id: 5,
      question: "What year was the first 'Star Wars' movie released?",
      options: ["1975", "1977", "1979", "1981"],
      correct: 1,
      points: 45,
      category: "History",
      difficulty: "Hard"
    }
  ];

  // Sample polls
  const moviePolls = [
    {
      id: 1,
      question: "What's your favorite movie genre?",
      options: [
        { text: "Action", votes: 45, percentage: 35 },
        { text: "Comedy", votes: 32, percentage: 25 },
        { text: "Drama", votes: 28, percentage: 22 },
        { text: "Horror", votes: 23, percentage: 18 }
      ],
      totalVotes: 128,
      category: "Preferences"
    },
    {
      id: 2,
      question: "Which upcoming movie are you most excited about?",
      options: [
        { text: "Dune: Part Two", votes: 67, percentage: 42 },
        { text: "Spider-Man: Across the Spider-Verse", votes: 45, percentage: 28 },
        { text: "Oppenheimer", votes: 32, percentage: 20 },
        { text: "Barbie", votes: 16, percentage: 10 }
      ],
      totalVotes: 160,
      category: "Upcoming"
    }
  ];

  // Sample challenges
  const challenges = [
    {
      id: 1,
      title: "Movie Marathon Master",
      description: "Watch 5 movies in a single day",
      reward: 200,
      progress: 3,
      maxProgress: 5,
      type: "Watching",
      difficulty: "Hard",
      icon: "🎬"
    },
    {
      id: 2,
      title: "Trivia Champion",
      description: "Answer 20 trivia questions correctly",
      reward: 150,
      progress: 12,
      maxProgress: 20,
      type: "Trivia",
      difficulty: "Medium",
      icon: "🧠"
    },
    {
      id: 3,
      title: "Social Butterfly",
      description: "Share 10 movie reviews",
      reward: 100,
      progress: 7,
      maxProgress: 10,
      type: "Social",
      difficulty: "Easy",
      icon: "🦋"
    }
  ];

  // Sample leaderboard
  const sampleLeaderboard = [
    { rank: 1, name: "MovieBuff2024", points: 3450, level: 12, avatar: "🎭" },
    { rank: 2, name: "CinemaLover", points: 3200, level: 11, avatar: "🎬" },
    { rank: 3, name: "FilmFanatic", points: 2980, level: 10, avatar: "🎪" },
    { rank: 4, name: "ScreenTime", points: 2750, level: 9, avatar: "🎨" },
    { rank: 5, name: "MovieMaven", points: 2600, level: 9, avatar: "🎯" }
  ];

  useEffect(() => {
    setLeaderboard(sampleLeaderboard);
    setUserChallenges(challenges);
  }, []);

  useEffect(() => {
    let timer;
    if (isQuizActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleQuizEnd();
    }
    return () => clearTimeout(timer);
  }, [isQuizActive, timeLeft]);

  const startQuiz = (quizId) => {
    const quiz = triviaQuestions.find(q => q.id === quizId);
    setCurrentQuiz(quiz);
    setIsQuizActive(true);
    setTimeLeft(30);
    setQuizScore(0);
  };

  const handleQuizEnd = () => {
    setIsQuizActive(false);
    setUserPoints(prev => prev + quizScore);
    // Add completion logic here
  };

  const submitAnswer = (selectedOption) => {
    if (selectedOption === currentQuiz.correct) {
      setQuizScore(prev => prev + currentQuiz.points);
    }
    // Move to next question or end quiz
    handleQuizEnd();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-100';
      case 'Medium': return 'text-yellow-500 bg-yellow-100';
      case 'Hard': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getLevelColor = (level) => {
    if (level >= 10) return 'text-purple-600';
    if (level >= 5) return 'text-blue-600';
    return 'text-green-600';
  };

  const tabs = [
    { id: 'trivia', label: 'Trivia Games', icon: Brain },
    { id: 'polls', label: 'Movie Polls', icon: TrendingUp },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                🎮 Movie Quizzes & Trivia
              </h1>
              <p className="text-gray-300 mt-2">Test your movie knowledge and compete with friends!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{userPoints}</div>
                <div className="text-sm text-gray-300">Points</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getLevelColor(userLevel)}`}>Level {userLevel}</div>
                <div className="text-sm text-gray-300">Movie Expert</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-black/20 rounded-lg p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'trivia' && (
            <motion.div
              key="trivia"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {currentQuiz ? (
                <QuizEngine
                  questions={[currentQuiz]}
                  onComplete={(result) => {
                    setCurrentQuiz(null);
                    setUserPoints(prev => prev + result.score);
                  }}
                  timeLimit={30}
                  showTimer={true}
                  allowSkip={false}
                  showHints={false}
                />
              ) : (
                <div>
                  <h3 className="text-2xl font-bold mb-6">🧠 Choose Your Trivia Challenge</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {triviaQuestions.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                          <span className="text-yellow-400 font-bold">{quiz.points} pts</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{quiz.question}</h3>
                        <p className="text-gray-300 text-sm mb-4">{quiz.category}</p>
                        <button
                          onClick={() => setCurrentQuiz(quiz)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          Start Quiz
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'polls' && (
            <motion.div
              key="polls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {moviePolls.map((poll) => (
                  <div key={poll.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{poll.question}</h3>
                      <span className="text-sm text-gray-300">{poll.totalVotes} votes</span>
                    </div>
                    <div className="space-y-3">
                      {poll.options.map((option, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{option.text}</span>
                            <span>{option.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${option.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                      Vote Now
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserChallenges />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-center">🏆 Top Movie Experts</h3>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.rank} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-500 text-black' :
                          'bg-gray-600 text-white'
                        }`}>
                          {user.rank}
                        </div>
                        <span className="text-2xl">{user.avatar}</span>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-300">Level {user.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-400">{user.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-300">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz Modal */}
        {currentQuiz && isQuizActive && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-2xl w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🧠</div>
                  <div>
                    <h3 className="text-xl font-bold">Trivia Challenge</h3>
                    <p className="text-gray-300">{currentQuiz.category} • {currentQuiz.points} points</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-400">{timeLeft}s</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">{currentQuiz.question}</h4>
                <div className="space-y-3">
                  {currentQuiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => submitAnswer(index)}
                      className="w-full text-left p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-yellow-400 font-bold">Score: {quizScore} points</div>
                <button
                  onClick={handleQuizEnd}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  End Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieQuizzes;
