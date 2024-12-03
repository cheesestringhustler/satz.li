import './styles/App.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { useRoutes } from 'react-router-dom';
import { CreditsProvider } from '@/context/credits-context';
import { routes } from './routes';

function App() {
    const { theme } = useTheme()
    const routeElements = useRoutes(routes);

    return (
          <CreditsProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className={`${theme} min-h-screen flex flex-col`}>
                    {routeElements}
                </div>
                <Toaster />
            </ThemeProvider>
          </CreditsProvider>
    )
}

export default App
