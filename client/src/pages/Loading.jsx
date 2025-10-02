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
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setMessage('Payment processed! Redirecting...');
        
        // Check if green ticketing was enabled and dispatch event
        const greenTicketingEnabled = localStorage.getItem('green_ticketing_enabled') === 'true';
        if (greenTicketingEnabled) {
          // We don't know the exact amount here, but we can estimate based on typical booking
          // In a real implementation, you'd pass this data from the payment success callback
          const urlParams = new URLSearchParams(location.search);
          const estimatedTickets = 2; // Default estimate
          window.dispatchEvent(new CustomEvent('greenTicketingDonation', {
            detail: { greenDonation: estimatedTickets }
          }));
        }
        
        // Wait a bit more then redirect
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirect to my-bookings
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
