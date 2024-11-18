// ################ Text ################
const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function optimizeText(text: string, languageCode: string, customPrompt: string, modelType: string): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ text, languageCode, customPrompt, modelType }),
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

// ################ Auth ################
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

type VerifyMagicLinkResponse = {
    success: boolean;
    user: {
        email: string;
        creditsBalance: number;
    };
};

export async function verifyMagicLink(token: string): Promise<VerifyMagicLinkResponse> {
    const response = await fetch(`/api/auth/verify?token=${token}`);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify magic link');
    }

    return response.json();
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

type CheckAuthStatusResponse = {
    authenticated: boolean;
    user: {
        email: string;
        creditsBalance: number;
    };
};

export async function checkAuthStatus(): Promise<CheckAuthStatusResponse> {
    try {
        const response = await fetch('/api/auth/status', {
            method: 'GET',
            credentials: 'include', // Important for sending cookies
        });
        return response.json();
    } catch (err) {
        return { authenticated: false, user: { email: '', creditsBalance: 0 } };
    }
}

// ################ Credits ################
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