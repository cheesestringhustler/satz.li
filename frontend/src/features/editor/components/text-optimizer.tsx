import { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import { diff_match_patch } from 'diff-match-patch';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';

import CustomPromptInput from '@/features/editor/components/custom-prompt-input';
import EditorControls from '@/features/editor/components/editor-controls';
import { LanguageSelector } from '@/features/editor/components/language-selector';
import ModelSelector from '@/features/editor/components/model-selector';
import { useLanguageDetection } from '@/features/editor/hooks/use-language-detection';
import { useTextState } from '@/features/editor/hooks/use-text-state';
import { optimizeText } from '@/features/editor/services';
import { useCredits } from '@/context/credits-context';
import { useConfig } from '../context/config-context';

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
    const [context, setContext] = useState('');
    const [pendingChanges, setPendingChanges] = useState<Delta>();
    const dmp = useRef(new diff_match_patch());
    const { toast } = useToast();
    const [isOverLimit, setIsOverLimit] = useState(false);
    const [isContextOverLimit, setIsContextOverLimit] = useState(false);
    const { requestLimits } = useConfig();
    const [activeTab, setActiveTab] = useState<'prompt' | 'context'>('prompt');
    const promptRef = useRef<HTMLDivElement>(null);
    const contextRef = useRef<HTMLTextAreaElement>(null);

    const {
        language,
        setLanguage,
        isLoading: isLoadingLanguageDetection,
        autoDetectEnabled,
        setAutoDetectEnabled,
        detectLanguageCore,
        detectLanguageDebounced
    } = useLanguageDetection();

    const { refreshCredits } = useCredits();

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
                    const wasOverLimit = isOverLimit;
                    const nowOverLimit = text.length > requestLimits.defaultMaxTextChars;
                    
                    // Only show toast when first exceeding the limit
                    if (!wasOverLimit && nowOverLimit) {
                        toast({
                            variant: "destructive",
                            title: "Character limit exceeded",
                            description: `Text is limited to ${requestLimits.defaultMaxTextChars} characters. The text will not be processed until it's within the limit.`,
                        });
                    }
                    
                    setIsOverLimit(nowOverLimit);
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
    }, [autoDetectEnabled, isOverLimit, requestLimits]);

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
        
        if (isOverLimit) {
            toast({
                variant: "destructive",
                title: "Cannot process text",
                description: `Please reduce the text to ${requestLimits.defaultMaxTextChars} characters or less before processing.`,
            });
            return;
        }

        if (isContextOverLimit) {
            toast({
                variant: "destructive",
                title: "Cannot process text",
                description: `Please reduce the context to ${requestLimits.defaultMaxContextChars} characters or less before processing.`,
            });
            return;
        }

        setIsLoading(true);
        const originalText = textState.text;
        textState.setOriginalText(originalText);
        let accumulatedText = '';

        try {
            const reader = await optimizeText(
                originalText,
                language,
                customPrompt,
                modelType.toString(),
                context
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
                    await refreshCredits();
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
                
                if (text.length > requestLimits.defaultMaxTextChars) {
                    toast({
                        variant: "destructive",
                        title: "Character limit exceeded",
                        description: `Pasted text exceeds the ${requestLimits.defaultMaxTextChars} character limit. The text will not be processed until it's within the limit.`,
                    });
                    setIsOverLimit(true);
                } else {
                    setIsOverLimit(false);
                }
                
                if (autoDetectEnabled) {
                    detectLanguageDebounced(text);
                }
            } catch (error) {
                console.error('Failed to paste:', error);
            }
        }
    }, [autoDetectEnabled, requestLimits]);

    // Add context change handler
    const handleContextChange = (value: string) => {
        const wasOverLimit = isContextOverLimit;
        const nowOverLimit = value.length > requestLimits.defaultMaxContextChars;
        
        // Only show toast when first exceeding the limit
        if (!wasOverLimit && nowOverLimit) {
            toast({
                variant: "destructive",
                title: "Character limit exceeded",
                description: `Context is limited to ${requestLimits.defaultMaxContextChars} characters. The text will not be processed until it's within the limit.`,
            });
        }
        
        setIsContextOverLimit(nowOverLimit);
        setContext(value);
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
            <TooltipProvider>
                <Card>
                    <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                        {/* Controls Section */}
                        <div className="flex items-center gap-4 border-b pb-4">
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
                                onOptimize={() => handleOptimize(language, customPrompt)}
                                onApplyChanges={handleApplyChanges}
                                onRevertChanges={handleRevertChanges}
                                onCopy={handleCopy}
                                onPaste={handlePaste}
                            />
                        </div>

                        {/* Input Tabs */}
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'prompt' | 'context')} className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList>
                                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                                    <TabsTrigger value="context">Context</TabsTrigger>
                                </TabsList>
                                <div className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    Characters: {textState.text.length}/{requestLimits.defaultMaxTextChars}
                                </div>
                            </div>

                            <TabsContent value="prompt" className="mt-0">
                                <div ref={promptRef}>
                                    <CustomPromptInput
                                        customPrompt={customPrompt}
                                        setCustomPrompt={setCustomPrompt}
                                        onOptimize={() => handleOptimize(language, customPrompt)}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="context" className="mt-0">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="context">Additional Context</Label>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Add relevant context to help optimize your text more accurately
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <textarea
                                        ref={contextRef}
                                        id="context"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                        placeholder="Add context for optimization..."
                                        value={context}
                                        onChange={(e) => handleContextChange(e.target.value)}
                                    />
                                    <div className={`text-xs ${isContextOverLimit ? 'text-destructive' : 'text-muted-foreground'} text-right`}>
                                        {context.length}/{requestLimits.defaultMaxContextChars}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Editor Section */}
                        <div className="border rounded-md shadow-sm">
                            <div
                                ref={editorRef}
                                className="aspect-[1/1.4142] w-full"
                                style={{ minHeight: '0' }}
                            />
                        </div>
                    </div>
                    </CardContent>
                </Card>
            </TooltipProvider>
        </div>
    );
}

export default TextOptimizer;
