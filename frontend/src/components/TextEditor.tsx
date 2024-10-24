import React, { useRef, useEffect, useState } from 'react';

interface TextEditorProps {
    editorRef: React.RefObject<HTMLDivElement>;
    handleInput: () => void;
    handleEditorKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    setHoveredChangeIndex: (index: number | null) => void;
}

function TextEditor({ editorRef, handleInput, handleEditorKeyDown, setHoveredChangeIndex }: TextEditorProps) {
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

    const handleMouseOver = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('change')) {
            setHoveredChangeIndex(parseInt(target.getAttribute('data-index') || ''));
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
                    onInput={handleInput}
                    onKeyDown={handleEditorKeyDown}
                    onPaste={handlePaste}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseOver={handleMouseOver}
                    onMouseOut={() => setHoveredChangeIndex(null)}
                    style={{ height: `${editorHeight}px` }}
                />
            </div>
        </div>
    );
}

export default TextEditor;
