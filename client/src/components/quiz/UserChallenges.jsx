import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Trophy, 
  Star, 
  Clock, 
  Users, 
  Zap,
  CheckCircle,
  Plus,
  Share2,
  Heart
} from 'lucide-react';

const UserChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'Watching',
    difficulty: 'Medium',
    reward: 100,
    maxParticipants: 50
  });

  // Sample challenges
  const sampleChallenges = [
    {
      id: 1,
      title: "Marvel Marathon Master",
      description: "Watch all 5 Marvel movies released this year",
      creator: "MovieBuff2024",
      type: "Watching",
      difficulty: "Hard",
      reward: 500,
      participants: 23,
      maxParticipants: 100,
      progress: 0,
      maxProgress: 5,
      icon: "🎬",
      tags: ["Marvel", "Action", "Superhero"],
      timeLeft: "7 days",
      isJoined: false
    },
    {
      id: 2,
      title: "Trivia Titan",
      description: "Answer 50 movie trivia questions correctly in a row",
      creator: "QuizMaster",
      type: "Trivia",
      difficulty: "Medium",
      reward: 300,
      participants: 45,
      maxParticipants: 50,
      progress: 0,
      maxProgress: 50,
      icon: "🧠",
      tags: ["Trivia", "Knowledge", "Challenge"],
      timeLeft: "3 days",
      isJoined: false
    },
    {
      id: 3,
      title: "Social Cinema",
      description: "Share 10 movie reviews and get 50 likes total",
      creator: "SocialButterfly",
      type: "Social",
      difficulty: "Easy",
      reward: 150,
      participants: 67,
      maxParticipants: 100,
      progress: 0,
      maxProgress: 10,
      icon: "🦋",
      tags: ["Social", "Reviews", "Community"],
      timeLeft: "5 days",
      isJoined: false
    },
    {
      id: 4,
      title: "Genre Explorer",
      description: "Watch one movie from each of the 8 main genres",
      creator: "GenreGuru",
      type: "Watching",
      difficulty: "Medium",
      reward: 250,
      participants: 34,
      maxParticipants: 75,
      progress: 0,
      maxProgress: 8,
      icon: "🎭",
      tags: ["Genres", "Exploration", "Diversity"],
      timeLeft: "10 days",
      isJoined: false
    }
  ];

  // User's active challenges
  const sampleUserChallenges = [
    {
      id: 5,
      title: "Horror Night",
      description: "Watch 3 horror movies this week",
      type: "Watching",
      difficulty: "Medium",
      reward: 200,
      progress: 2,
      maxProgress: 3,
      icon: "👻",
      timeLeft: "2 days",
      isJoined: true
    },
    {
      id: 6,
      title: "Quick Quiz",
      description: "Answer 10 questions in under 2 minutes",
      type: "Trivia",
      difficulty: "Hard",
      reward: 150,
      progress: 7,
      maxProgress: 10,
      icon: "⚡",
      timeLeft: "1 day",
      isJoined: true
    }
  ];

  useEffect(() => {
    setChallenges(sampleChallenges);
    setUserChallenges(sampleUserChallenges);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-100';
      case 'Medium': return 'text-yellow-500 bg-yellow-100';
      case 'Hard': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Watching': return 'text-blue-500 bg-blue-100';
      case 'Trivia': return 'text-purple-500 bg-purple-100';
      case 'Social': return 'text-pink-500 bg-pink-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const joinChallenge = (challengeId) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isJoined: true, participants: challenge.participants + 1 }
        : challenge
    ));
  };

  const createChallenge = () => {
    const challenge = {
      id: Date.now(),
      ...newChallenge,
      creator: "You",
      participants: 1,
      progress: 0,
      maxProgress: 1,
      icon: "🎯",
      tags: [newChallenge.type],
      timeLeft: "7 days",
      isJoined: true
    };
    
    setUserChallenges(prev => [...prev, challenge]);
    setShowCreateModal(false);
    setNewChallenge({
      title: '',
      description: '',
      type: 'Watching',
      difficulty: 'Medium',
      reward: 100,
      maxParticipants: 50
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🎯 User Challenges</h2>
          <p className="text-gray-300">Join community challenges or create your own!</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Challenge
        </button>
      </div>

      {/* User's Active Challenges */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Your Active Challenges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.02 }}
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
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {challenge.timeLeft}
                    </span>
                    <span className="text-yellow-400 font-bold">+{challenge.reward} pts</span>
                  </div>
                  <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold py-1 px-3 rounded-lg transition-all text-sm">
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Community Challenges */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Community Challenges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{challenge.title}</h4>
                  <p className="text-sm text-gray-400">by {challenge.creator}</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{challenge.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {challenge.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-300">
                    <Users className="w-4 h-4" />
                    {challenge.participants}/{challenge.maxParticipants}
                  </span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-4 h-4" />
                    {challenge.timeLeft}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
                      {challenge.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold">+{challenge.reward} pts</span>
                </div>
                
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  disabled={challenge.isJoined}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-all ${
                    challenge.isJoined
                      ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  }`}
                >
                  {challenge.isJoined ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Joined
                    </>
                  ) : (
                    'Join Challenge'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-bold mb-6">Create New Challenge</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Challenge Title</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  placeholder="Enter challenge title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
                  placeholder="Describe your challenge"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Watching">Watching</option>
                    <option value="Trivia">Trivia</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={newChallenge.difficulty}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reward Points</label>
                  <input
                    type="number"
                    value={newChallenge.reward}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, reward: parseInt(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    min="50"
                    max="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={newChallenge.maxParticipants}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    min="2"
                    max="100"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createChallenge}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Create Challenge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserChallenges;
