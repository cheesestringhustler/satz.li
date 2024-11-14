import languages from '@/assets/languages.json';

const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function optimizeText(text: string, languageCode: string, customPrompt: string, modelType: string): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const language = languageCode; //languages.find(lang => lang.code === languageCode)?.name || languageCode;

    const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
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

export async function requestMagicLink(email: string): Promise<void> {
    const response = await fetch('/api/auth/request-magic-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send magic link');
    }
}

export async function verifyMagicLink(token: string): Promise<void> {
    const response = await fetch(`/api/auth/verify?token=${token}`);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify magic link');
    }

    await response.json();
}

export async function logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to logout');
    }
}

export async function checkAuthStatus(): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/status', {
            method: 'GET',
            credentials: 'include', // Important for sending cookies
        });
        return response.ok;
    } catch (err) {
        return false;
    }
}