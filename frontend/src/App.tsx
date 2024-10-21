import { ThemeProvider } from "@/components/theme-provider"
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import TextOptimizer from '@/containers/textoptimizer';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <header className="w-full flex p-4 justify-between items-center">
        <h1>txo</h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button>Login</Button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <TextOptimizer />
      </main>
    </ThemeProvider>
  )
}

export default App
