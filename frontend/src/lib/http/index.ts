export const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 