import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  MessageCircle, 
  Send, 
  X, 
  Volume2, 
  VolumeX,
  Brain,
  Zap,
  Calendar,
  MapPin,
  Users,
  CreditCard
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const VoiceChatBooking = ({ isOpen, onClose, onBookingComplete }) => {
  const { axios, getToken, user } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI booking assistant. I can help you find movies, select seats, and complete your booking. What would you like to watch today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookingContext, setBookingContext] = useState({
    movie: null,
    showtime: null,
    seats: [],
    step: 'movie_selection'
  });
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = (text) => {
    if (!synthesisRef.current) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const addMessage = (content, type = 'bot', options = {}) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      ...options
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (type === 'bot' && !options.silent) {
      setTimeout(() => speak(content), 100);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }
    
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSendMessage = async (message = inputText) => {
    if (!message.trim()) return;
    
    // Add user message
    addMessage(message, 'user');
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await processBookingRequest(message);
      addMessage(response.content, 'bot', response.options);
    } catch (error) {
      console.error('Booking processing error:', error);
      addMessage("I'm sorry, I encountered an error. Please try again or use the manual booking process.", 'bot');
    } finally {
      setIsProcessing(false);
    }
  };

  const processBookingRequest = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Movie search
    if (bookingContext.step === 'movie_selection' || lowerMessage.includes('movie') || lowerMessage.includes('watch')) {
      return await handleMovieSearch(message);
    }
    
    // Showtime selection
    if (bookingContext.step === 'showtime_selection' || lowerMessage.includes('time') || lowerMessage.includes('showtime')) {
      return await handleShowtimeSelection(message);
    }
    
    // Seat selection
    if (bookingContext.step === 'seat_selection' || lowerMessage.includes('seat') || lowerMessage.includes('sit')) {
      return await handleSeatSelection(message);
    }
    
    // Payment
    if (bookingContext.step === 'payment' || lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
      return await handlePayment(message);
    }
    
    // General help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return {
        content: "I can help you with:\n• Finding movies\n• Selecting showtimes\n• Choosing seats\n• Processing payments\n• Answering questions\n\nWhat would you like to do?",
        options: { showActions: true }
      };
    }
    
    return {
      content: "I'm not sure I understand. Could you please tell me what movie you'd like to watch, or ask for help?",
      options: { showActions: true }
    };
  };

  const handleMovieSearch = async (message) => {
    try {
      const { data } = await axios.get('/api/show/all');
      const movies = data.shows || [];
      
      // Simple movie matching
      const matchedMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(message.toLowerCase()) ||
        movie.overview?.toLowerCase().includes(message.toLowerCase())
      );
      
      if (matchedMovies.length === 0) {
        return {
          content: "I couldn't find any movies matching your request. Here are some popular movies:",
          options: { 
            showActions: true,
            actions: movies.slice(0, 5).map(movie => ({
              text: movie.title,
              action: () => selectMovie(movie)
            }))
          }
        };
      }
      
      if (matchedMovies.length === 1) {
        return await selectMovie(matchedMovies[0]);
      }
      
      return {
        content: `I found ${matchedMovies.length} movies matching "${message}". Which one would you like?`,
        options: {
          showActions: true,
          actions: matchedMovies.slice(0, 5).map(movie => ({
            text: movie.title,
            action: () => selectMovie(movie)
          }))
        }
      };
    } catch (error) {
      return {
        content: "I'm having trouble searching for movies right now. Please try again later."
      };
    }
  };

  const selectMovie = async (movie) => {
    setBookingContext(prev => ({ ...prev, movie, step: 'showtime_selection' }));
    
    try {
      const { data } = await axios.get(`/api/show/${movie._id}`);
      const showtimes = data.dateTime || {};
      
      const availableDates = Object.keys(showtimes).filter(date => 
        showtimes[date] && showtimes[date].length > 0
      );
      
      if (availableDates.length === 0) {
        return {
          content: `Sorry, there are no showtimes available for ${movie.title} at the moment.`
        };
      }
      
      return {
        content: `Great choice! ${movie.title} is available. When would you like to watch it?`,
        options: {
          showActions: true,
          actions: availableDates.slice(0, 3).map(date => ({
            text: new Date(date).toLocaleDateString(),
            action: () => selectDate(date, showtimes[date])
          }))
        }
      };
    } catch (error) {
      return {
        content: "I'm having trouble getting showtimes. Please try again."
      };
    }
  };

  const selectDate = async (date, showtimes) => {
    return {
      content: `Perfect! Here are the available showtimes for ${new Date(date).toLocaleDateString()}:`,
      options: {
        showActions: true,
        actions: showtimes.slice(0, 5).map(show => ({
          text: new Date(show.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: () => selectShowtime(show, date)
        }))
      }
    };
  };

  const selectShowtime = async (show, date) => {
    setBookingContext(prev => ({ ...prev, showtime: show, date, step: 'seat_selection' }));
    
    return {
      content: `Excellent! You've selected ${show.time} on ${new Date(date).toLocaleDateString()}. How many seats would you like?`,
      options: {
        showActions: true,
        actions: [1, 2, 3, 4, 5].map(num => ({
          text: `${num} seat${num > 1 ? 's' : ''}`,
          action: () => selectSeatCount(num)
        }))
      }
    };
  };

  const selectSeatCount = async (count) => {
    setBookingContext(prev => ({ ...prev, seatCount: count }));
    
    return {
      content: `Perfect! I'll help you find ${count} seat${count > 1 ? 's' : ''}. Let me check the best available seats for you.`,
      options: {
        showActions: true,
        actions: [
          { text: "Find Best Seats", action: () => findBestSeats(count) },
          { text: "Show Seat Map", action: () => showSeatMap() }
        ]
      }
    };
  };

  const findBestSeats = async (count) => {
    // This would integrate with the AI seat recommendation system
    const recommendedSeats = ['E5', 'E6', 'E7'].slice(0, count);
    setBookingContext(prev => ({ ...prev, seats: recommendedSeats, step: 'payment' }));
    
    return {
      content: `I found the best ${count} seat${count > 1 ? 's' : ''} for you: ${recommendedSeats.join(', ')}. The total cost is $${count * 12}. Would you like to proceed with payment?`,
      options: {
        showActions: true,
        actions: [
          { text: "Yes, Pay Now", action: () => processPayment() },
          { text: "Change Seats", action: () => showSeatMap() }
        ]
      }
    };
  };

  const showSeatMap = () => {
    return {
      content: "I'll open the seat map for you to choose your preferred seats manually.",
      options: {
        showActions: true,
        actions: [
          { text: "Open Seat Map", action: () => {
            // This would trigger the seat selection modal
            toast.success("Opening seat map...");
          }}
        ]
      }
    };
  };

  const processPayment = async () => {
    try {
      const { data } = await axios.post('/api/booking/create', {
        showId: bookingContext.showtime.showId,
        selectedSeats: bookingContext.seats
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        addMessage("Payment processed successfully! Your booking is confirmed. You'll receive a confirmation email shortly.", 'bot');
        if (onBookingComplete) {
          onBookingComplete(data);
        }
        return;
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
    
    return {
      content: "I'm having trouble processing your payment. Please try again or use the manual booking process."
    };
  };

  const handleSeatSelection = async (message) => {
    // Handle seat selection logic
    return {
      content: "I understand you want to select seats. Let me help you with that."
    };
  };

  const handlePayment = async (message) => {
    // Handle payment logic
    return {
      content: "I'll help you process the payment for your booking."
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-white/10 w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI Booking Assistant</h3>
            <div className="flex items-center gap-2">
              {isSpeaking && <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />}
              {isProcessing && <Zap className="w-4 h-4 text-yellow-400 animate-spin" />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.options?.showActions && message.options.actions && (
                  <div className="mt-3 space-y-2">
                    {message.options.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="block w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-400">Processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message or use voice..."
              className="flex-1 p-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isProcessing}
              className="p-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            💡 Try saying: "I want to watch a comedy movie" or "Show me available seats"
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatBooking;
