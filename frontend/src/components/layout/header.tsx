import { LoginDialog } from '@/features/auth/components/login-dialog';
import { SettingsDialog } from '@/features/auth/components/settings-dialog';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useEffect, useState } from 'react';
import { checkAuthStatus } from '@/features/auth/services';
import { useCredits } from '@/context/credits-context';
import { CreditsDialog } from '@/features/payment/components/credits-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCreditsDialogOpen, setIsCreditsDialogOpen] = useState(false);
    const { credits } = useCredits();

    useEffect(() => {
        checkAuthStatus().then((status) => {
            setIsLoggedIn(status.authenticated);
        });
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 h-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="font-semibold">satz.li</h1>
                    <span className="text-sm text-muted-foreground">AI-Powered Text Assistance</span>
                </div>
                <div className="flex items-center gap-1">
                    {isLoggedIn && credits !== null && (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="text-xs text-muted-foreground mr-2 hover:text-foreground"
                                        onClick={() => setIsCreditsDialogOpen(true)}
                                    >
                                        {credits} credits
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-center">
                                        <div>Available Credits</div>
                                        <div className="text-xs text-muted-foreground">Click to buy more</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                            <CreditsDialog 
                                open={isCreditsDialogOpen} 
                                onOpenChange={setIsCreditsDialogOpen}
                            />
                        </>
                    )}
                    {!isLoggedIn && <LoginDialog />}
                    {isLoggedIn && <SettingsDialog />}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}