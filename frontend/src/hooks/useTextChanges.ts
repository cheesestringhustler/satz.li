import { useState, useCallback } from 'react';
import { diff_match_patch } from 'diff-match-patch';
import { Change } from '@/types/Change';
import { restoreCursorPosition } from '@/utils/cursorUtils';

export function useTextChanges(editorRef: React.RefObject<HTMLDivElement>, text: string, cursorPosition: number | null) {
    const [changes, setChanges] = useState<Change[]>([]);
    const dmp = new diff_match_patch();

    const updateTextWithChanges = useCallback((originalText: string, newOptimizedText: string, isComplete: boolean) => {
        let diffs: [number, string][];
        if (isComplete) {
            diffs = dmp.diff_main(originalText, newOptimizedText);
            dmp.diff_cleanupSemantic(diffs);
        } else {
            const comparisonLength = Math.min(originalText.length, newOptimizedText.length);
            diffs = dmp.diff_main(originalText.slice(0, comparisonLength), newOptimizedText);
            dmp.diff_cleanupSemantic(diffs);
        }

        const newChanges: Change[] = [];
        let position = 0;

        diffs.forEach(([operation, text]) => {
            if (operation === -1) {
                // Deletion
                newChanges.push({
                    start: position,
                    end: position + text.length,
                    text: ''
                });
                position += text.length;
            } else if (operation === 1) {
                // Insertion
                newChanges.push({
                    start: position,
                    end: position,
                    text: text
                });
            } else {
                // No change
                position += text.length;
            }
        });

        setChanges(newChanges);
    }, [dmp]);

    const applyChanges = useCallback(() => {
        if (!editorRef.current) return;

        let result = text;
        let offset = 0;

        changes.sort((a, b) => a.start - b.start).forEach((change, index) => {
            const beforeChange = result.slice(0, change.start + offset);
            const afterChange = result.slice(change.end + offset);
            if (change.text) {
                result = beforeChange + `<span class="change insertion" data-index="${index}">${change.text}</span>` + afterChange;
                offset += change.text.length - (change.end - change.start) + `<span class="change insertion" data-index="${index}"></span>`.length;
            } else {
                result = beforeChange + `<span class="change deletion" data-index="${index}">${result.slice(change.start + offset, change.end + offset)}</span>` + afterChange;
                offset += `<span class="change deletion" data-index="${index}"></span>`.length;
            }
        });

        editorRef.current.innerHTML = result;
        restoreCursorPosition(editorRef, cursorPosition);
    }, [changes, text, cursorPosition, editorRef]);

    const applyChange = useCallback((index: number, currentText: string, setText: (text: string) => void) => {
        const change = changes[index];
        if (change) {
            let newText = currentText.slice(0, change.start) + change.text + currentText.slice(change.end);
            setText(newText);
            
            // Update positions of remaining changes
            const updatedChanges = changes.filter((_, i) => i !== index).map(c => {
                if (c.start > change.start) {
                    return {
                        ...c,
                        start: c.start - (change.end - change.start) + change.text.length,
                        end: c.end - (change.end - change.start) + change.text.length
                    };
                }
                return c;
            });
            
            setChanges(updatedChanges);
        }
    }, [changes]);

    const rejectChange = useCallback((index: number) => {
        setChanges(changes.filter((_, i) => i !== index));
    }, [changes]);

    const handleChangeClick = useCallback((e: MouseEvent, setText: (text: string) => void) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('change')) {
            e.preventDefault();
            const index = parseInt(target.getAttribute('data-index') || '');
            if (!isNaN(index)) {
                if (e.button === 0) { // Left click
                    applyChange(index, text, setText);
                } else if (e.button === 2) { // Right click
                    rejectChange(index);
                }
            }
        }
    }, [applyChange, rejectChange, text]);

    return {
        changes,
        setChanges,
        updateTextWithChanges,
        applyChanges,
        applyChange,
        rejectChange,
        handleChangeClick
    };
}
