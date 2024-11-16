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

  const handlePurchase = async (amount: number) => {
    setError(null)
    try {
      // TODO: Implement purchase logic
      console.log(`Purchasing ${amount} credits`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to purchase credits")
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
            Choose a credit package to continue using our services.
            {credits !== null && (
              <div className="mt-2">Current balance: {credits} credits</div>
            )}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="grid gap-4 py-4">
          {CREDIT_PACKAGES.map(pkg => (
            <Button 
              key={pkg.credits}
              onClick={() => handlePurchase(pkg.credits)} 
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
