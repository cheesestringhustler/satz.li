import { Button } from '@/components/ui/button';
import { useTextOptimizer } from '@/hooks/useTextOptimizer';

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

    return (
        <div className="flex flex-col gap-4">
            <div
                ref={editorRef}
                className="h-64 p-2 text-sm border rounded-md overflow-auto"
                contentEditable
                onInput={handleInput}
                onContextMenu={(e) => e.preventDefault()}
                style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            />
            <div className="flex justify-start gap-2">
                <Button onClick={handleOptimize} disabled={isLoading}>
                    {isLoading ? "Checking..." : "Check Text"}
                </Button>
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
