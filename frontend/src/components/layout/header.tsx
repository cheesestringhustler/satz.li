import { RequestsDialog } from '@/features/payment/components/requests-dialog';
import { LoginDialog } from '@/features/auth/components/login-dialog';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function Header() {
    return (
        <header className="w-full flex p-4 justify-between items-center">
                <div className="flex flex-row items-center">
                    <h1>satz.li</h1><span className="text-sm text-gray-500">&nbsp; - AI-Powered Text Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                    <RequestsDialog />
                    <LoginDialog />
                    <ThemeToggle />
                </div>
            </header>
    );
}