import { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import { diff_match_patch } from 'diff-match-patch';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import CustomPromptInput from '@/containers/CustomPromptInput';
import EditorControls from '@/containers/EditorControls';
import { LanguageSelector } from '@/containers/LanguageSelector';
import ModelSelector from '@/containers/ModelSelector';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';
import { useTextState } from '@/hooks/useTextState';
import { optimizeText } from '@/services/api';

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

    const {
        language,
        setLanguage,
        isLoading: isLoadingLanguageDetection,
        autoDetectEnabled,
        setAutoDetectEnabled,
        detectLanguageCore,
        detectLanguageDebounced
    } = useLanguageDetection();

    // Initialize Quill editor
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, QUILL_OPTIONS);
            
            // Set default text
            quillRef.current.setText(textState.text);
            
            // Handle text changes
            quillRef.current.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    const text = quillRef.current?.getText() || '';
                    textState.setText(text);
                    setPendingChanges(undefined);
                    textState.setOptimizedText('');
                    textState.setIsOptimizationComplete(false);
                    detectLanguageDebounced(text);
                }
            });
        }

        return () => {
            quillRef.current = undefined;
        };
    }, []);

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
        setPendingChanges(undefined);
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
            }

            // Calculate changes using Delta
            const currentContents = quillRef.current.getContents();
            const optimizedDelta = new Delta().insert(newOptimizedText);
            const changes = currentContents.diff(optimizedDelta);
            
            // Process changes to merge adjacent operations
            const mergedOps: any[] = [];
            let currentOp: any = null;

            changes.ops?.forEach(op => {
                if (op.retain) {
                    if (currentOp) {
                        mergedOps.push(currentOp);
                        currentOp = null;
                    }
                    mergedOps.push(op);
                } else {
                    if (!currentOp) {
                        currentOp = { ...op };
                    } else {
                        // Merge with previous op if they're the same type
                        if ((op.insert && currentOp.insert) || (op.delete && currentOp.delete)) {
                            if (op.insert) currentOp.insert += op.insert;
                            if (op.delete) currentOp.delete += op.delete;
                        } else {
                            mergedOps.push(currentOp);
                            currentOp = { ...op };
                        }
                    }
                }
            });
            if (currentOp) {
                mergedOps.push(currentOp);
            }

            // Apply formatting to merged changes
            const formattedChanges = new Delta();
            mergedOps.forEach(op => {
                console.log(op);
                if (op.retain) {
                    formattedChanges.retain(op.retain);
                } else if (op.insert) {
                    formattedChanges.insert(op.insert, {
                        class: 'ql-change ql-insertion',
                        color: '#22c55e',
                        background: '#dcfce7'
                    });
                } else if (op.delete) {
                    // First insert the deleted text with deletion styling
                    formattedChanges.insert(quillRef.current!.getText().substr(formattedChanges.length(), op.delete), {
                        class: 'ql-change ql-deletion',
                        color: '#ef4444',
                        background: '#fee2e2',
                        strike: true
                    });
                    // Then delete it
                    formattedChanges.delete(op.delete);
                }
            });

            setPendingChanges(formattedChanges);
            textState.setOptimizedText(newOptimizedText);
        } catch (error) {
            console.error('Error:', error);
            quillRef.current.setText("An error occurred while optimizing the text.");
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
                    onOptimize={() => handleOptimize(language, customPrompt)}
                    onApplyChanges={handleApplyChanges}
                    onRevertChanges={handleRevertChanges}
                />
            </div>
        </div>
    );
}

export default TextOptimizer;
