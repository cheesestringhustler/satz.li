import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomPromptInputProps {
    customPrompt: string;
    setCustomPrompt: (customPrompt: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function CustomPromptInput({ customPrompt, setCustomPrompt, onKeyDown }: CustomPromptInputProps) {
    return (
        <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor="customPrompt">Custom Prompt</Label>
            <Input
                id="customPrompt"
                type="text" 
                placeholder="Provide instructions such as 'use passive voice' or 'make it shorter'" 
                value={customPrompt} 
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={onKeyDown}
            />
        </div>
    );
}
