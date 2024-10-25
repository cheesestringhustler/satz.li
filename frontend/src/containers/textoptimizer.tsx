import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CustomPromptInput } from '@/components/CustomPromptInput';
import { useState, useRef, useEffect, useCallback } from 'react';
import TextEditor from '@/components/TextEditor';
import { optimizeText } from '@/services/api';
import { diff_match_patch } from 'diff-match-patch';
import { Change } from '@/types/Change';
import { restoreCursorPosition, saveCursorPosition } from '@/utils/cursorUtils';

function TextOptimizer() {
    const [originalText, setOriginalText] = useState("");
    const [text, setText] = useState(`Dear Mr. Smith,

I received your offer yesterday and would like to get more informations about it. It would be helpful if you could provide me some details, especially regarding the delivery time and payment options.

Please let me know if it is possible to get a discount, since I am interessted in purchasing multiple units. Thank you in advance for your time and assistance.

Kind regards,
John Doe`);
    const [isLoading, setIsLoading] = useState(false);
    const [changes, setChanges] = useState<Change[]>([]);
    const [optimizedText, setOptimizedText] = useState("");
    const [isOptimizationComplete, setIsOptimizationComplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const dmp = new diff_match_patch();
    const [hoveredChangeIndex, setHoveredChangeIndex] = useState<number | null>(null);
    const [language, setLanguage] = useState('en');
    const [customPrompt, setCustomPrompt] = useState('');

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerText = text;
        }
    }, []);

    useEffect(() => {
        applyChanges();
    }, [changes]);

    const handleOptimize = async (language: string, customPrompt: string) => {
        setIsLoading(true);
        setChanges([]);
        setIsOptimizationComplete(false);
        setOriginalText(text);
        
        try {
            const reader = await optimizeText(text, language, customPrompt);
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
        let diffs: [number, string][];
        if (isComplete) {
            diffs = dmp.diff_main(originalText, newOptimizedText);
            dmp.diff_cleanupSemantic(diffs);
        } else {
            const comparisonLength = Math.min(originalText.length, newOptimizedText.length);
            diffs = dmp.diff_main(originalText.slice(0, comparisonLength), newOptimizedText);
            dmp.diff_cleanupSemantic(diffs);
        }

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

    const applyChanges = useCallback(() => {
        if (!editorRef.current) return;

        let result = text;
        let offset = 0;

        changes.sort((a, b) => a.start - b.start).forEach((change, index) => {
            const beforeChange = result.slice(0, change.start + offset);
            const afterChange = result.slice(change.end + offset);
            if (change.text) {
                result = beforeChange + `<span class="change insertion" data-index="${index}">${change.text}</span>` + afterChange;
                offset += change.text.length - (change.end - change.start) + `<span class="change insertion" data-index="${index}"></span>`.length;
            } else {
                result = beforeChange + `<span class="change deletion" data-index="${index}">${result.slice(change.start + offset, change.end + offset)}</span>` + afterChange;
                offset += `<span class="change deletion" data-index="${index}"></span>`.length;
            }
        });

        editorRef.current.innerHTML = result;

        restoreCursorPosition(editorRef, cursorPosition);
    }, [changes, text, cursorPosition]);

    const handleChangeClick = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('change')) {
            e.preventDefault();
            const index = parseInt(target.getAttribute('data-index') || '');
            if (!isNaN(index)) {
                if (e.button === 0) { // Left click
                    applyChange(index);
                } else if (e.button === 2) { // Right click
                    rejectChange(index);
                }
            }
        }
    }, [changes]);

    const applyChange = (index: number) => {
        const change = changes[index];
        if (change) {
            let newText = text.slice(0, change.start) + change.text + text.slice(change.end);
            setText(newText);
            
            // Update positions of remaining changes
            const updatedChanges = changes.filter((_, i) => i !== index).map(c => {
                if (c.start > change.start) {
                    return {
                        ...c,
                        start: c.start - (change.end - change.start) + change.text.length,
                        end: c.end - (change.end - change.start) + change.text.length
                    };
                }
                return c;
            });
            
            setChanges(updatedChanges);
        }
    };

    const rejectChange = (index: number) => {
        // Simply remove the rejected change from the changes array
        setChanges(changes.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.addEventListener('mousedown', handleChangeClick);
            editorRef.current.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        return () => {
            if (editorRef.current) {
                editorRef.current.removeEventListener('mousedown', handleChangeClick);
                editorRef.current.removeEventListener('contextmenu', (e) => e.preventDefault());
            }
        };
    }, [handleChangeClick]);
    
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            setText(editorRef.current.innerText);
            setChanges([]);
            setOptimizedText("");
            setIsOptimizationComplete(false);
            
            const newCursorPosition = saveCursorPosition(editorRef);
            setCursorPosition(newCursorPosition);
        }
    }, []);

    const handleApplyChanges = () => {
        if (editorRef.current && optimizedText) {
            editorRef.current.innerText = optimizedText;
            setText(optimizedText);
            setChanges([]);
            setOptimizedText("");
            setIsOptimizationComplete(false);
        }
    };

    const handleRevertChanges = () => {
        if (editorRef.current && originalText) {
            editorRef.current.innerText = originalText;
            setText(originalText);
            setChanges([]);
            setOptimizedText("");
            setIsOptimizationComplete(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const br = document.createElement('br');
                range.deleteContents();
                range.insertNode(br);
                range.setStartAfter(br);
                range.setEndAfter(br);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    };

    const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleOptimize(language, customPrompt);
        }
    };

    const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleOptimize(language, customPrompt);
        } else {
            handleKeyDown(e);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className='flex flex-row gap-2'>
                <LanguageSelector 
                    language={language} 
                    setLanguage={setLanguage} 
                />
                <CustomPromptInput 
                    customPrompt={customPrompt} 
                    setCustomPrompt={setCustomPrompt} 
                    onKeyDown={handlePromptKeyDown}
                />
            </div>

            <TextEditor
                editorRef={editorRef}
                handleInput={handleInput}
                handleEditorKeyDown={handleEditorKeyDown}
                setHoveredChangeIndex={setHoveredChangeIndex}
            />
            
            <div className="flex justify-start gap-2">
                <Button onClick={() => handleOptimize(language, customPrompt)} disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Text"}
                </Button>
                <div className='flex-1'></div>
                <Button onClick={handleApplyChanges} disabled={!isOptimizationComplete}>
                    Apply All
                </Button>
                <Button onClick={handleRevertChanges} disabled={!isOptimizationComplete}>
                    Revert
                </Button>
            </div>
        </div>
    )
}

export default TextOptimizer;
