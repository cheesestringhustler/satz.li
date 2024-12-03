import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getCreditsBalance } from '@/features/payment/services/credits';

interface CreditsContextType {
    credits: number | null;
    refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const [credits, setCredits] = useState<number | null>(null);

    const refreshCredits = useCallback(async () => {
        try {
            const balance = await getCreditsBalance() as { creditsBalance: number };
            setCredits(Number(balance.creditsBalance));
        } catch (err) {
            console.error('Failed to fetch credits:', err);
        }
    }, []);

    return (
        <CreditsContext.Provider value={{ credits, refreshCredits }}>
            {children}
        </CreditsContext.Provider>
    );
}

export function useCredits() {
    const context = useContext(CreditsContext);
    if (context === undefined) {
        throw new Error('useCredits must be used within a CreditsProvider');
    }
    return context;
} 