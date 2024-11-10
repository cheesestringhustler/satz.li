import { useCallback, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import CustomPromptInput from '@/containers/CustomPromptInput';
import EditorControls from '@/containers/EditorControls';
import { LanguageSelector } from '@/containers/LanguageSelector';
import ModelSelector from '@/containers/ModelSelector';
import TextEditor from '@/containers/TextEditor';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';
import { useTextChanges } from '@/hooks/useTextChanges';
import { useTextState } from '@/hooks/useTextState';
import { optimizeText } from '@/services/api';
import { saveCursorPosition } from '@/utils/cursorUtils';

function TextOptimizer() {
    const editorRef = useRef<HTMLDivElement>(null);
    const textState = useTextState();
    const textChanges = useTextChanges(editorRef, textState.text, textState.cursorPosition);
    const [isLoading, setIsLoading] = useState(false);
    const [modelType, setModelType] = useState('gpt-4o-mini');
    const [customPrompt, setCustomPrompt] = useState('');

    const {
        language,
        setLanguage,
        isLoading: isLoadingLanguageDetection,
        autoDetectEnabled,
        setAutoDetectEnabled,
        detectLanguageCore,
        detectLanguageDebounced
    } = useLanguageDetection();

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
            const reader = await optimizeText(
                textState.text,
                language,
                customPrompt,
                modelType.toString()
            );
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
            const newText = editorRef.current.innerText;
            textState.setText(newText);
            textChanges.setChanges([]);
            textState.setOptimizedText("");
            textState.setIsOptimizationComplete(false);

            const newCursorPosition = saveCursorPosition(editorRef);
            textState.setCursorPosition(newCursorPosition);

            detectLanguageDebounced(newText);
        }
    }, [detectLanguageDebounced]);

    const handleApplyChanges = useCallback(() => {
        if (editorRef.current && textState.optimizedText) {
            editorRef.current.innerText = textState.optimizedText;
            textState.setText(textState.optimizedText);
            textChanges.setChanges([]);
            textState.setOptimizedText("");
            textState.setIsOptimizationComplete(false);
        }
    }, [textState, textChanges, editorRef]);

    const handleRevertChanges = useCallback(() => {
        if (editorRef.current && textState.originalText) {
            editorRef.current.innerText = textState.originalText;
            textState.setText(textState.originalText);
            textChanges.setChanges([]);
            textState.setOptimizedText("");
            textState.setIsOptimizationComplete(false);
        }
    }, [textState, textChanges, editorRef]);

    const handleAutoDetectChange = (checked: boolean) => {
        setAutoDetectEnabled(checked);
        if (checked) {
            detectLanguageCore(editorRef.current?.innerText || '');
        }
    };

    return (
        <div className='flex flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>
                <div className='flex flex-row gap-4 items-center flex-1'>
                    <LanguageSelector
                        language={language}
                        setLanguage={setLanguage}
                    />
                    <div className="flex items-center gap-2">
                        <Switch
                            id="autoDetect"
                            checked={autoDetectEnabled}
                            onCheckedChange={handleAutoDetectChange}
                        />
                        {isLoadingLanguageDetection ? (
                            <Label htmlFor="autoDetect" className='text-xs text-gray-500 animate-pulse'>
                                Auto-detecting language...
                            </Label>
                        ) : (
                            <Label htmlFor="autoDetect" className='text-xs text-gray-500'>
                                Auto-detect language
                            </Label>
                        )}
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <CustomPromptInput
                        customPrompt={customPrompt}
                        setCustomPrompt={setCustomPrompt}
                        onOptimize={() => handleOptimize(language, customPrompt)}
                    />
                    <TextEditor
                        editorRef={editorRef}
                        onInput={handleInput}
                        onOptimize={() => handleOptimize(language, customPrompt)}
                    />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <ModelSelector
                    model={modelType}
                    setModel={setModelType}
                />
                <EditorControls
                    isLoading={isLoading}
                    isOptimizationComplete={textState.isOptimizationComplete}
                    onOptimize={() => handleOptimize(language, customPrompt)}
                    onApplyChanges={handleApplyChanges}
                    onRevertChanges={handleRevertChanges}
                />
            </div>
        </div>
    );
}

export default TextOptimizer;
