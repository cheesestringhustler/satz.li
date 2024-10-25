import { Button } from '@/components/ui/button';

interface EditorControlsProps {
    isLoading: boolean;
    isOptimizationComplete: boolean;
    onOptimize: () => void;
    onApplyChanges: () => void;
    onRevertChanges: () => void;
}

export function EditorControls({
    isLoading,
    isOptimizationComplete,
    onOptimize,
    onApplyChanges,
    onRevertChanges,
}: EditorControlsProps) {
    return (
        <div className="flex flex-col justify-between gap-2">
            <Button onClick={onOptimize} disabled={isLoading}>
                {isLoading ? "Checking..." : "Check Text"}
            </Button>
            <div className='flex-1'></div>
            <div className='flex flex-nowrap gap-2'>
                <Button onClick={onApplyChanges} disabled={!isOptimizationComplete}>
                    Apply All
                </Button>
                <Button onClick={onRevertChanges} disabled={!isOptimizationComplete}>
                    Revert
                </Button>
            </div>
        </div>
    );
}
