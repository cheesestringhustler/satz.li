import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface EditorControlsProps {
    isLoading: boolean;
    isOptimizationComplete: boolean;
    modelType: string;
    text: string;
    languageCode: string;
    customPrompt: string;
    onOptimize: () => void;
    onApplyChanges: () => void;
    onRevertChanges: () => void;
    onCopy: () => void;
    onPaste: () => void;
}

const EditorControls = ({
    isLoading,
    isOptimizationComplete,
    onOptimize,
    onApplyChanges,
    onRevertChanges,
    onCopy,
    onPaste
}: EditorControlsProps) => {
    return (
        <div className="flex flex-col items-start gap-7 self-start max-h-[476px]">
            <div className="flex flex-col gap-2 w-full">
                <Button onClick={onOptimize} disabled={isLoading}>
                    {isLoading ? "Optimizing..." : "Optimize"}
                </Button>
                <span className="text-xs text-muted-foreground">
                    Uses 1 credit
                </span>
            </div>
            <div className='flex flex-col gap-1 w-full'>
                <span className='text-xs text-muted-foreground'>Changes:</span>
                <div className='flex flex-nowrap gap-2'>        
                    <Button onClick={onApplyChanges} disabled={!isOptimizationComplete}>
                        Apply
                    </Button>
                    <Button onClick={onRevertChanges} disabled={!isOptimizationComplete}>
                        Revert
                    </Button>
                </div>

                <span className='mt-2 text-xs text-muted-foreground'>Clipboard:</span>
                <div className='flex flex-nowrap gap-2'>
                    <Button onClick={onCopy}>
                        Copy
                    </Button>
                    <Button onClick={onPaste}>
                        Paste
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EditorControls;
