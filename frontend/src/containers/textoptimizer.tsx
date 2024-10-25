import { LanguageSelector } from '@/components/LanguageSelector';
import { CustomPromptInput } from '@/components/CustomPromptInput';
import { useState, useRef, useEffect, useCallback } from 'react';
import TextEditor from '@/components/TextEditor';
import { EditorControls } from '@/components/EditorControls';
import { optimizeText } from '@/services/api';
import { useTextState } from '@/hooks/useTextState';
import { useTextChanges } from '@/hooks/useTextChanges';
import { saveCursorPosition } from '@/utils/cursorUtils';

function TextOptimizer() {
    const editorRef = useRef<HTMLDivElement>(null);
    const textState = useTextState();
    const textChanges = useTextChanges(editorRef, textState.text, textState.cursorPosition);
    
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredChangeIndex, setHoveredChangeIndex] = useState<number | null>(null);
    const [language, setLanguage] = useState('en');
    const [customPrompt, setCustomPrompt] = useState('');

    // Initialize editor content
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerText = textState.text;
        }
    }, []);

    // Apply changes when they update
    useEffect(() => {
        textChanges.applyChanges();
    }, [textChanges.changes]);

    // Set up change click handlers
    useEffect(() => {
        if (editorRef.current) {
            const handleClick = (e: MouseEvent) => textChanges.handleChangeClick(e, textState.setText);
            editorRef.current.addEventListener('mousedown', handleClick);
            editorRef.current.addEventListener('contextmenu', (e) => e.preventDefault());
            
            return () => {
                editorRef.current?.removeEventListener('mousedown', handleClick);
                editorRef.current?.removeEventListener('contextmenu', (e) => e.preventDefault());
            };
        }
    }, [textChanges.handleChangeClick, textState.setText]);

    const handleOptimize = async (language: string, customPrompt: string) => {
        setIsLoading(true);
        textChanges.setChanges([]);
        textState.setIsOptimizationComplete(false);
        textState.setOriginalText(textState.text);
        
        try {
            const reader = await optimizeText(textState.text, language, customPrompt);
            let newOptimizedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    textState.setIsOptimizationComplete(true);
                    break;
                }
                const chunk = new TextDecoder().decode(value);
                newOptimizedText += chunk;
                textChanges.updateTextWithChanges(textState.text, newOptimizedText, false);
            }
            textChanges.updateTextWithChanges(textState.text, newOptimizedText, true);
            textState.setOptimizedText(newOptimizedText);
        } catch (error) {
            console.error('Error:', error);
            textState.setText("An error occurred while optimizing the text.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            textState.setText(editorRef.current.innerText);
            textChanges.setChanges([]);
            textState.setOptimizedText("");
            textState.setIsOptimizationComplete(false);
            
            const newCursorPosition = saveCursorPosition(editorRef);
            textState.setCursorPosition(newCursorPosition);
        }
    }, []);

    const handleApplyChanges = () => {
        if (editorRef.current && textState.optimizedText) {
            editorRef.current.innerText = textState.optimizedText;
            textState.setText(textState.optimizedText);
            textChanges.setChanges([]);
            textState.setOptimizedText("");
            textState.setIsOptimizationComplete(false);
        }
    };

    const handleRevertChanges = () => {
        if (editorRef.current && textState.originalText) {
            editorRef.current.innerText = textState.originalText;
            textState.setText(textState.originalText);
            textChanges.setChanges([]);
            textState.setOptimizedText("");
            textState.setIsOptimizationComplete(false);
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
        <div className='flex flex-col gap-4'>
            <LanguageSelector
                language={language}
                setLanguage={setLanguage}
            />
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col gap-4'>
                    <CustomPromptInput
                        customPrompt={customPrompt}
                        setCustomPrompt={setCustomPrompt}
                        onKeyDown={handlePromptKeyDown}
                    />
                    <TextEditor
                        editorRef={editorRef}
                        handleInput={handleInput}
                        handleEditorKeyDown={handleEditorKeyDown}
                        setHoveredChangeIndex={setHoveredChangeIndex}
                    />
                </div>

                <div className='flex flex-col gap-4'>
                    <EditorControls
                        isLoading={isLoading}
                        isOptimizationComplete={textState.isOptimizationComplete}
                        onOptimize={() => handleOptimize(language, customPrompt)}
                        onApplyChanges={handleApplyChanges}
                        onRevertChanges={handleRevertChanges}
                    />
                </div>
            </div>
        </div>
    );
}

export default TextOptimizer;
