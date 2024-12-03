import { RequestsDialog } from '@/features/payment/components/requests-dialog';
import { LoginDialog } from '@/features/auth/components/login-dialog';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useEffect, useState } from 'react';
import { checkAuthStatus } from '@/features/auth/services';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkAuthStatus().then((status) => {
            setIsLoggedIn(status.authenticated);
        });
    }, []);

    return (
        <header className="w-full flex p-4 justify-between items-center">
            <div className="flex flex-row items-center">
                <h1>satz.li</h1><span className="text-sm text-gray-500">&nbsp; - AI-Powered Text Assistance</span>
            </div>
            <div className="flex items-center gap-2">
                {isLoggedIn && <RequestsDialog />}
                <LoginDialog />
                <ThemeToggle />
            </div>
        </header>
    );
}