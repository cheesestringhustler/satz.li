import { Button } from '@/components/ui/button';
import { useTextOptimizer } from '@/hooks/useTextOptimizer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CustomPromptInput } from '@/components/CustomPromptInput';
import { useState } from 'react';
import TextEditor from '@/components/TextEditor';

function TextOptimizer() {
    const {
        isLoading,
        isOptimizationComplete,
        editorRef,
        handleOptimize,
        handleInput,
        handleApplyChanges,
        handleRevertChanges,
        handleKeyDown,
        setHoveredChangeIndex
    } = useTextOptimizer();
    const [language, setLanguage] = useState('en');
    const [customPrompt, setCustomPrompt] = useState('');

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
