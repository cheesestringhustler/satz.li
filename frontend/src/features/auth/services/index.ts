type VerifyMagicLinkResponse = {
    success: boolean;
    user: {
        email: string;
        creditsBalance: number;
    };
};

type CheckAuthStatusResponse = {
    authenticated: boolean;
    user: {
        email: string;
        creditsBalance: number;
    };
};

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