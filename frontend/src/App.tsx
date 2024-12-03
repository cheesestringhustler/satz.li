import './styles/App.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { useRoutes } from 'react-router-dom';
import { RequestsProvider } from '@/context/requests-context';
import { routes } from './routes';

function App() {
    const { theme } = useTheme()
    const routeElements = useRoutes(routes);

    return (
          <RequestsProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className={`${theme} min-h-screen flex flex-col`}>
                    {routeElements}
                </div>
                <Toaster />
            </ThemeProvider>
          </RequestsProvider>
    )
}

export default App
