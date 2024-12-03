import { RouteObject } from 'react-router-dom';
import { EditorPage } from '@/features/editor/pages/editor';
import { VerifyAuth } from '@/features/auth/pages/verify-auth';
import PaymentSuccess from '@/features/payment/pages/payment-success';
import PaymentCancel from '@/features/payment/pages/payment-cancel';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <EditorPage />
    },
    {
        path: '/a/verify',
        element: <VerifyAuth />
    },
    {
        path: '/payment/success',
        element: <PaymentSuccess />
    },
    {
        path: '/payment/cancel',
        element: <PaymentCancel />
    }
]; 