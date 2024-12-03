import { RequestLimits, requestLimits as defaultLimits } from '../config';

export async function fetchRequestLimits(): Promise<RequestLimits> {
    try {
        const response = await fetch('/api/config/limits');
        if (!response.ok) {
            throw new Error('Failed to fetch request limits');
        }
        return await response.json();
    } catch (error) {
        console.warn('Failed to fetch request limits, using defaults:', error);
        return defaultLimits;
    }
} 