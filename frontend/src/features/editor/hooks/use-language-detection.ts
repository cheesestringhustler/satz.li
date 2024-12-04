import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { detectLanguage } from '@/features/editor/services';

interface UseLanguageDetectionProps {
    initialAutoDetect?: boolean;
}

export function useLanguageDetection({ initialAutoDetect = false }: UseLanguageDetectionProps = {}) {
    const [language, setLanguage] = useState('de-ch');
    const [isLoading, setIsLoading] = useState(false);
    const [lastDetectedSample, setLastDetectedSample] = useState('');
    const [autoDetectEnabled, setAutoDetectEnabled] = useState(initialAutoDetect);

    // Core language detection logic
    const detectLanguageCore = async (text: string) => {
        const currentSample = text.slice(0, 40);
        if (text.length < 10 || currentSample === lastDetectedSample) {
            return;
        }

        setIsLoading(true);
        try {
            const detectedLanguage = await detectLanguage(currentSample);
            if (detectedLanguage !== 'none' && detectedLanguage !== 'no') {
                setLanguage(detectedLanguage);
                setLastDetectedSample(currentSample);
            }
        } catch (error) {
            console.error('Error detecting language:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced version with validation
    const detectLanguageDebounced = useCallback(
        debounce((text: string) => {
            if (autoDetectEnabled) {
                detectLanguageCore(text);
            }
        }, 2000),
        [autoDetectEnabled, detectLanguageCore]
    );

    return {
        language,
        setLanguage,
        isLoading,
        autoDetectEnabled,
        setAutoDetectEnabled,
        detectLanguageCore,
        detectLanguageDebounced
    };
} 