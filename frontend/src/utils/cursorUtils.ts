export const restoreCursorPosition = (
    editorRef: React.RefObject<HTMLDivElement>,
    cursorPosition: number | null
) => {
    if (!editorRef.current || cursorPosition === null) return;

    const selection = window.getSelection();
    const range = document.createRange();
    let currentNode = editorRef.current.firstChild;
    let currentOffset = 0;

    while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
            const nodeLength = currentNode.textContent?.length || 0;
            if (currentOffset + nodeLength >= cursorPosition) {
                range.setStart(currentNode, cursorPosition - currentOffset);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
                break;
            }
            currentOffset += nodeLength;
        } else if (currentNode.nodeName === 'BR') {
            currentOffset += 1; // Count line breaks as 1 character
            if (currentOffset === cursorPosition) {
                range.setStartAfter(currentNode);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
                break;
            }
        }
        currentNode = currentNode.nextSibling;
    }
};

export const saveCursorPosition = (
    editorRef: React.RefObject<HTMLDivElement>
): number | null => {
    if (!editorRef.current) return null;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let currentNode = editorRef.current.firstChild;
        let offset = 0;

        while (currentNode) {
            if (currentNode === range.startContainer) {
                offset += range.startOffset;
                return offset;
            } else if (currentNode.nodeType === Node.TEXT_NODE) {
                offset += currentNode.textContent?.length || 0;
            } else if (currentNode.nodeName === 'BR') {
                offset += 1; // Count line breaks as 1 character
            }
            currentNode = currentNode.nextSibling;
        }
    }

    return null;
};
