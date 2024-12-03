import { getAuthHeader } from '@/lib/http';

export async function optimizeText(text: string, languageCode: string, customPrompt: string, modelType: string, context?: string): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ text, languageCode, customPrompt, modelType, context }),
    });

    if (!response.ok) {
        if (response.status === 402) {
            throw new Error('Insufficient credits');
        } else if (response.status === 401) {
            throw new Error('Unauthorized');
        } else {
            throw new Error('Network response was not ok');
        }
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Failed to get response reader');
    }

    return reader;
}

export async function detectLanguage(text: string): Promise<string> {
    const response = await fetch('/api/detect-language', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const { detectedLanguage } = await response.json();
    return detectedLanguage;
} 