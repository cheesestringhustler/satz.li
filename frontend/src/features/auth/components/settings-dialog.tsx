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
import { useState, useEffect } from "react"
import { logout } from '@/features/auth/services'
import { useCredits } from '@/context/credits-context'

export function SettingsDialog() {
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { credits, refreshCredits } = useCredits()
  const email = localStorage.getItem('userEmail')

  useEffect(() => {
    if (open) {
      refreshCredits();
    }
  }, [open, refreshCredits]);

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('userEmail')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout")
    }
  }

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="border-t my-2" />
          <div className="px-2">
            <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Optimize Text</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                  {isMac ? '⌘' : 'Ctrl'} + Enter
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Submit Prompt</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Enter</span>
              </div>
            </div>
          </div>
          <div className="border-t my-2" />
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