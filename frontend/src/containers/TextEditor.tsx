import React, { useRef, useEffect, useState } from 'react';

interface TextEditorProps {
    editorRef: React.RefObject<HTMLDivElement>;
    onInput: () => void;
    onOptimize: () => void;
}

function TextEditor({ editorRef, onInput, onOptimize }: TextEditorProps) {
    const [editorHeight, setEditorHeight] = useState(0);
    const resizeRef = useRef<HTMLDivElement>(null);

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

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const selection = document.getSelection();
        if (selection) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onOptimize();
        } else if (e.key === 'Enter' && !e.shiftKey) {
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

    return (
        <div className='flex flex-col gap-2 mt-2 flex-1'>
            <span className='text-xs text-gray-500 text-end'>left click to apply, right click to reject changes</span>
            <div
                ref={resizeRef}
                className="resize-y overflow-auto"
                style={{ minHeight: '384px', maxHeight: '80vh' }}
            >
                <div
                    ref={editorRef}
                    className="texteditor p-2 text-sm border rounded-md overflow-auto focus:border-gray-800 focus:dark:border-gray-200 whitespace-pre-wrap break-words outline-none"
                    contentEditable
                    onInput={onInput}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ height: `${editorHeight}px` }}
                />
            </div>
        </div>
    );
}

export default TextEditor;
