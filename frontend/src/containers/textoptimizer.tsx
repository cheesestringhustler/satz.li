import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTextOptimizer } from '@/hooks/useTextOptimizer';
import LanguageDropdown from './languageDropdown';
import { useState } from 'react';

function TextOptimizer() {
    const {
        isLoading,
        isOptimizationComplete,
        editorRef,
        handleOptimize,
        handleInput,
        handleApplyChanges,
        handleRevertChanges
    } = useTextOptimizer();
    const [language, setLanguage] = useState('de-ch');
    const [customPrompt, setCustomPrompt] = useState('');

    return (
        <div className="flex flex-col gap-4">
            <LanguageDropdown language={language} setLanguage={setLanguage} />

            <div className='flex flex-col gap-2'>
                <Input type="text" placeholder="Provide custom instructions such as 'use passive voice'" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} />
                <div
                    ref={editorRef}
                    className="h-64 p-2 text-sm border rounded-md overflow-auto"
                    contentEditable
                    onInput={handleInput}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                />
            </div>
            
            <div className="flex justify-start gap-2">
                <Button onClick={() => handleOptimize()} disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Text"}
                </Button>
                <div className='flex-1'></div>
                <Button onClick={handleApplyChanges} disabled={!isOptimizationComplete}>
                    Apply Changes
                </Button>
                <Button onClick={handleRevertChanges} disabled={!isOptimizationComplete}>
                    Revert Changes
                </Button>
            </div>

        </div>
    )
}

export default TextOptimizer;
