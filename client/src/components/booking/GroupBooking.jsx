import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Minus, 
  UserPlus, 
  CreditCard, 
  Share2, 
  Copy, 
  Check,
  DollarSign,
  Split,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const GroupBooking = ({ showId, selectedSeats, onComplete, onClose }) => {
  const { axios, getToken, user } = useAppContext();
  const [groupMembers, setGroupMembers] = useState([
    { id: 1, name: user?.firstName || 'You', email: user?.primaryEmailAddress?.emailAddress || '', phone: '', isHost: true, seatId: selectedSeats[0] || null }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('split'); // 'host', 'split', 'individual'
  const [splitDetails, setSplitDetails] = useState({});
  const [inviteLink, setInviteLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const seatPrice = 12; // Base price per seat
  const totalAmount = selectedSeats.length * seatPrice;

  useEffect(() => {
    if (selectedSeats.length > 1) {
      // Auto-add members based on seat count
      const newMembers = selectedSeats.slice(1).map((seatId, index) => ({
        id: index + 2,
        name: `Guest ${index + 1}`,
        email: '',
        phone: '',
        isHost: false,
        seatId: seatId
      }));
      setGroupMembers(prev => [...prev, ...newMembers]);
    }
  }, [selectedSeats]);

  const addGroupMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      email: '',
      phone: '',
      isHost: false,
      seatId: null
    };
    setGroupMembers(prev => [...prev, newMember]);
  };

  const removeGroupMember = (id) => {
    if (groupMembers.length <= 1) return;
    setGroupMembers(prev => prev.filter(member => member.id !== id));
  };

  const updateGroupMember = (id, field, value) => {
    setGroupMembers(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const assignSeat = (memberId, seatId) => {
    setGroupMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, seatId } : member
    ));
  };

  const generateInviteLink = async () => {
    setIsGeneratingLink(true);
    try {
      // In a real app, this would create a shareable booking session
      const bookingSessionId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const link = `${window.location.origin}/group-booking/${bookingSessionId}`;
      setInviteLink(link);
      setShowInviteModal(true);
      toast.success('Invite link generated!');
    } catch (error) {
      toast.error('Failed to generate invite link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const calculateSplitAmounts = () => {
    const amounts = {};
    groupMembers.forEach(member => {
      if (member.seatId) {
        amounts[member.id] = seatPrice;
      }
    });
    return amounts;
  };

  const handlePayment = async () => {
    try {
      const splitAmounts = calculateSplitAmounts();
      
      if (paymentMethod === 'host') {
        // Host pays for everyone
        const { data } = await axios.post('/api/booking/create', {
          showId,
          selectedSeats,
          greenTicketingDonation: localStorage.getItem('green_ticketing_enabled') === 'true',
          groupBooking: {
            type: 'host_payment',
            members: groupMembers,
            totalAmount
          }
        }, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        });
        
        if (data.success) {
          toast.success('Group booking completed!');
          onComplete(data);
        }
      } else if (paymentMethod === 'split') {
        // Each member pays for their own seat
        const bookingPromises = groupMembers
          .filter(member => member.seatId)
          .map(member => 
            axios.post('/api/booking/create', {
              showId,
              selectedSeats: [member.seatId],
              greenTicketingDonation: localStorage.getItem('green_ticketing_enabled') === 'true',
              groupBooking: {
                type: 'split_payment',
                groupId: `group_${Date.now()}`,
                memberId: member.id,
                memberName: member.name
              }
            }, {
              headers: { Authorization: `Bearer ${await getToken()}` }
            })
          );
        
        const results = await Promise.all(bookingPromises);
        const allSuccessful = results.every(result => result.data.success);
        
        if (allSuccessful) {
          toast.success('Split payment completed!');
          onComplete({ success: true, bookings: results.map(r => r.data) });
        } else {
          toast.error('Some payments failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Group booking error:', error);
      toast.error('Failed to process group booking');
    }
  };

  const sendInvites = () => {
    const membersToInvite = groupMembers.filter(member => member.email && !member.isHost);
    
    if (membersToInvite.length === 0) {
      toast.error('Please add email addresses for group members');
      return;
    }
    
    // In a real app, this would send actual invites
    toast.success(`Invites sent to ${membersToInvite.length} members!`);
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Group Booking</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Group Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-white">Group Members</h4>
          <button
            onClick={addGroupMember}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        <div className="space-y-3">
          {groupMembers.map((member, index) => (
            <div key={member.id} className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {member.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                  <span className="font-medium text-white">
                    {member.isHost ? 'Host' : `Member ${index}`}
                  </span>
                </div>
                {!member.isHost && groupMembers.length > 1 && (
                  <button
                    onClick={() => removeGroupMember(member.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={member.name}
                  onChange={(e) => updateGroupMember(member.id, 'name', e.target.value)}
                  className="p-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={member.email}
                  onChange={(e) => updateGroupMember(member.id, 'email', e.target.value)}
                  className="p-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={member.phone}
                  onChange={(e) => updateGroupMember(member.id, 'phone', e.target.value)}
                  className="p-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <select
                  value={member.seatId || ''}
                  onChange={(e) => assignSeat(member.id, e.target.value)}
                  className="p-2 bg-gray-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select Seat</option>
                  {selectedSeats.map(seatId => (
                    <option key={seatId} value={seatId}>{seatId}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Payment Method</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-white/10 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="host"
              checked={paymentMethod === 'host'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-primary"
            />
            <CreditCard className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-medium text-white">Host Pays All</div>
              <div className="text-sm text-gray-400">You pay for everyone (${totalAmount})</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-white/10 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="split"
              checked={paymentMethod === 'split'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-primary"
            />
            <Split className="w-5 h-5 text-green-400" />
            <div>
              <div className="font-medium text-white">Split Payment</div>
              <div className="text-sm text-gray-400">Each person pays for their own seat (${seatPrice} each)</div>
            </div>
          </label>
        </div>
      </div>

      {/* Invite Members */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Invite Members</h4>
        <div className="flex gap-3">
          <button
            onClick={generateInviteLink}
            disabled={isGeneratingLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {isGeneratingLink ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
        <h4 className="text-lg font-medium text-white mb-3">Booking Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Seats:</span>
            <span className="text-white">{selectedSeats.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Group Size:</span>
            <span className="text-white">{groupMembers.length} people</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Price per Seat:</span>
            <span className="text-white">${seatPrice}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-white/10 pt-2">
            <span className="text-white">Total Amount:</span>
            <span className="text-primary">${totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePayment}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-medium"
        >
          <CreditCard className="w-5 h-5" />
          Complete Group Booking
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Share Invite Link</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 p-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm"
                />
                <button
                  onClick={copyInviteLink}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={sendInvites}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Invites
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupBooking;
