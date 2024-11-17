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
import { useCredits } from '@/context/CreditsContext'

const CREDIT_PACKAGES = [
  {
    credits: 5000,
    price: 5,
  },
  {
    credits: 20000, 
    price: 20,
  },
  {
    credits: 100000,
    price: 35,
  }
] as const;

export function CreditsDialog() {
  const [error, setError] = useState<string | null>(null)
  const { credits } = useCredits()

  const handlePurchase = async (amount: number, price: number) => {
    setError(null)
    try {
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits: amount, price }),
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
        <Button variant="outline">Buy Credits</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Choose a credit package to continue using our services.<br />
          </DialogDescription>
          {credits !== null && (
            <p className="text-sm text-muted-foreground">Current balance: {credits} credits</p>
          )}
        </DialogHeader>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="grid gap-4 py-4">
          {CREDIT_PACKAGES.map(pkg => (
            <Button 
              key={pkg.credits}
              onClick={() => handlePurchase(pkg.credits, pkg.price)} 
              className="w-full"
            >
              {pkg.credits} Credits - ${pkg.price}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
