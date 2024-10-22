import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { optimizeText } from '@/services/api';
import { diff_match_patch } from 'diff-match-patch';

interface Change {
    start: number;
    end: number;
    text: string;
}

function TextOptimizer() {
    const [text, setText] = useState("Er geht Sonntags nicht gerne einkaufen");
    const [isLoading, setIsLoading] = useState(false);
    const [changes, setChanges] = useState<Change[]>([]);
    const [optimizedText, setOptimizedText] = useState("");
    const [isOptimizationComplete, setIsOptimizationComplete] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const dmp = new diff_match_patch();

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerText = text;
        }
    }, []);

    useEffect(() => {
        applyChanges();
    }, [changes]);

    const handleOptimize = async () => {
        setIsLoading(true);
        setChanges([]);
        setIsOptimizationComplete(false);
        
        try {
            const reader = await optimizeText(text);
            let newOptimizedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setIsOptimizationComplete(true);
                    break;
                }
                const chunk = new TextDecoder().decode(value);
                newOptimizedText += chunk;
                updateTextWithChanges(text, newOptimizedText, false);
            }
            updateTextWithChanges(text, newOptimizedText, true);
            setOptimizedText(newOptimizedText);
        } catch (error) {
            console.error('Error:', error);
            setText("An error occurred while optimizing the text.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateTextWithChanges = (originalText: string, newOptimizedText: string, isComplete: boolean) => {
        const comparisonLength = isComplete ? originalText.length : Math.min(originalText.length, newOptimizedText.length);
        const diffs = dmp.diff_main(originalText.slice(0, comparisonLength), newOptimizedText.slice(0, comparisonLength));
        dmp.diff_cleanupSemantic(diffs);

        const newChanges: Change[] = [];
        let position = 0;

        diffs.forEach(([operation, text]) => {
            if (operation === -1) {
                // Deletion
                newChanges.push({
                    start: position,
                    end: position + text.length,
                    text: ''
                });
                position += text.length;
            } else if (operation === 1) {
                // Insertion
                newChanges.push({
                    start: position,
                    end: position,
                    text: text
                });
            } else {
                // No change
                position += text.length;
            }
        });

        setChanges(newChanges);
    };

    const applyChanges = () => {
        if (!editorRef.current) return;

        let result = text;
        let offset = 0;

        changes.sort((a, b) => a.start - b.start).forEach(change => {
            const beforeChange = result.slice(0, change.start + offset);
            const afterChange = result.slice(change.end + offset);
            if (change.text) {
                result = beforeChange + `<u>${change.text}</u>` + afterChange;
                offset += change.text.length - (change.end - change.start) + 7; // 7 for <u></u> tags
            } else {
                result = beforeChange + `<del>${result.slice(change.start + offset, change.end + offset)}</del>` + afterChange;
                offset += 11; // 11 for <del></del> tags
            }
        });

        editorRef.current.innerHTML = result;
    };

    const handleInput = () => {
        if (editorRef.current) {
            setText(editorRef.current.innerText);
            setChanges([]);
            setOptimizedText("");
            setIsOptimizationComplete(false);
        }
    };

    const handleApplyChanges = () => {
        if (editorRef.current && optimizedText) {
            editorRef.current.innerText = optimizedText;
            setText(optimizedText);
            setChanges([]);
            setOptimizedText("");
            setIsOptimizationComplete(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex flex-col gap-4">
            <div
                ref={editorRef}
                className="h-64 p-2 text-sm border rounded-md overflow-auto"
                contentEditable
                onInput={handleInput}
                onContextMenu={handleContextMenu}
                style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            />
            <div className="flex justify-start gap-2">
                <Button onClick={handleOptimize} disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Text"}
                </Button>
                <Button onClick={handleApplyChanges} disabled={!isOptimizationComplete}>
                    Apply Changes
                </Button>
            </div>
        </div>
    )
}

export default TextOptimizer;
