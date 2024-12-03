import { getAuthHeader } from '@/lib/http';

export async function getRequestsBalance(): Promise<number | object> {
    try {
        const response = await fetch('/api/requests/balance', {
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

export async function checkRequestAvailability(text: string): Promise<{ isAvailable: boolean }> {
    try {
        const response = await fetch('/api/requests/check-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify({ text }),
        });
        return response.json();
    } catch (err) {
        return { isAvailable: false };
    }
} 