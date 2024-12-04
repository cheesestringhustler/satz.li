import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { CreditsProvider } from '@/context/credits-context';
import { ConfigProvider } from '@/features/editor/context/config-context';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import './styles/App.css';

function App() {
    const { theme } = useTheme()
    const routeElements = useRoutes(routes);

    return (
        <CreditsProvider>
            <ConfigProvider>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <TooltipProvider>
                        <div className={`${theme} min-h-screen flex flex-col`}>
                            {routeElements}
                        </div>
                        <Toaster />
                    </TooltipProvider>
                </ThemeProvider>
            </ConfigProvider>
        </CreditsProvider>
    )
}

export default App
