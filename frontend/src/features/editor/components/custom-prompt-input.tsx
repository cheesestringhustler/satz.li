import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '../context/config-context';

interface CustomPromptInputProps {
    customPrompt: string;
    setCustomPrompt: (customPrompt: string) => void;
    onOptimize: () => void;
}

const CustomPromptInput = ({ customPrompt, setCustomPrompt, onOptimize }: CustomPromptInputProps) => {
    const { toast } = useToast();
    const { requestLimits } = useConfig();
    const templatePrompts = [
        "Make it shorter",
        "Use simpler language",
        "Use passive voice",
        "Improve flow",
        "Make it more formal",
    ];

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

    const handleTemplateClick = (prompt: string) => {
        // If prompt is already included, remove it
        if (customPrompt.includes(prompt)) {
            const prompts = customPrompt.split('; ').filter(p => p !== prompt);
            setCustomPrompt(prompts.join('; '));
        } else {
            // Add new prompt, joining with semicolon if there are existing prompts
            const newPrompt = customPrompt 
                ? `${customPrompt}; ${prompt}`
                : prompt;
            
            // Check if adding the template would exceed the limit
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
        <div className='flex flex-col gap-2 flex-1'>
            <div className="flex flex-col gap-1">
                <Input
                    id="customPrompt"
                    type="text"
                    placeholder="Provide an optional prompt such as 'use passive voice' or 'make it shorter'"
                    value={customPrompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={requestLimits.defaultMaxPromptChars}
                />
                <div className="text-xs text-muted-foreground text-right">
                    {customPrompt.length}/{requestLimits.defaultMaxPromptChars}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {templatePrompts.map((prompt, index) => (
                    <Button
                        key={index}
                        variant={customPrompt.includes(prompt) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTemplateClick(prompt)}
                    >
                        {prompt}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default CustomPromptInput;
