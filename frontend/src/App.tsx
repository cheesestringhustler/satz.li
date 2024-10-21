import { useState } from 'react';
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ModeToggle } from '@/components/mode-toggle';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>
        <Input type="text" />
        <Button>Check</Button>
      </div>
      <div>
        <Textarea />
      </div>
      <ModeToggle />
    </ThemeProvider>
  )
}

export default App
