import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTextOptimizer } from '@/hooks/useTextOptimizer';
import LanguageDropdown from './languageDropdown';
import languages from '@/assets/languages.json';
import { useState, useEffect, useRef } from 'react';

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
    const [editorHeight, setEditorHeight] = useState(256); // Default height of 64 * 4 = 256px
    const resizeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .change { cursor: pointer; }
            .light .texteditor .change.insertion { text-decoration: none; color: #22c55e; background-color: #dcfce7; }
            .light .texteditor .change.deletion { text-decoration: line-through; color: #ef4444; background-color: #fee2e2; }
            .dark .texteditor .change.insertion { text-decoration: none; color: #4ade80; background-color: #14532d; }
            .dark .texteditor .change.deletion { text-decoration: line-through; color: #fca5a5; background-color: #7f1d1d; }
            .light .texteditor .change:hover { background-color: rgba(0, 0, 0, 0.1); }
            .dark .texteditor .change:hover { background-color: rgba(255, 255, 255, 0.1); }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === resizeRef.current) {
                    setEditorHeight(entry.contentRect.height);
                }
            }
        });

        if (resizeRef.current) {
            resizeObserver.observe(resizeRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleOptimize(languages.find(lang => lang.code === language)?.name || '', customPrompt);
        }
    };

    const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleOptimize(languages.find(lang => lang.code === language)?.name || '', customPrompt);
        } else {
            handleKeyDown(e);
        }
    };

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
                    onKeyDown={handlePromptKeyDown}
                />
                </div>
            </div>

            <div className='flex flex-col gap-2 mt-2'>
                <span className='text-xs text-gray-500 text-end'>left click to apply, right click to reject changes</span>
                <div
                    ref={resizeRef}
                    className="resize-y overflow-auto"
                    style={{ minHeight: '64px', maxHeight: '80vh' }}
                >
                    <div
                        ref={editorRef}
                        className="texteditor p-2 text-sm border rounded-md overflow-auto focus:border-gray-800 focus:dark:border-gray-200"
                        contentEditable
                        onInput={handleInput}
                        onKeyDown={handleEditorKeyDown}
                        onPaste={(e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData('text/plain');
                            document.getSelection()?.getRangeAt(0).insertNode(document.createTextNode(text));
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        onMouseOver={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.classList.contains('change')) {
                                setHoveredChangeIndex(parseInt(target.getAttribute('data-index') || ''));
                            }
                        }}
                        onMouseOut={() => setHoveredChangeIndex(null)}
                        style={{ 
                            whiteSpace: 'pre-wrap', 
                            wordWrap: 'break-word',
                            outline: 'none',
                            height: `${editorHeight}px`,
                        }}
                    />
                </div>
            </div>
            
            <div className="flex justify-start gap-2">
                <Button onClick={() => handleOptimize(languages.find(lang => lang.code === language)?.name || '', customPrompt)} disabled={isLoading}>
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
