import { getAuthHeader } from '@/lib/http';

export async function getCreditsBalance(): Promise<number | object> {
    try {
        const response = await fetch('/api/credits', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
        });
        return response.json();
    } catch (err) {
        return -1;
    }
}

export async function getCreditsEstimate(modelType: string, { text, languageCode, customPrompt }: 
    { text: string, languageCode: string, customPrompt: string }): 
    Promise<{ creditsEstimate: number }> {
    try {
        const response = await fetch('/api/credits/estimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ modelType, text, languageCode, customPrompt }),
        });
        return response.json();
    } catch (err) {
        return { creditsEstimate: -1 };
    }
} 