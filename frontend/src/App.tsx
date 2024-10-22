import { ThemeProvider } from "@/components/theme-provider"
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import TextOptimizer from '@/containers/textoptimizer';
import './App.css';
import { useTheme } from "@/components/theme-provider"

function App() {
  const { theme } = useTheme()

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className={theme}>
        <header className="w-full flex p-4 justify-between items-center">
          <h1>txt<b><i>o</i></b></h1>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button>Login</Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-[1000px]">
          <TextOptimizer />
        </main>
        <footer className="container mx-auto px-4 py-6 text-center text-xs fixed bottom-0 w-full text-gray-500">
          <p className="mb-2">This tool will help you optimize your text for better readability. It checks for spelling, grammar, and punctuation errors and suggests fixes.</p>
          <p className="mb-4">This site stores <a href="#" target="_blank" rel="noreferrer" className="underline">necessary data</a> for user management and analytics; text is sent to the OpenAI API, adhering to its <a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer" className="underline">policies</a>.</p>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App
