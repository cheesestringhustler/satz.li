import { Button } from '@/components/ui/button';

interface EditorControlsProps {
    isLoading: boolean;
    isOptimizationComplete: boolean;
    onOptimize: () => void;
    onApplyChanges: () => void;
    onRevertChanges: () => void;
}

const EditorControls = ({
    isLoading,
    isOptimizationComplete,
    onOptimize,
    onApplyChanges,
    onRevertChanges
}: EditorControlsProps) => {
    return (
        <div className="flex flex-col items-start gap-7 self-start max-h-[476px]">
            <Button onClick={onOptimize} disabled={isLoading}>
                {isLoading ? "Optimizing..." : "Optimize"}
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
};

export default EditorControls;
