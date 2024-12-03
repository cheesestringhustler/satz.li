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
import { useRequests } from '@/context/requests-context'

const REQUEST_PACKAGE = {
  requests: 500,
  price: 5,
  charLimit: 4000
} as const;

export function RequestsDialog() {
  const [error, setError] = useState<string | null>(null)
  const { requests } = useRequests()

  const handlePurchase = async () => {
    setError(null)
    try {
      const response = await fetch('/api/payment/create-request-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          requests: REQUEST_PACKAGE.requests, 
          price: REQUEST_PACKAGE.price 
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
        <Button variant="outline" data-umami-event="buy-requests">Buy Requests</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Requests</DialogTitle>
          <DialogDescription>
            Get {REQUEST_PACKAGE.requests} requests for ${REQUEST_PACKAGE.price}.
          </DialogDescription>
          {requests !== null && (
            <p className="text-sm text-muted-foreground">Current balance: {requests} requests</p>
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
            {REQUEST_PACKAGE.requests} Requests - ${REQUEST_PACKAGE.price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
