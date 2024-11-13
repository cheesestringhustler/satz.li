import languages from '@/assets/languages.json';

export async function optimizeText(text: string, languageCode: string, customPrompt: string, modelType: string): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const language = languageCode; //languages.find(lang => lang.code === languageCode)?.name || languageCode;

    const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language, customPrompt, modelType }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const { detectedLanguage } = await response.json();
    return detectedLanguage;
}