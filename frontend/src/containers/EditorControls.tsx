import { Button } from '@/components/ui/button';
import { getCreditsEstimate } from '@/services/api';
import { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash/debounce';

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
    modelType,
    text,
    languageCode,
    customPrompt,
    onOptimize,
    onApplyChanges,
    onRevertChanges,
    onCopy,
    onPaste
}: EditorControlsProps) => {
    const [requiredCredits, setRequiredCredits] = useState(0);

    // Create debounced calculation function
    const debouncedCalculate = useMemo(
        () => debounce(async (text: string, modelType: string, languageCode: string, customPrompt: string) => {
            const credits = await getCreditsEstimate(modelType, { text, languageCode, customPrompt });
            setRequiredCredits(credits.creditsEstimate);
        }, 500),
        []
    );

    // Update credits when text or model changes
    useEffect(() => {
        debouncedCalculate(text, modelType, languageCode, customPrompt);
        return () => {
            debouncedCalculate.cancel();
        };
    }, [text, modelType, languageCode, customPrompt, debouncedCalculate]);

    return (
        <div className="flex flex-col items-start gap-7 self-start max-h-[476px]">
            <div className="flex flex-col gap-2">
                <Button onClick={onOptimize} disabled={isLoading}>
                    {isLoading ? "Optimizing..." : "Optimize"}
                </Button>
                <span className="text-xs text-muted-foreground">
                    {requiredCredits > 0 ? `Required credits: ~${requiredCredits}` : ''}
                </span>
            </div>
            <div className='flex-1'></div>
            <div className='flex flex-nowrap gap-2'>          
                <Button onClick={onApplyChanges} disabled={!isOptimizationComplete}>
                    Apply All
                </Button>
                <Button onClick={onRevertChanges} disabled={!isOptimizationComplete}>
                    Revert
                </Button>
            </div>
            <div className='flex flex-nowrap gap-2'>
                <Button onClick={onCopy}>
                    Copy
                </Button>
                <Button onClick={onPaste}>
                    Paste
                </Button>
            </div>
        </div>
    );
};

export default EditorControls;
