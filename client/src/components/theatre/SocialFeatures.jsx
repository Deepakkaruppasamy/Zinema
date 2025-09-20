import React, { useState, useEffect } from 'react';
import { FaUsers, FaHeart, FaComment, FaShare, FaUserPlus, FaUserCheck, FaStar, FaCamera, FaVideo, FaMapMarkerAlt, FaClock, FaThumbsUp, FaReply, FaEllipsisH, FaCrown, FaFire, FaTrophy, FaCalendar, FaMedal } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SocialFeatures = ({ userId, onUserSelect, onGroupCreate }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image: null, movie: null });
  const [newGroup, setNewGroup] = useState({ name: '', description: '', privacy: 'public' });

  useEffect(() => {
    if (userId) {
      fetchSocialData();
    }
  }, [userId]);

  const fetchSocialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPosts(),
        fetchFriends(),
        fetchGroups(),
        fetchEvents()
      ]);
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    const mockPosts = [
      {
        id: 1,
        user: {
          id: 'user1',
          name: 'Alex Johnson',
          avatar: '👨‍💼',
          tier: 'GOLD',
          isVerified: true
        },
        content: 'Just watched Avatar: The Way of Water in IMAX! The visuals were absolutely stunning. Highly recommend! 🎬✨',
        image: 'https://img.freepik.com/free-photo/movie-theater_144627-16140.jpg?w=400',
        movie: {
          title: 'Avatar: The Way of Water',
          rating: 8.2,
          theatre: 'PVR IMAX'
        },
        likes: 24,
        comments: 8,
        shares: 3,
        isLiked: false,
        createdAt: '2 hours ago',
        location: 'PVR Cinemas, Phoenix MarketCity'
      },
      {
        id: 2,
        user: {
          id: 'user2',
          name: 'Sarah Wilson',
          avatar: '👩‍🎨',
          tier: 'PLATINUM',
          isVerified: true
        },
        content: 'Movie night with friends! Top Gun: Maverick never gets old. The action sequences are incredible! 🚁✈️',
        image: 'https://img.freepik.com/free-photo/friends-watching-movie_144627-16141.jpg?w=400',
        movie: {
          title: 'Top Gun: Maverick',
          rating: 8.7,
          theatre: 'INOX Megaplex'
        },
        likes: 18,
        comments: 12,
        shares: 5,
        isLiked: true,
        createdAt: '4 hours ago',
        location: 'INOX Megaplex, Forum Mall'
      },
      {
        id: 3,
        user: {
          id: 'user3',
          name: 'Mike Chen',
          avatar: '👨‍💻',
          tier: 'SILVER',
          isVerified: false
        },
        content: 'The Batman was dark and intense. Perfect for a late night viewing. Robert Pattinson nailed it! 🦇',
        image: null,
        movie: {
          title: 'The Batman',
          rating: 7.8,
          theatre: 'Cinepolis'
        },
        likes: 15,
        comments: 6,
        shares: 2,
        isLiked: false,
        createdAt: '6 hours ago',
        location: 'Cinepolis, Select City Walk'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 800));
    setPosts(mockPosts);
  };

  const fetchFriends = async () => {
    const mockFriends = [
      { id: 'user1', name: 'Alex Johnson', avatar: '👨‍💼', tier: 'GOLD', isOnline: true, lastSeen: '2 min ago' },
      { id: 'user2', name: 'Sarah Wilson', avatar: '👩‍🎨', tier: 'PLATINUM', isOnline: true, lastSeen: '5 min ago' },
      { id: 'user3', name: 'Mike Chen', avatar: '👨‍💻', tier: 'SILVER', isOnline: false, lastSeen: '1 hour ago' },
      { id: 'user4', name: 'Emma Davis', avatar: '👩‍🎓', tier: 'GOLD', isOnline: true, lastSeen: '10 min ago' },
      { id: 'user5', name: 'David Brown', avatar: '👨‍🎤', tier: 'BRONZE', isOnline: false, lastSeen: '3 hours ago' }
    ];

    await new Promise(resolve => setTimeout(resolve, 600));
    setFriends(mockFriends);
  };

  const fetchGroups = async () => {
    const mockGroups = [
      {
        id: 1,
        name: 'Marvel Fans United',
        description: 'For all Marvel movie enthusiasts',
        members: 1250,
        isJoined: true,
        avatar: '🦸‍♂️',
        privacy: 'public',
        recentActivity: 'New post about Spider-Man',
        createdBy: 'Alex Johnson'
      },
      {
        id: 2,
        name: 'Horror Movie Lovers',
        description: 'Share your favorite horror movies and experiences',
        members: 890,
        isJoined: false,
        avatar: '👻',
        privacy: 'public',
        recentActivity: 'Discussion about latest horror releases',
        createdBy: 'Sarah Wilson'
      },
      {
        id: 3,
        name: 'IMAX Enthusiasts',
        description: 'Premium movie experience discussions',
        members: 450,
        isJoined: true,
        avatar: '🎬',
        privacy: 'private',
        recentActivity: 'New IMAX screening announced',
        createdBy: 'Mike Chen'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 400));
    setGroups(mockGroups);
  };

  const fetchEvents = async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Marvel Movie Marathon',
        description: 'Watch all Marvel movies in chronological order',
        date: '2024-02-15',
        time: '10:00 AM',
        location: 'PVR Cinemas, Phoenix MarketCity',
        attendees: 45,
        maxAttendees: 100,
        isJoined: true,
        organizer: 'Alex Johnson',
        type: 'marathon'
      },
      {
        id: 2,
        title: 'Horror Movie Night',
        description: 'Scary movies and popcorn night',
        date: '2024-02-20',
        time: '8:00 PM',
        location: 'INOX Megaplex, Forum Mall',
        attendees: 23,
        maxAttendees: 50,
        isJoined: false,
        organizer: 'Sarah Wilson',
        type: 'themed'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 300));
    setEvents(mockEvents);
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
  };

  const handleShare = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
  };

  const handleJoinGroup = (groupId) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: !group.isJoined, members: group.isJoined ? group.members - 1 : group.members + 1 }
        : group
    ));
  };

  const handleJoinEvent = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isJoined: !event.isJoined, attendees: event.isJoined ? event.attendees - 1 : event.attendees + 1 }
        : event
    ));
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'BRONZE': return <FaMedal className="text-orange-400" />;
      case 'SILVER': return <FaMedal className="text-gray-300" />;
      case 'GOLD': return <FaTrophy className="text-yellow-400" />;
      case 'PLATINUM': return <FaCrown className="text-purple-400" />;
      default: return <FaStar className="text-gray-400" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'BRONZE': return 'text-orange-400';
      case 'SILVER': return 'text-gray-300';
      case 'GOLD': return 'text-yellow-400';
      case 'PLATINUM': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const tabs = [
    { id: 'feed', name: 'Feed', icon: <FaUsers /> },
    { id: 'friends', name: 'Friends', icon: <FaUserCheck /> },
    { id: 'groups', name: 'Groups', icon: <FaUsers /> },
    { id: 'events', name: 'Events', icon: <FaCalendar /> }
  ];

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800/50 rounded"></div>
          <div className="h-64 bg-gray-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <FaUsers className="text-primary text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Social Features</h3>
            <p className="text-gray-400 text-sm">Connect with fellow movie lovers</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreatePost(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
        >
          Create Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800/30 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/30 rounded-xl p-6 border border-white/10"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{post.user.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-white">{post.user.name}</h4>
                        {post.user.isVerified && (
                          <FaUserCheck className="text-blue-400" />
                        )}
                        {getTierIcon(post.user.tier)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{post.createdAt}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          {post.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <FaEllipsisH className="text-gray-400" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-300 mb-3">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-64 object-cover rounded-lg mb-3"
                    />
                  )}
                  {post.movie && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-gray-600 rounded"></div>
                        <div>
                          <h5 className="text-white font-semibold">{post.movie.title}</h5>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FaStar className="text-yellow-400" />
                            <span>{post.movie.rating}/10</span>
                            <span>•</span>
                            <span>{post.movie.theatre}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        post.isLiked
                          ? 'bg-red-500/20 text-red-400'
                          : 'hover:bg-gray-700 text-gray-400'
                      }`}
                    >
                      <FaHeart className={post.isLiked ? 'text-red-400' : ''} />
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleComment(post.id, 'Great post!')}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                      <FaComment />
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                      <FaShare />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Your Friends</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{friend.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-lg font-semibold text-white">{friend.name}</h5>
                        {getTierIcon(friend.tier)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                        <span>{friend.isOnline ? 'Online' : `Last seen ${friend.lastSeen}`}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUserSelect(friend)}
                      className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Movie Groups</h4>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
              >
                Create Group
              </button>
            </div>
            <div className="space-y-4">
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{group.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-lg font-semibold text-white">{group.name}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          group.privacy === 'public' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {group.privacy}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{group.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {group.members} members • Created by {group.createdBy}
                        </div>
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            group.isJoined
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-primary hover:bg-primary/80 text-white'
                          }`}
                        >
                          {group.isJoined ? 'Joined' : 'Join Group'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Movie Events</h4>
            <div className="space-y-4">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <FaCalendar className="text-primary text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-lg font-semibold text-white">{event.title}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.type === 'marathon' ? 'bg-purple-500/20 text-purple-300' : 'bg-orange-500/20 text-orange-300'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <FaClock />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {event.attendees}/{event.maxAttendees} attendees • Organized by {event.organizer}
                        </div>
                        <button
                          onClick={() => handleJoinEvent(event.id)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            event.isJoined
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-primary hover:bg-primary/80 text-white'
                          }`}
                        >
                          {event.isJoined ? 'Joined' : 'Join Event'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Post</h3>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's on your mind about movies?"
                className="w-full h-32 p-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle post creation
                    setShowCreatePost(false);
                    setNewPost({ content: '', image: null, movie: null });
                  }}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                >
                  Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialFeatures;
