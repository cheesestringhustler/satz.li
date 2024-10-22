import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTextOptimizer } from '@/hooks/useTextOptimizer';
import LanguageDropdown from './languageDropdown';
import languages from '@/assets/languages.json';
import { useState } from 'react';

function TextOptimizer() {
    const {
        isLoading,
        isOptimizationComplete,
        editorRef,
        handleOptimize,
        handleInput,
        handleApplyChanges,
        handleRevertChanges,
        handleKeyDown
    } = useTextOptimizer();
    const [language, setLanguage] = useState('en');
    const [customPrompt, setCustomPrompt] = useState('');

    return (
        <div className="flex flex-col gap-4">
            <div className='flex flex-row gap-2'>
                <div className='flex flex-col gap-2'>
                <Label htmlFor="language">Language</Label>
                <LanguageDropdown language={language} setLanguage={setLanguage} />
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                <Label htmlFor="customPrompt">Custom Prompt</Label>
                <Input
                    id="customPrompt"
                    type="text" 
                    placeholder="Provide instructions such as 'use passive voice' or 'make it shorter'" 
                    value={customPrompt} 
                    onChange={(e) => setCustomPrompt(e.target.value)} 
                />
                </div>
            </div>

            <div className='flex flex-col gap-2 mt-2'>
                {/* <Label htmlFor="text">Text</Label> */}
                <div
                ref={editorRef}
                className="texteditor h-64 p-2 text-sm border rounded-md overflow-auto focus:border-gray-800 focus:dark:border-gray-200"
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.getSelection()?.getRangeAt(0).insertNode(document.createTextNode(text));
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordWrap: 'break-word',
                    outline: 'none',
                    }}
                />
            </div>
            
            <div className="flex justify-start gap-2">
                <Button onClick={() => handleOptimize(languages.find(lang => lang.code === language)?.name || '', customPrompt)} disabled={isLoading}>
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
