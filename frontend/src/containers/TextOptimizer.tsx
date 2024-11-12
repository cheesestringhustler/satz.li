import { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';

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

            // Add click handlers for accepting/rejecting changes
            editorRef.current.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('ql-change')) {
                    const index = parseInt(target.getAttribute('data-index') || '0');
                    handleChangeClick(index);
                }
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.removeEventListener('click', () => {});
            }
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

    const handleChangeClick = (index: number) => {
        if (!quillRef.current || !pendingChanges?.ops?.[index]) return;

        const op = pendingChanges.ops[index];
        const currentContents = quillRef.current.getContents();
        
        // Create a new delta that applies just this change
        const changeDelta = new Delta([op]);
        quillRef.current.updateContents(changeDelta);

        // Remove this change from pending changes
        const newPendingChanges = new Delta(
            pendingChanges.ops.filter((_, i) => i !== index)
        );
        setPendingChanges(newPendingChanges);

        // If no more changes, clear optimization state
        if (newPendingChanges.ops.length === 0) {
            textState.setOptimizedText('');
            textState.setIsOptimizationComplete(false);
        }
    };

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
            
            // Apply changes with formatting
            const formattedChanges = new Delta(changes.ops?.map(op => {
                if (op.insert) {
                    return { 
                        ...op,
                        attributes: { 
                            ...op.attributes,
                            class: 'ql-change ql-insertion',
                            color: '#22c55e',
                            background: '#dcfce7'
                        }
                    };
                }
                if (op.delete) {
                    return { 
                        ...op,
                        attributes: { 
                            ...op.attributes,
                            class: 'ql-change ql-deletion',
                            color: '#ef4444',
                            background: '#fee2e2',
                            strike: true
                        }
                    };
                }
                return op;
            }));

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
