import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import TextOptimizer from '../components/text-optimizer';

export function EditorPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-6 w-full max-w-screen-lg flex-grow">
                <TextOptimizer />
            </main>
            <Footer />
        </>
    );
} 