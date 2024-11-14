import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { requestMagicLink, verifyMagicLink } from "@/services/api"

export function LoginDialog() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [step, setStep] = useState<"request" | "verify">("request")
  const [error, setError] = useState<string | null>(null)
  
  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await requestMagicLink(email)
      setStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link")
    }
  }

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const accessToken = await verifyMagicLink(token)
      localStorage.setItem("accessToken", accessToken)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify token")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            {step === "request" 
              ? "Enter your email address to receive a magic link for logging in."
              : "Paste the magic link token to complete login."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {step === "request" ? (
          <form onSubmit={handleRequestMagicLink} className="grid gap-4 py-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Send Magic Link</Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyToken} className="grid gap-4 py-4">
            <Input
              type="text"
              placeholder="Paste your token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <Button type="submit">Verify Token</Button>
            <Button 
              variant="outline" 
              onClick={() => setStep("request")}
              type="button"
            >
              Back to Email
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 