import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyMagicLink } from '@/services/api';

export function VerifyAuth() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            navigate('/');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await verifyMagicLink(token);
                if (response.user.email) {
                    localStorage.setItem('userEmail', response.user.email);
                }
                window.location.reload();
            } catch (error) {
                console.error('Verification failed:', error);
                navigate('/');
            }
        };

        verifyToken();
    }, [searchParams, navigate]);

    return <div>Logging in ...</div>;
} 