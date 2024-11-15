import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CustomPromptInputProps {
    customPrompt: string;
    setCustomPrompt: (customPrompt: string) => void;
    onOptimize: () => void;
}

const CustomPromptInput = ({ customPrompt, setCustomPrompt, onOptimize }: CustomPromptInputProps) => {
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
            setCustomPrompt(newPrompt);
        }
    };

    return (
        <div className='flex flex-col gap-2 flex-1'>
            <Input
                id="customPrompt"
                type="text"
                placeholder="Provide an optional prompt such as 'use passive voice' or 'make it shorter'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
            />
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
