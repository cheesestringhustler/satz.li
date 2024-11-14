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
                await verifyMagicLink(token);
                navigate('/');
            } catch (error) {
                console.error('Verification failed:', error);
                navigate('/');
            }
        };

        verifyToken();
    }, [searchParams, navigate]);

    return <div>Logging in ...</div>;
} 