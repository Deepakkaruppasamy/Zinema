import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setMessage('Payment processed! Redirecting...');
        
        const greenTicketingEnabled = localStorage.getItem('green_ticketing_enabled') === 'true';
        if (greenTicketingEnabled) {
          const urlParams = new URLSearchParams(location.search);
          const estimatedTickets = 2;
          window.dispatchEvent(new CustomEvent('greenTicketingDonation', {
            detail: { greenDonation: estimatedTickets }
          }));
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        navigate('/my-bookings', { replace: true });
      } catch (error) {
        console.error('Error processing payment:', error);
        setMessage('Payment processed! Redirecting...');
        navigate('/my-bookings', { replace: true });
      }
    };

    processPayment();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loading />
        <h2 className="text-white text-xl mt-4">{message}</h2>
        <p className="text-gray-400 mt-2">Please wait while we confirm your payment...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
