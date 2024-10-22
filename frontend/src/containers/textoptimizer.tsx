import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { optimizeText } from '@/services/api';

function TextOptimizer() {
    const [text, setText] = useState("Er geht Sonntags nicht gerne einkaufen");
    const [optimizedText, setOptimizedText] = useState("Er geht sonntags nicht gerne einkaufen.");
    const [isLoading, setIsLoading] = useState(false);
    const optimizedTextRef = useRef<HTMLTextAreaElement>(null);
    const [textareaWidth, setTextareaWidth] = useState<number | undefined>(undefined);
    const [textareaTop, setTextareaTop] = useState<number | undefined>(undefined);
    const [textareaLeft, setTextareaLeft] = useState<number | undefined>(undefined);
    const inputTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (optimizedTextRef.current) {
            optimizedTextRef.current.scrollTop = optimizedTextRef.current.scrollHeight;
        }
    }, [optimizedText]);

    const handleOptimize = async () => {
        setIsLoading(true);
        setOptimizedText("");
        
        try {
            const reader = await optimizeText(text);

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

    useEffect(() => {
        const updateTextareaPosition = () => {
            if (inputTextareaRef.current) {
                const rect = inputTextareaRef.current.getBoundingClientRect();
                setTextareaWidth(inputTextareaRef.current.offsetWidth);
                setTextareaTop(rect.top);
                setTextareaLeft(rect.left);
            }
        };

        updateTextareaPosition();
        
        window.addEventListener('resize', updateTextareaPosition);
        return () => {
            window.removeEventListener('resize', updateTextareaPosition);
        };
    }, []);
    

    const applyAllChanges = () => {
        setText(optimizedText);
    };

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                ref={inputTextareaRef}
                className="h-64 text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
            />
            {optimizedText && (
                <Textarea
                    className="optimizedTextarea pointer-events-none h-64 text-sm absolute bg-transparent z-10 opacity-50 blur-[4px] overflow-auto"
                    style={{ 
                        width: textareaWidth ? textareaWidth : 0, 
                        top: textareaTop ? textareaTop : 0, 
                        left: textareaLeft ? textareaLeft : 0, 
                        // width: textareaWidth ? textareaWidth - 24 : 0, 
                        // top: textareaTop ? textareaTop + 8 : 0, 
                        // left: textareaLeft ? textareaLeft + 12 : 0, 
                        whiteSpace: 'pre-wrap', 
                        wordWrap: 'break-word' 
                    }}
                    value={optimizedText}
                    readOnly
                />
            )}
            <div className="flex justify-start gap-2">
                <Button onClick={handleOptimize} disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Text"}
                </Button>
                {optimizedText && (
                    <Button onClick={applyAllChanges}>
                        Apply all
                    </Button>
                )}
            </div>
        </div>
    )
}

export default TextOptimizer;
