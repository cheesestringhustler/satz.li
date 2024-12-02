import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function PaymentCancel() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show error message
    toast({
      variant: "destructive",
      title: "Payment Cancelled",
      description: "Your payment was cancelled. No credits have been added to your account.",
    });
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-2xl font-bold">Payment Cancelled</h1>
      <p>You can try the purchase again when you're ready.</p>
      <button 
        onClick={() => navigate('/')}
        className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Return to Home
      </button>
    </div>
  );
}
