import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPaperPlane, FaHeart, FaReply, FaEdit, FaTrash, FaEye, FaEyeSlash, 
  FaFilm, FaUser, FaClock, FaSmile, FaImage, FaVideo, FaTags, 
  FaEllipsisV, FaShare, FaBookmark, FaFlag, FaCrown, FaStar,
  FaThumbsUp, FaThumbsDown, FaTimes
} from 'react-icons/fa';
import { api } from '../lib/api.js';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';

const CommunityChat = () => {
  const { user } = useAppContext();
  const { userId, getToken } = useAuth(); // Clerk user ID and token
  
  // Get user display name (email or name)
  const getUserDisplayName = (sender) => {
    if (sender.userId === (userId || 'demo-user')) {
      // For current user, show their actual email from Clerk
      return user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || 'You';
    }
    // For other users, show their email if available, otherwise fall back to name
    return sender.email || sender.name || 'Unknown User';
  };
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatStats, setChatStats] = useState({ totalMessages: 0, todayMessages: 0, activeUsers: 0 });
  const [filterType, setFilterType] = useState('all'); // all, movie, spoiler, question
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchChatStats();
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
      fetchChatStats();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Remove automatic scrolling completely
  // useEffect(() => {
  //   // Only scroll to bottom when new messages are added, not on initial load
  //   if (messages.length > 0 && !isInitialLoad) {
  //     scrollToBottom();
  //   }
  //   if (isInitialLoad && messages.length > 0) {
  //     setIsInitialLoad(false);
  //   }
  // }, [messages.length, isInitialLoad]);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/chat/messages');
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatStats = async () => {
    try {
      const response = await api.get('/api/chat/stats');
      if (response.data.success) {
        setChatStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filterType === 'all') return true;
    if (filterType === 'movie') return message.movieId;
    if (filterType === 'spoiler') return message.isSpoiler;
    if (filterType === 'question') return message.messageType === 'question';
    return true;
  });

  const searchedMessages = filteredMessages.filter(message => {
    if (!searchQuery) return true;
    const senderDisplay = message.sender.email || message.sender.name || 'Unknown User';
    return message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           senderDisplay.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post('/api/chat/messages', {
        content: newMessage,
        movieId: selectedMovie?._id,
        messageType: selectedMovie ? 'movie_mention' : 'text',
        isSpoiler
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.chatMessage]);
        setNewMessage('');
        setSelectedMovie(null);
        setIsSpoiler(false);
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const likeMessage = async (messageId) => {
    try {
      const response = await api.put(`/api/chat/messages/${messageId}/like`);
      if (response.data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { 
                  ...msg, 
                  likes: response.data.isLiked 
                    ? [...msg.likes, { userId: user?.id || 'demo-user' }]
                    : msg.likes.filter(like => like.userId !== (user?.id || 'demo-user'))
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const replyToMessage = async (messageId, replyContent) => {
    try {
      const response = await api.post(`/api/chat/messages/${messageId}/reply`, {
        content: replyContent
      });
      if (response.data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, replies: [...msg.replies, response.data.reply] }
              : msg
          )
        );
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const response = await api.put(`/api/chat/messages/${messageId}`, {
        content: newContent
      });
      if (response.data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, content: newContent, isEdited: true, editedAt: new Date() }
              : msg
          )
        );
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await api.delete(`/api/chat/messages/${messageId}`);
      if (response.data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, isDeleted: true, content: '[Message deleted]' }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const isLikedByUser = (message) => {
    return message.likes.some(like => like.userId === (user?.id || 'demo-user'));
  };

  const canEditMessage = (message) => {
    return message.sender.userId === (user?.id || 'demo-user');
  };

  const renderMessage = (message, index) => {
    const showDate = index === 0 || 
      formatDate(message.createdAt) !== formatDate(searchedMessages[index - 1]?.createdAt);

    return (
      <div key={message._id}>
        {showDate && (
          <div className="text-center my-6">
            <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}
        
        <div className={`group relative ${message.isDeleted ? 'opacity-60' : ''}`}>
          <div className="flex space-x-4 p-4 hover:bg-gray-50/50 rounded-xl transition-all duration-200 hover:shadow-sm">
            <div className="flex-shrink-0">
              <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                      {message.sender.userId === (userId || 'demo-user') 
                        ? (user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || 'U').charAt(0).toUpperCase()
                        : (message.sender.email || message.sender.name || 'U').charAt(0).toUpperCase()
                      }
                    </div>
                {message.sender.userId === (user?.id || 'demo-user') && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-semibold text-gray-900">{getUserDisplayName(message.sender)}</span>
                <span className="text-gray-500 text-sm">{formatTime(message.createdAt)}</span>
                {message.isEdited && (
                  <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full">edited</span>
                )}
                {message.isSpoiler && (
                  <span className="text-red-500 text-xs font-medium bg-red-100 px-2 py-1 rounded-full">SPOILER</span>
                )}
                {message.messageType === 'question' && (
                  <span className="text-blue-500 text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">QUESTION</span>
                )}
              </div>
              
              {message.movieId && (
                <div className="flex items-center space-x-2 mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <FaFilm className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">{message.movieTitle}</span>
                </div>
              )}
              
              <div className="text-gray-800 mb-3">
                {message.isSpoiler && !showSpoilers ? (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaEyeSlash className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-semibold">Spoiler Content Hidden</span>
                    </div>
                    <button
                      onClick={() => setShowSpoilers(true)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium underline transition-colors"
                    >
                      Click to reveal spoiler content
                    </button>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                )}
              </div>
              
              {/* Enhanced Message Actions */}
              <div className="flex items-center space-x-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => likeMessage(message._id)}
                  className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-full transition-all duration-200 ${
                    isLikedByUser(message) 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <FaHeart className={`h-4 w-4 ${isLikedByUser(message) ? 'fill-current' : ''}`} />
                  <span>{message.likes.length}</span>
                </button>
                
                <button
                  onClick={() => setReplyingTo(message)}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-full transition-all duration-200"
                >
                  <FaReply className="h-4 w-4" />
                  <span>Reply</span>
                </button>
                
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-500 hover:bg-green-50 px-3 py-1 rounded-full transition-all duration-200">
                  <FaShare className="h-4 w-4" />
                  <span>Share</span>
                </button>
                
                {canEditMessage(message) && (
                  <>
                    <button
                      onClick={() => setEditingMessage(message)}
                      className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-500 hover:bg-green-50 px-3 py-1 rounded-full transition-all duration-200"
                    >
                      <FaEdit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-all duration-200"
                    >
                      <FaTrash className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 px-3 py-1 rounded-full transition-all duration-200">
                  <FaBookmark className="h-4 w-4" />
                  <span>Pin</span>
                </button>
              </div>
              
              {/* Enhanced Replies */}
              {message.replies.length > 0 && (
                <div className="mt-4 ml-6 space-y-3 border-l-2 border-gray-100 pl-4">
                  {message.replies.map((reply, replyIndex) => (
                    <div key={replyIndex} className="flex space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-7 h-7 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {reply.sender.userId === (userId || 'demo-user') 
                          ? (user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || 'U').charAt(0).toUpperCase()
                          : (reply.sender.email || reply.sender.name || 'U').charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{getUserDisplayName(reply.sender)}</span>
                          <span className="text-gray-500 text-xs">{formatTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Community Chat
              </h1>
              <p className="text-gray-600 mt-1">Connect with fellow movie lovers and share your thoughts</p>
            </div>
            
            {/* Chat Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{chatStats.totalMessages}</div>
                <div className="text-xs text-gray-500">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{chatStats.todayMessages}</div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{chatStats.activeUsers}</div>
                <div className="text-xs text-gray-500">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <FaEllipsisV className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 mb-2">Filter Messages</h3>
                {['all', 'movie', 'spoiler', 'question'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterType === type
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Messages
                  </button>
                ))}
              </div>
            </div>

            {/* Online Users */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online Users
              </h3>
              <div className="space-y-2">
                    {onlineUsers.length > 0 ? (
                      onlineUsers.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(user.email || user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{user.email || user.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No users online</p>
                    )}
              </div>
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <FaBookmark className="h-4 w-4 mr-2 text-yellow-500" />
                  Pinned Messages
                </h3>
                <div className="space-y-2">
                  {pinnedMessages.map((message, index) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">by {message.sender.email || message.sender.name || 'Unknown User'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
              {/* Messages Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Live Chat</span>
                    <span className="text-blue-200 text-sm">({searchedMessages.length} messages)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSpoilers(!showSpoilers)}
                      className={`p-2 rounded-lg transition-colors ${
                        showSpoilers ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                    >
                      {showSpoilers ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <FaEllipsisV className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

                  {/* Messages */}
                  <div className="h-96 overflow-y-auto p-4 space-y-4 relative">
                    {/* Scroll to bottom button */}
                    {messages.length > 5 && (
                      <button
                        onClick={scrollToBottom}
                        className="fixed bottom-32 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-200"
                        title="Scroll to bottom"
                      >
                        <FaPaperPlane className="h-4 w-4" />
                      </button>
                    )}
                {searchedMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                    <p className="text-gray-500">Start the conversation and share your thoughts about movies!</p>
                  </div>
                ) : (
                  searchedMessages.map((message, index) => renderMessage(message, index))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                {replyingTo && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaReply className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700">
                          Replying to <strong>{replyingTo.sender.email || replyingTo.sender.name || 'Unknown User'}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {editingMessage && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaEdit className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">Editing message</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingMessage(null)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={sendMessage} className="space-y-3">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Share your thoughts about movies..."
                          className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white shadow-sm"
                          rows={3}
                          maxLength={1000}
                        />
                        <div className="absolute right-3 top-3 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <FaSmile className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <FaImage className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                          <div className="grid grid-cols-6 gap-2">
                            {['😀', '😂', '😍', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🎬', '🍿'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attachment Menu */}
                      {showAttachmentMenu && (
                        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                          <div className="space-y-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <FaImage className="h-4 w-4" />
                              <span>Upload Image</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg">
                              <FaVideo className="h-4 w-4" />
                              <span>GIF</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg">
                              <FaTags className="h-4 w-4" />
                              <span>Sticker</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <FaPaperPlane className="h-4 w-4" />
                      <span>{sending ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSpoiler}
                          onChange={(e) => setIsSpoiler(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Contains spoiler</span>
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setNewMessage(prev => prev + '?')}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Ask Question
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {newMessage.length}/1000
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(newMessage.length / 1000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
