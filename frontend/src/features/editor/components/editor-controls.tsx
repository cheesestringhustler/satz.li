import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
    CheckIcon, 
    ClipboardCopyIcon, 
    ClipboardIcon,
    ReloadIcon, 
    UpdateIcon 
} from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onApplyChanges}
                            disabled={!isOptimizationComplete}
                        >
                            <CheckIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Apply changes</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onRevertChanges}
                            disabled={!isOptimizationComplete}
                        >
                            <ReloadIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Revert changes</TooltipContent>
                </Tooltip>
            </div>

            <div className="flex items-center gap-2 border-l pl-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onCopy}
                        >
                            <ClipboardCopyIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy to clipboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onPaste}
                        >
                            <ClipboardIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paste from clipboard</TooltipContent>
                </Tooltip>
            </div>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        onClick={onOptimize} 
                        disabled={isLoading}
                        className="w-[120px] justify-center"
                    >
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <UpdateIcon className="h-4 w-4 animate-spin" />
                                    <span>Optimizing</span>
                                </>
                            ) : (
                                <>
                                    <ReloadIcon className="h-4 w-4" />
                                    <span>Optimize</span>
                                </>
                            )}
                        </div>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Optimize text with AI</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default EditorControls;
