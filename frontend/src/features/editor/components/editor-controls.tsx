import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
    CheckIcon, 
    ClipboardCopyIcon, 
    ClipboardIcon,
    ReloadIcon, 
    UpdateIcon 
} from '@radix-ui/react-icons';

export interface EditorControlsProps {
    isLoading: boolean;
    isOptimizationComplete: boolean;
    text: string;
    languageCode: string;
    customPrompt: string;
    onOptimize: () => void;
    onApplyChanges: () => void;
    onRevertChanges: () => void;
    onCopy: () => void;
    onPaste: () => void;
    className?: string;
}

export function EditorControls({
    isLoading,
    isOptimizationComplete,
    onOptimize,
    onApplyChanges,
    onRevertChanges,
    onCopy,
    onPaste,
    className
}: EditorControlsProps) {
    return (
        <div className={cn("flex items-center gap-2 justify-end w-full", className)}>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onApplyChanges}
                    disabled={!isOptimizationComplete}
                    title="Apply changes"
                >
                    <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRevertChanges}
                    disabled={!isOptimizationComplete}
                    title="Revert changes"
                >
                    <ReloadIcon className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2 border-l pl-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onCopy}
                    title="Copy to clipboard"
                >
                    <ClipboardCopyIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onPaste}
                    title="Paste from clipboard"
                >
                    <ClipboardIcon className="h-4 w-4" />
                </Button>
            </div>

            

            <Button 
                onClick={onOptimize} 
                disabled={isLoading}
                className="gap-2 min-w-24"
            >
                {isLoading ? (
                    <>
                        <UpdateIcon className="h-4 w-4 animate-spin" />
                        Optimizing...
                    </>
                ) : (
                    <>
                        <ReloadIcon className="h-4 w-4" />
                        Optimize
                    </>
                )}
            </Button>
        </div>
    );
}

export default EditorControls;
