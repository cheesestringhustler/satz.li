import './App.css';
import { Toaster } from '@/components/ui/toaster';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Routes, Route } from 'react-router-dom';
import { CreditsProvider } from '@/context/CreditsContext';
import { CreditsDialog } from '@/containers/CreditsDialog';
import { LoginDialog } from '@/containers/LoginDialog';
import TextOptimizer from '@/containers/TextOptimizer';
import { VerifyAuth } from '@/pages/VerifyAuth';
import PaymentSuccess from '@/pages/payment/success';
import PaymentCancel from '@/pages/payment/cancel';

function App() {
  const { theme } = useTheme()

  return (
    <CreditsProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className={`${theme} min-h-screen flex flex-col`}>
          <Routes>
            <Route path="/a/verify" element={<VerifyAuth />} />
            <Route path="/" element={
              <>
                <header className="w-full flex p-4 justify-between items-center">
                  {/* <h1>txt<b><i>o</i></b></h1> */}
                  <div className="flex flex-row items-center">
                    <h1>satz.li</h1><span className="text-sm text-gray-500">&nbsp; - AI-Powered Text Assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditsDialog />
                    <LoginDialog />
                    <ModeToggle />
                  </div>
                </header>
                <main className="container mx-auto px-4 py-6 w-full max-w-screen-lg flex-grow">
                  <TextOptimizer />
                </main>
                <footer className="container w-full mx-auto px-4 py-2 text-center text-xs text-gray-500 mt-auto">
                  <p className="mb-2">This tool will help you optimize your text for better readability. It checks for spelling, grammar, and punctuation errors and suggests fixes.</p>
                  <p className="mb-4">This site stores <a href="#" target="_blank" rel="noreferrer" className="underline">necessary data</a> for user management and analytics; text is sent to the OpenAI API, adhering to its <a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer" className="underline">policies</a>.</p>
                </footer>
              </>
            } />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
          </Routes>
        </div>
        <Toaster />
      </ThemeProvider>
    </CreditsProvider>
  )
}

export default App
