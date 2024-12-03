import { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import { diff_match_patch } from 'diff-match-patch';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

import CustomPromptInput from '@/features/editor/components/custom-prompt-input';
import EditorControls from '@/features/editor/components/editor-controls';
import { LanguageSelector } from '@/features/editor/components/language-selector';
import ModelSelector from '@/features/editor/components/model-selector';
import { useLanguageDetection } from '@/features/editor/hooks/use-language-detection';
import { useTextState } from '@/features/editor/hooks/use-text-state';
import { optimizeText } from '@/features/editor/services';
import { useRequests } from '@/context/requests-context';

// Define Quill options
const QUILL_OPTIONS = {
    theme: 'snow',
    modules: {
        toolbar: false,
        history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
        }
    },
    placeholder: 'Enter your text here...',
};

function TextOptimizer() {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill>();
    const textState = useTextState();
    const [isLoading, setIsLoading] = useState(false);
    const [modelType, setModelType] = useState('gpt-4o-mini');
    const [customPrompt, setCustomPrompt] = useState('');
    const [pendingChanges, setPendingChanges] = useState<Delta>();
    const dmp = useRef(new diff_match_patch());
    const { toast } = useToast();

    const {
        language,
        setLanguage,
        isLoading: isLoadingLanguageDetection,
        autoDetectEnabled,
        setAutoDetectEnabled,
        detectLanguageCore,
        detectLanguageDebounced
    } = useLanguageDetection();

    const { refreshRequests } = useRequests();

    // Initialize Quill editor
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, QUILL_OPTIONS);

            // Set default text
            quillRef.current.setText(textState.text);

            // Handle text changes
            quillRef.current.on('text-change', (_delta, _oldDelta, source) => {
                if (source === 'user') {
                    const text = quillRef.current?.getText() || '';
                    textState.setText(text);
                    setPendingChanges(undefined);
                    textState.setOptimizedText('');
                    textState.setIsOptimizationComplete(false);
                    if (autoDetectEnabled) {
                        detectLanguageDebounced(text);
                    }
                }
            });
        }

        return () => {
            quillRef.current = undefined;
        };
    }, [autoDetectEnabled]);

    // Apply pending changes to the editor
    useEffect(() => {
        if (quillRef.current && pendingChanges) {
            // Save current selection
            const selection = quillRef.current.getSelection();

            // Apply the changes
            quillRef.current.updateContents(pendingChanges);

            // Restore selection
            if (selection) {
                quillRef.current.setSelection(selection);
            }
        }
    }, [pendingChanges]);

    const handleOptimize = async (language: string, customPrompt: string) => {
        if (!quillRef.current) return;

        setIsLoading(true);
        const originalText = textState.text;
        textState.setOriginalText(originalText);
        let accumulatedText = '';

        try {
            const reader = await optimizeText(
                originalText,
                language,
                customPrompt,
                modelType.toString()
            );

            while (true) {
                const { done, value } = await reader.read();
                const chunk = new TextDecoder().decode(value);
                accumulatedText += chunk;

                // Reset the editor content first
                const delta = new Delta().insert(originalText);
                quillRef.current.setContents(delta);

                // Calculate diffs based on completion status
                let diffs;
                if (done) {
                    diffs = dmp.current.diff_main(originalText, accumulatedText);
                } else {
                    // Compare only up to the current stream position
                    const comparisonLength = accumulatedText.length;
                    const textToCompare = originalText.slice(0, comparisonLength);
                    diffs = dmp.current.diff_main(textToCompare, accumulatedText);
                }
                dmp.current.diff_cleanupSemantic(diffs);

                // Apply formatted changes
                const formattedChanges = new Delta();

                diffs.forEach(([operation, text]) => {
                    if (operation === 0) { // Unchanged text
                        formattedChanges.retain(text.length);
                    } else if (operation === -1) { // Deletion
                        formattedChanges.delete(text.length);
                        formattedChanges.insert(text, {
                            color: '#ef4444',
                            strike: true,
                            background: '#fee2e2'
                        });
                    } else if (operation === 1) { // Insertion
                        formattedChanges.insert(text, {
                            color: '#22c55e',
                            background: '#dcfce7'
                        });
                    }
                });

                // Only retain remaining text if we're still streaming
                if (!done) {
                    const remainingLength = originalText.length - accumulatedText.length;
                    if (remainingLength > 0) {
                        formattedChanges.retain(remainingLength);
                    }
                }

                quillRef.current.updateContents(formattedChanges);
                textState.setOptimizedText(accumulatedText);

                if (done) {
                    textState.setIsOptimizationComplete(true);
                    await refreshRequests();
                    break;
                }
            }
        } catch (error) {
            // Show toast for insufficient requests
            if (error instanceof Error && error.message.includes('Insufficient credits')) {
                toast({
                    variant: "destructive",
                    title: "Insufficient Requests",
                    description: "You don't have enough requests to perform this optimization. Please purchase more requests to continue.",
                });
            } else if (error instanceof Error && error.message.includes('Unauthorized')) {
                toast({
                    variant: "destructive",
                    title: "Sign in required",
                    description: "Please sign in to continue.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "An error occurred while optimizing the text.",
                });
            }

            quillRef.current.setText(originalText);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyChanges = useCallback(() => {
        if (quillRef.current && textState.optimizedText) {
            quillRef.current.setText(textState.optimizedText);
            textState.setText(textState.optimizedText);
            setPendingChanges(undefined);
            textState.setOptimizedText('');
            textState.setIsOptimizationComplete(false);
        }
    }, [textState]);

    const handleRevertChanges = useCallback(() => {
        if (quillRef.current && textState.originalText) {
            quillRef.current.setText(textState.originalText);
            textState.setText(textState.originalText);
            setPendingChanges(undefined);
            textState.setOptimizedText('');
            textState.setIsOptimizationComplete(false);
        }
    }, [textState]);

    const handleAutoDetectChange = (checked: boolean) => {
        setAutoDetectEnabled(checked);
        if (checked) {
            detectLanguageCore(quillRef.current?.getText() || '');
        }
    };

    const handleCopy = useCallback(async () => {
        if (quillRef.current) {
            const text = quillRef.current.getText();
            await navigator.clipboard.writeText(text);
        }
    }, []);

    const handlePaste = useCallback(async () => {
        if (quillRef.current) {
            try {
                const text = await navigator.clipboard.readText();
                quillRef.current.setText(text);
                textState.setText(text);
                if (autoDetectEnabled) {
                    detectLanguageDebounced(text);
                }
            } catch (error) {
                console.error('Failed to paste:', error);
            }
        }
    }, [autoDetectEnabled]);

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
                    <div className="flex flex-col gap-2">
                        <div
                            ref={editorRef}
                            className="border rounded-md min-h-[384px] max-h-[80vh]"
                        />
                    </div>
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
                    text={textState.text}
                    languageCode={language}
                    customPrompt={customPrompt}
                    modelType={modelType}
                    onOptimize={() => handleOptimize(language, customPrompt)}
                    onApplyChanges={handleApplyChanges}
                    onRevertChanges={handleRevertChanges}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                />
            </div>
        </div>
    );
}

export default TextOptimizer;
