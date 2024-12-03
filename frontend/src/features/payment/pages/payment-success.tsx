import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCredits } from '@/context/credits-context';
import { toast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCredits } = useCredits();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid payment session.",
      });
      navigate('/');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Verify the payment session with your backend
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        // Refresh requests balance
        await refreshCredits();
        
        // Show success message
        toast({
          title: "Payment Successful",
          description: "Your requests have been added to your account.",
        });
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify payment. Please contact support if your requests don't appear.",
        });
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <p>Verifying your payment...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <p>Your requests have been added to your account.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Return to Home
          </button>
        </>
      )}
    </div>
  );
}
