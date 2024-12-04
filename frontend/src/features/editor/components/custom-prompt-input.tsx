import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '../context/config-context';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export const templatePrompts = [
    "Make it shorter",
    "Use simpler language",
    "Use passive voice",
    "Improve flow",
    "Make it more formal",
] as const;

export type TemplatePrompt = typeof templatePrompts[number];

export interface CustomPromptInputProps {
    customPrompt: string;
    setCustomPrompt: (customPrompt: string) => void;
    onOptimize: () => void;
    className?: string;
}

export function CustomPromptInput({
    customPrompt,
    setCustomPrompt,
    onOptimize,
    className
}: CustomPromptInputProps) {
    const { toast } = useToast();
    const { requestLimits } = useConfig();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onOptimize();
        }
    };

    const handlePromptChange = (value: string) => {
        if (value.length > requestLimits.defaultMaxPromptChars) {
            toast({
                variant: "destructive",
                title: "Character limit exceeded",
                description: `Prompts are limited to ${requestLimits.defaultMaxPromptChars} characters.`,
            });
            return;
        }
        setCustomPrompt(value);
    };

    const handleTemplateClick = (prompt: TemplatePrompt) => {
        if (customPrompt.includes(prompt)) {
            const prompts = customPrompt.split('; ').filter(p => p !== prompt);
            setCustomPrompt(prompts.join('; '));
        } else {
            const newPrompt = customPrompt
                ? `${customPrompt}; ${prompt}`
                : prompt;

            if (newPrompt.length > requestLimits.defaultMaxPromptChars) {
                toast({
                    variant: "destructive",
                    title: "Character limit exceeded",
                    description: `Adding this template would exceed the ${requestLimits.defaultMaxPromptChars} character limit.`,
                });
                return;
            }
            setCustomPrompt(newPrompt);
        }
    };

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="customPrompt">Prompt</Label>
                </div>
                <Input
                    id="customPrompt"
                    type="text"
                    placeholder="Provide an optional prompt such as 'use passive voice' or 'make it shorter'"
                    value={customPrompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={requestLimits.defaultMaxPromptChars}
                    className="min-w-[300px]"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {templatePrompts.map((prompt) => (
                    <Button
                        key={prompt}
                        variant={customPrompt.includes(prompt) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTemplateClick(prompt)}
                        className="h-7 px-2 text-xs"
                    >
                        {prompt}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default CustomPromptInput;
