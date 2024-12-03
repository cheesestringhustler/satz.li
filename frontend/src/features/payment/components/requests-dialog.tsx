import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useCredits } from '@/context/credits-context'

const CREDITS_PACKAGE = {
  credits: 500,
  price: 5,
  charLimit: 4000
} as const;

export function RequestsDialog() {
  const [error, setError] = useState<string | null>(null)
  const { credits } = useCredits()

  const handlePurchase = async () => {
    setError(null)
    try {
      const response = await fetch('/api/payment/create-credits-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: CREDITS_PACKAGE.credits, 
          price: CREDITS_PACKAGE.price 
        }),
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate purchase")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-umami-event="buy-requests">Buy Credits</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Get {CREDITS_PACKAGE.credits} credits for ${CREDITS_PACKAGE.price}.
          </DialogDescription>
          {credits !== null && (
            <p className="text-sm text-muted-foreground">Current balance: {credits} credits</p>
          )}
        </DialogHeader>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="grid gap-4 py-4">
          <Button 
            onClick={handlePurchase} 
            className="w-full"
          >
            {CREDITS_PACKAGE.credits} Credits - ${CREDITS_PACKAGE.price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
