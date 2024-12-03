import { createContext, useContext, useEffect, useState } from 'react';
import { RequestLimits, requestLimits as defaultLimits } from '../config';
import { fetchRequestLimits } from '../services/config';

interface ConfigContextType {
    requestLimits: RequestLimits;
    refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [requestLimits, setRequestLimits] = useState<RequestLimits>(defaultLimits);

    const refreshConfig = async () => {
        const limits = await fetchRequestLimits();
        setRequestLimits(limits);
    };

    useEffect(() => {
        refreshConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ requestLimits, refreshConfig }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
} 