import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function TextOptimizer() {
    const [text, setText] = useState("Er geht Sonntags nicht gerne einkaufen");
    const [optimizedText, setOptimizedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const optimizedTextRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (optimizedTextRef.current) {
            optimizedTextRef.current.scrollTop = optimizedTextRef.current.scrollHeight;
        }
    }, [optimizedText]);

    const handleOptimize = async () => {
        setIsLoading(true);
        setOptimizedText("");
        
        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder().decode(value);
                setOptimizedText(prev => prev + chunk);
            }
        } catch (error) {
            console.error('Error:', error);
            setOptimizedText("An error occurred while optimizing the text.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                className="h-64"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
            />
            <div className="flex justify-start">
                <Button onClick={handleOptimize} disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Text"}
                </Button>
            </div>
            {optimizedText && (
                <Textarea
                    ref={optimizedTextRef}
                    className="h-64"
                    value={optimizedText}
                    readOnly
                    placeholder="Optimized text will appear here..."
                />
            )}
        </div>
    )
}

export default TextOptimizer;
