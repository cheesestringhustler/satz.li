import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import { RequestsDialog } from '@/features/payment/components/requests-dialog'
import { useState } from "react"
import { logout } from '@/features/auth/services'
import { useCredits } from '@/context/credits-context'

export function SettingsDialog() {
  const [error, setError] = useState<string | null>(null)
  const { credits } = useCredits()
  const email = localStorage.getItem('userEmail')

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('userEmail')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm">Email</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-sm">Credits</span>
            <span className="text-sm text-muted-foreground">{credits}</span>
          </div>
          <div className="flex flex-col gap-2">
            <RequestsDialog />
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 