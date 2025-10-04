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
// import QuizEngine from '../components/quiz/QuizEngine';
// import UserChallenges from '../components/quiz/UserChallenges';

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
  const [polls, setPolls] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    correctAnswers: 0,
    totalPoints: 1250,
    level: 5,
    rank: 6
  });

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

  // Dynamic polls with voting functionality
  const initializePolls = () => [
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
      category: "Preferences",
      isActive: true
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
      category: "Upcoming",
      isActive: true
    },
    {
      id: 3,
      question: "What's your preferred movie watching experience?",
      options: [
        { text: "Theater", votes: 89, percentage: 45 },
        { text: "Streaming at Home", votes: 78, percentage: 39 },
        { text: "Drive-in", votes: 20, percentage: 10 },
        { text: "Outdoor Screening", votes: 12, percentage: 6 }
      ],
      totalVotes: 199,
      category: "Experience",
      isActive: true
    }
  ];

  // Dynamic challenges with progress tracking
  const initializeChallenges = () => [
    {
      id: 1,
      title: "Movie Marathon Master",
      description: "Watch 5 movies in a single day",
      reward: 200,
      progress: 3,
      maxProgress: 5,
      type: "Watching",
      difficulty: "Hard",
      icon: "🎬",
      isActive: true,
      timeLeft: "2 days",
      participants: 23
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
      icon: "🧠",
      isActive: true,
      timeLeft: "5 days",
      participants: 45
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
      icon: "🦋",
      isActive: true,
      timeLeft: "3 days",
      participants: 67
    },
    {
      id: 4,
      title: "Genre Explorer",
      description: "Watch one movie from each of the 8 main genres",
      reward: 250,
      progress: 5,
      maxProgress: 8,
      type: "Watching",
      difficulty: "Medium",
      icon: "🎭",
      isActive: true,
      timeLeft: "7 days",
      participants: 34
    }
  ];

  // Dynamic leaderboard with user integration
  const initializeLeaderboard = () => [
    { rank: 1, name: "MovieBuff2024", points: 3450, level: 12, avatar: "🎭", isOnline: true },
    { rank: 2, name: "CinemaLover", points: 3200, level: 11, avatar: "🎬", isOnline: false },
    { rank: 3, name: "FilmFanatic", points: 2980, level: 10, avatar: "🎪", isOnline: true },
    { rank: 4, name: "ScreenTime", points: 2750, level: 9, avatar: "🎨", isOnline: false },
    { rank: 5, name: "MovieMaven", points: 2600, level: 9, avatar: "🎯", isOnline: true },
    { rank: 6, name: "You", points: 1250, level: 5, avatar: "🎮", isOnline: true, isCurrentUser: true }
  ];

  useEffect(() => {
    console.log('Initializing Movie Quizzes data...');
    try {
      setLeaderboard(initializeLeaderboard());
      setUserChallenges(initializeChallenges());
      setPolls(initializePolls());
      setChallenges(initializeChallenges());
      console.log('Movie Quizzes data initialized successfully');
    } catch (error) {
      console.error('Error initializing Movie Quizzes data:', error);
    }
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
    setUserStats(prev => ({
      ...prev,
      totalQuizzes: prev.totalQuizzes + 1,
      totalPoints: prev.totalPoints + quizScore
    }));
    // Add completion logic here
  };

  // Dynamic poll voting functionality
  const handleVote = (pollId, optionIndex) => {
    console.log('Voting on poll:', pollId, 'option:', optionIndex);
    if (userVotes[pollId]) {
      alert('You have already voted on this poll!');
      return;
    }

    setPolls(prevPolls => {
      return prevPolls.map(poll => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map((option, index) => {
            if (index === optionIndex) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          });

          const newTotalVotes = poll.totalVotes + 1;
          const updatedOptionsWithPercentage = updatedOptions.map(option => ({
            ...option,
            percentage: Math.round((option.votes / newTotalVotes) * 100)
          }));

          return {
            ...poll,
            options: updatedOptionsWithPercentage,
            totalVotes: newTotalVotes
          };
        }
        return poll;
      });
    });

    setUserVotes(prev => ({ ...prev, [pollId]: optionIndex }));
    setUserPoints(prev => prev + 10); // Award points for voting
  };

  // Dynamic challenge progress update
  const updateChallengeProgress = (challengeId, increment = 1) => {
    console.log('Updating challenge progress:', challengeId, 'increment:', increment);
    setUserChallenges(prevChallenges => {
      return prevChallenges.map(challenge => {
        if (challenge.id === challengeId) {
          const newProgress = Math.min(challenge.progress + increment, challenge.maxProgress);
          const isCompleted = newProgress >= challenge.maxProgress;
          
          if (isCompleted && challenge.progress < challenge.maxProgress) {
            // Award points for completion
            setUserPoints(prev => prev + challenge.reward);
            setUserStats(prev => ({
              ...prev,
              totalPoints: prev.totalPoints + challenge.reward
            }));
          }

          return {
            ...challenge,
            progress: newProgress,
            isCompleted
          };
        }
        return challenge;
      });
    });
  };

  // Dynamic leaderboard update
  const updateLeaderboard = () => {
    setLeaderboard(prevLeaderboard => {
      return prevLeaderboard.map(user => {
        if (user.isCurrentUser) {
          return {
            ...user,
            points: userPoints,
            level: Math.floor(userPoints / 250) + 1
          };
        }
        return user;
      }).sort((a, b) => b.points - a.points).map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    });
  };

  // Update leaderboard when points change
  useEffect(() => {
    updateLeaderboard();
  }, [userPoints]);

  // Test function to verify features are working
  const testFeatures = () => {
    console.log('Testing Movie Quizzes features...');
    console.log('Polls:', polls.length);
    console.log('Challenges:', userChallenges.length);
    console.log('Leaderboard:', leaderboard.length);
    console.log('User Points:', userPoints);
    console.log('User Votes:', userVotes);
  };

  // Test on component mount
  useEffect(() => {
    setTimeout(testFeatures, 1000);
  }, [polls, userChallenges, leaderboard]);

  // Simulate real-time leaderboard updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prevLeaderboard => {
        return prevLeaderboard.map(user => {
          if (!user.isCurrentUser && Math.random() > 0.7) {
            // Randomly update other users' points
            const pointChange = Math.floor(Math.random() * 50) - 25; // -25 to +25
            return {
              ...user,
              points: Math.max(0, user.points + pointChange),
              level: Math.floor((user.points + pointChange) / 250) + 1
            };
          }
          return user;
        }).sort((a, b) => b.points - a.points).map((user, index) => ({
          ...user,
          rank: index + 1
        }));
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

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

  const getTypeColor = (type) => {
    switch (type) {
      case 'Watching': return 'text-blue-500 bg-blue-100';
      case 'Trivia': return 'text-purple-500 bg-purple-100';
      case 'Social': return 'text-pink-500 bg-pink-100';
      default: return 'text-gray-500 bg-gray-100';
    }
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
              <button
                onClick={testFeatures}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold py-2 px-3 rounded-lg transition-all text-sm"
              >
                Test Features
              </button>
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
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold mb-4">🧠 {currentQuiz.question}</h3>
                    <div className="space-y-3 mb-6">
                      {currentQuiz.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const isCorrect = index === currentQuiz.correct;
                            if (isCorrect) {
                              setQuizScore(prev => prev + currentQuiz.points);
                              setUserPoints(prev => prev + currentQuiz.points);
                            }
                            setCurrentQuiz(null);
                            setQuizScore(0);
                          }}
                          className="w-full text-left p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentQuiz(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      Back to Quizzes
                    </button>
                  </div>
                </div>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">📊 Movie Polls</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300">
                    Vote and earn 10 points per poll!
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {polls.map((poll) => (
                  <motion.div 
                    key={poll.id} 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{poll.question}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">{poll.totalVotes} votes</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          poll.category === 'Preferences' ? 'bg-blue-100 text-blue-600' :
                          poll.category === 'Upcoming' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {poll.category}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {poll.options.map((option, index) => (
                        <motion.div 
                          key={index} 
                          className="space-y-2"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex justify-between text-sm">
                            <span>{option.text}</span>
                            <span className="font-semibold">{option.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <motion.div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                              initial={{ width: 0 }}
                              animate={{ width: `${option.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            ></motion.div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{option.votes} votes</span>
                            {userVotes[poll.id] === index && (
                              <span className="text-green-400 font-semibold">✓ Your vote</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {userVotes[poll.id] !== undefined ? (
                      <div className="w-full mt-4 bg-green-500/20 text-green-400 font-semibold py-2 px-4 rounded-lg text-center">
                        ✓ You voted! (+10 points)
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {poll.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleVote(poll.id, index)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-3 rounded-lg transition-all text-sm"
                          >
                            Vote: {option.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
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
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">🎯 Your Challenges</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300">
                    Complete challenges to earn rewards!
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Active</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{challenge.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{challenge.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
                            {challenge.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{challenge.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {challenge.timeLeft}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants}
                          </span>
                        </div>
                        <span className="text-yellow-400 font-bold">+{challenge.reward} pts</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateChallengeProgress(challenge.id, 1)}
                          disabled={challenge.progress >= challenge.maxProgress}
                          className={`flex-1 font-semibold py-2 px-3 rounded-lg transition-all text-sm ${
                            challenge.progress >= challenge.maxProgress
                              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                          }`}
                        >
                          {challenge.progress >= challenge.maxProgress ? (
                            <>
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Completed
                            </>
                          ) : (
                            'Update Progress'
                          )}
                        </button>
                        {challenge.progress >= challenge.maxProgress && (
                          <button
                            onClick={() => {
                              setUserPoints(prev => prev + challenge.reward);
                              alert(`Challenge completed! You earned ${challenge.reward} points!`);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-lg transition-all text-sm"
                          >
                            Claim Reward
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">🏆 Top Movie Experts</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-300">
                      Updated in real-time
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Live</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <motion.div 
                      key={user.rank} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        user.isCurrentUser 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-500 text-black' :
                          user.isCurrentUser ? 'bg-purple-500 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {user.rank}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{user.avatar}</span>
                          <div>
                            <div className={`font-semibold ${user.isCurrentUser ? 'text-purple-300' : ''}`}>
                              {user.name}
                              {user.isCurrentUser && <span className="text-xs text-purple-400 ml-2">(You)</span>}
                            </div>
                            <div className="text-sm text-gray-300">
                              Level {user.level} • {user.isOnline ? '🟢 Online' : '🔴 Offline'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-400">{user.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-300">points</div>
                        {index < 3 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {index === 0 ? '🥇 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third Place'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* User Stats Summary */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3">Your Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{userStats.totalQuizzes}</div>
                      <div className="text-sm text-gray-300">Quizzes Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{userStats.correctAnswers}</div>
                      <div className="text-sm text-gray-300">Correct Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{userStats.totalPoints}</div>
                      <div className="text-sm text-gray-300">Total Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">#{userStats.rank}</div>
                      <div className="text-sm text-gray-300">Current Rank</div>
                    </div>
                  </div>
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
