import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getRequestsBalance } from '@/features/payment/services/requests';

interface RequestsContextType {
    requests: number | null;
    refreshRequests: () => Promise<void>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export function RequestsProvider({ children }: { children: ReactNode }) {
    const [requests, setRequests] = useState<number | null>(null);

    const refreshRequests = useCallback(async () => {
        try {
            const balance = await getRequestsBalance() as { requestsBalance: number };
            setRequests(Number(balance.requestsBalance));
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        }
    }, []);

    return (
        <RequestsContext.Provider value={{ requests, refreshRequests }}>
            {children}
        </RequestsContext.Provider>
    );
}

export function useRequests() {
    const context = useContext(RequestsContext);
    if (context === undefined) {
        throw new Error('useRequests must be used within a RequestsProvider');
    }
    return context;
} 